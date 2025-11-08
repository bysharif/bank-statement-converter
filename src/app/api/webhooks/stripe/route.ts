import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe, constructWebhookEvent } from '@/lib/stripe'
import {
  updateUserSubscription,
  resetMonthlyConversions,
  setStripeCustomerId,
} from '@/lib/subscription'
import { SubscriptionTier, SubscriptionStatus } from '@/types/subscription'
import { createClient } from '@/lib/supabase/server'

// Disable body parsing for webhooks
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    )
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET is not set')
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    )
  }

  let event: Stripe.Event

  // Verify webhook signature
  try {
    event = constructWebhookEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }

  console.log(`Received Stripe webhook event: ${event.type}`)

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

/**
 * Handle successful checkout session
 * This activates the subscription after payment
 */
async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session
): Promise<void> {
  console.log('Processing checkout.session.completed:', session.id)

  const customerId = session.customer as string
  const subscriptionId = session.subscription as string

  if (!subscriptionId) {
    console.log('No subscription in checkout session')
    return
  }

  // Get the subscription details
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)

  // Get user ID from metadata or customer email
  const userId = session.client_reference_id || session.metadata?.userId

  if (!userId) {
    // Try to find user by customer email
    const supabase = await createClient()
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', session.customer_details?.email)
      .single()

    if (!profile) {
      console.error('Could not find user for checkout session')
      return
    }

    await handleSubscriptionCreated(subscription, profile.id, customerId)
  } else {
    await handleSubscriptionCreated(subscription, userId, customerId)
  }
}

/**
 * Handle subscription creation
 */
async function handleSubscriptionCreated(
  subscription: Stripe.Subscription,
  userId: string,
  customerId: string
): Promise<void> {
  console.log('Creating subscription for user:', userId)

  // Set Stripe customer ID if not already set
  await setStripeCustomerId(userId, customerId)

  // Get tier from subscription metadata or price metadata
  const priceId = subscription.items.data[0].price.id
  const tier = await getTierFromPriceId(priceId)

  // Update user subscription in database
  // Note: current_period_start/end exist on the API object but aren't in the TS types
  const subscriptionData = subscription as any
  await updateUserSubscription(userId, {
    tier,
    status: subscription.status as SubscriptionStatus,
    stripeSubscriptionId: subscription.id,
    stripePriceId: priceId,
    currentPeriodStart: new Date(subscriptionData.current_period_start * 1000),
    currentPeriodEnd: new Date(subscriptionData.current_period_end * 1000),
    cancelAtPeriodEnd: subscriptionData.cancel_at_period_end,
  })

  console.log(`Subscription activated for user ${userId} with tier ${tier}`)
}

/**
 * Handle subscription updates
 */
async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription
): Promise<void> {
  console.log('Processing subscription update:', subscription.id)

  const customerId = subscription.customer as string
  const userId = await getUserIdFromCustomerId(customerId)

  if (!userId) {
    console.error('Could not find user for customer:', customerId)
    return
  }

  const priceId = subscription.items.data[0].price.id
  const tier = await getTierFromPriceId(priceId)

  // Note: current_period_start/end exist on the API object but aren't in the TS types
  const subscriptionData = subscription as any
  await updateUserSubscription(userId, {
    tier,
    status: subscription.status as SubscriptionStatus,
    stripeSubscriptionId: subscription.id,
    stripePriceId: priceId,
    currentPeriodStart: new Date(subscriptionData.current_period_start * 1000),
    currentPeriodEnd: new Date(subscriptionData.current_period_end * 1000),
    cancelAtPeriodEnd: subscriptionData.cancel_at_period_end,
  })

  console.log(`Subscription updated for user ${userId}`)
}

/**
 * Handle subscription deletion/cancellation
 */
async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
): Promise<void> {
  console.log('Processing subscription deletion:', subscription.id)

  const customerId = subscription.customer as string
  const userId = await getUserIdFromCustomerId(customerId)

  if (!userId) {
    console.error('Could not find user for customer:', customerId)
    return
  }

  // Downgrade to free tier
  // Note: current_period_end exists on the API object but isn't in the TS types
  const subscriptionData = subscription as any
  await updateUserSubscription(userId, {
    tier: 'free',
    status: 'canceled',
    currentPeriodEnd: new Date(subscriptionData.current_period_end * 1000),
  })

  console.log(`Subscription canceled, downgraded user ${userId} to free tier`)
}

/**
 * Handle successful invoice payment (subscription renewal)
 */
async function handleInvoicePaymentSucceeded(
  invoice: Stripe.Invoice
): Promise<void> {
  console.log('Processing invoice.payment_succeeded:', invoice.id)

  // Note: subscription property exists on the API object but isn't in the TS types
  const invoiceData = invoice as any
  const customerId = invoice.customer as string
  const subscriptionId = invoiceData.subscription as string

  if (!subscriptionId) {
    console.log('Invoice not related to subscription')
    return
  }

  const userId = await getUserIdFromCustomerId(customerId)

  if (!userId) {
    console.error('Could not find user for customer:', customerId)
    return
  }

  // Reset monthly conversion count on successful payment
  await resetMonthlyConversions(userId)

  console.log(`Monthly conversions reset for user ${userId}`)
}

/**
 * Handle failed invoice payment
 */
async function handleInvoicePaymentFailed(
  invoice: Stripe.Invoice
): Promise<void> {
  console.log('Processing invoice.payment_failed:', invoice.id)

  const customerId = invoice.customer as string
  const userId = await getUserIdFromCustomerId(customerId)

  if (!userId) {
    console.error('Could not find user for customer:', customerId)
    return
  }

  // Update subscription status to past_due
  await updateUserSubscription(userId, {
    status: 'past_due',
  })

  console.log(`Subscription marked as past_due for user ${userId}`)

  // TODO: Send email notification about failed payment
}

/**
 * Helper: Get user ID from Stripe customer ID
 */
async function getUserIdFromCustomerId(
  customerId: string
): Promise<string | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (error || !data) {
    console.error('Error finding user by customer ID:', error)
    return null
  }

  return data.id
}

/**
 * Helper: Get subscription tier from Stripe price ID
 */
async function getTierFromPriceId(priceId: string): Promise<SubscriptionTier> {
  // Check environment variables for price IDs
  if (priceId === process.env.STRIPE_STARTER_PRICE_ID) {
    return 'starter'
  }
  if (priceId === process.env.STRIPE_PROFESSIONAL_PRICE_ID) {
    return 'professional'
  }
  if (priceId === process.env.STRIPE_BUSINESS_PRICE_ID) {
    return 'business'
  }

  // Fallback: Try to get from price metadata
  try {
    const price = await stripe.prices.retrieve(priceId)
    const tier = price.metadata?.tier as SubscriptionTier

    if (tier && ['starter', 'professional', 'business'].includes(tier)) {
      return tier
    }
  } catch (error) {
    console.error('Error retrieving price metadata:', error)
  }

  // Default to starter if we can't determine
  console.warn(`Could not determine tier for price ${priceId}, defaulting to starter`)
  return 'starter'
}
