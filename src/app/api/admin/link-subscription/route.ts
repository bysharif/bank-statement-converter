import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { updateUserSubscription, setStripeCustomerId } from '@/lib/subscription'
import { SubscriptionTier, SubscriptionStatus, PLAN_FEATURES } from '@/types/subscription'

/**
 * POST /api/admin/link-subscription
 *
 * Admin endpoint to manually link a Stripe subscription to a user.
 * This is useful when a user paid through Stripe before signing up.
 *
 * Required body:
 * - userEmail: The user's email address in your system
 * - stripeCustomerEmail: The email used for Stripe payment (if different)
 * - tier: The subscription tier to assign
 *
 * Optional body:
 * - stripeCustomerId: If known, the Stripe customer ID
 * - stripeSubscriptionId: If known, the Stripe subscription ID
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // SECURITY: Verify admin API key
    const authHeader = request.headers.get('x-admin-api-key')
    const adminApiKey = process.env.ADMIN_API_KEY

    if (!adminApiKey) {
      console.error('ADMIN_API_KEY not configured')
      return NextResponse.json(
        { error: 'Admin endpoint not configured' },
        { status: 500 }
      )
    }

    if (!authHeader || authHeader !== adminApiKey) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid admin credentials' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { userEmail, stripeCustomerEmail, tier, stripeCustomerId, stripeSubscriptionId } = body

    if (!userEmail || !tier) {
      return NextResponse.json(
        { error: 'userEmail and tier are required' },
        { status: 400 }
      )
    }

    if (!['free', 'starter', 'professional', 'business'].includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid tier. Must be: free, starter, professional, or business' },
        { status: 400 }
      )
    }

    // Find the user by email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, stripe_customer_id')
      .eq('email', userEmail.toLowerCase())
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: `User not found with email: ${userEmail}` },
        { status: 404 }
      )
    }

    // If stripeCustomerId provided, use it; otherwise search by email
    let customerId = stripeCustomerId || profile.stripe_customer_id
    let subscriptionId = stripeSubscriptionId

    // Search for Stripe customer if not provided
    if (!customerId) {
      const searchEmail = stripeCustomerEmail || userEmail
      const customers = await stripe.customers.list({
        email: searchEmail,
        limit: 1,
      })

      if (customers.data.length > 0) {
        customerId = customers.data[0].id
      }
    }

    // If we found a customer, look for their subscription
    if (customerId && !subscriptionId) {
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'active',
        limit: 1,
      })

      if (subscriptions.data.length > 0) {
        subscriptionId = subscriptions.data[0].id
      }
    }

    // Get tier-specific features
    const features = PLAN_FEATURES[tier as SubscriptionTier]

    // Update user subscription
    if (customerId) {
      await setStripeCustomerId(profile.id, customerId)
    }

    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    const { data, error } = await supabase
      .from('profiles')
      .update({
        subscription_tier: tier,
        subscription_status: 'active',
        stripe_customer_id: customerId || profile.stripe_customer_id,
        stripe_subscription_id: subscriptionId || null,
        conversions_limit: features.conversionsLimit,
        allowed_export_formats: features.exportFormats,
        conversions_used_this_month: 0, // Reset their usage as a courtesy
        current_period_start: now.toISOString(),
        current_period_end: thirtyDaysFromNow.toISOString(),
        updated_at: now.toISOString(),
      })
      .eq('id', profile.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating subscription:', error)
      return NextResponse.json(
        { error: 'Failed to update subscription' },
        { status: 500 }
      )
    }

    // Clear any pending linking metadata in Stripe if we have a customer
    if (customerId) {
      try {
        await stripe.customers.update(customerId, {
          metadata: {
            needs_linking: 'false',
            linked_user_id: profile.id,
            linked_at: now.toISOString(),
            manually_linked: 'true',
          }
        })
      } catch (stripeError) {
        console.error('Failed to update Stripe metadata:', stripeError)
        // Don't fail the operation for this
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully linked ${tier} subscription to ${userEmail}`,
      user: {
        id: profile.id,
        email: profile.email,
      },
      subscription: {
        tier,
        conversionsLimit: features.conversionsLimit,
        exportFormats: features.exportFormats,
        stripeCustomerId: customerId || null,
        stripeSubscriptionId: subscriptionId || null,
        periodEnd: thirtyDaysFromNow.toISOString(),
      },
    })
  } catch (error) {
    console.error('Admin link subscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
