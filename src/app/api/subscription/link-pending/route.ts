import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { updateUserSubscription, setStripeCustomerId } from '@/lib/subscription'
import { SubscriptionTier, SubscriptionStatus } from '@/types/subscription'

/**
 * POST /api/subscription/link-pending
 *
 * This endpoint checks if the current user has a pending Stripe subscription
 * that wasn't linked during checkout (e.g., user paid before signing up).
 * If found, it links the subscription to their account.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    let user;
    try {
      const { data, error: authError } = await supabase.auth.getUser()
      if (authError || !data?.user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
      user = data.user
    } catch (authErr) {
      console.error('Auth error in link-pending:', authErr)
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      )
    }

    // Check if user already has a subscription
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, stripe_subscription_id, subscription_tier')
      .eq('id', user.id)
      .single()

    if (profile?.stripe_subscription_id && profile.subscription_tier !== 'free') {
      return NextResponse.json({
        success: true,
        message: 'Subscription already linked',
        alreadyLinked: true,
      })
    }

    // Search for Stripe customers with this email that need linking
    let customers;
    try {
      customers = await stripe.customers.list({
        email: user.email,
        limit: 10,
      })
    } catch (stripeErr) {
      console.error('Stripe customers.list error:', stripeErr)
      // Return success with no linking - don't block the user
      return NextResponse.json({
        success: true,
        message: 'Could not check for pending subscriptions',
        linked: false,
      })
    }

    let linkedSubscription = null

    for (const customer of customers.data) {
      // Check if this customer has pending linking metadata
      const needsLinking = customer.metadata?.needs_linking === 'true'
      const pendingEmail = customer.metadata?.pending_email

      if (needsLinking && pendingEmail?.toLowerCase() === user.email?.toLowerCase()) {
        // Get active subscription for this customer
        const subscriptions = await stripe.subscriptions.list({
          customer: customer.id,
          status: 'active',
          limit: 1,
        })

        if (subscriptions.data.length > 0) {
          const subscription = subscriptions.data[0]
          const priceId = subscription.items.data[0].price.id

          // Determine tier from price
          const tier = await getTierFromPriceId(priceId)

          // Link the subscription to user
          await setStripeCustomerId(user.id, customer.id)

          const subscriptionData = subscription as any
          await updateUserSubscription(user.id, {
            tier,
            status: subscription.status as SubscriptionStatus,
            stripeSubscriptionId: subscription.id,
            stripePriceId: priceId,
            currentPeriodStart: new Date(subscriptionData.current_period_start * 1000),
            currentPeriodEnd: new Date(subscriptionData.current_period_end * 1000),
            cancelAtPeriodEnd: subscriptionData.cancel_at_period_end,
          })

          // Clear the pending metadata
          await stripe.customers.update(customer.id, {
            metadata: {
              needs_linking: 'false',
              linked_user_id: user.id,
              linked_at: new Date().toISOString(),
            }
          })

          linkedSubscription = {
            tier,
            status: subscription.status,
            customerId: customer.id,
            subscriptionId: subscription.id,
          }

          console.log(`Successfully linked subscription ${subscription.id} to user ${user.id}`)
          break
        }
      }
    }

    if (linkedSubscription) {
      return NextResponse.json({
        success: true,
        message: 'Subscription successfully linked to your account',
        linked: true,
        subscription: linkedSubscription,
      })
    }

    // No pending subscription found
    return NextResponse.json({
      success: true,
      message: 'No pending subscription found for this email',
      linked: false,
    })

  } catch (error) {
    console.error('Error linking pending subscription:', error)
    return NextResponse.json(
      { error: 'Failed to link subscription' },
      { status: 500 }
    )
  }
}

/**
 * Helper: Get subscription tier from Stripe price ID
 */
async function getTierFromPriceId(priceId: string): Promise<SubscriptionTier> {
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

  return 'starter'
}
