import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getOrCreateStripeCustomer,
  createCheckoutSession,
  STRIPE_PRICE_IDS,
} from '@/lib/stripe'
import { setStripeCustomerId } from '@/lib/subscription'
import { SubscriptionTier } from '@/types/subscription'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in first.' },
        { status: 401 }
      )
    }

    const { tier } = await request.json()

    // Validate tier
    if (!tier || !['starter', 'professional', 'business'].includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid tier. Must be: starter, professional, or business' },
        { status: 400 }
      )
    }

    // Get price ID for the tier
    const priceId = STRIPE_PRICE_IDS[tier as Exclude<SubscriptionTier, 'free'>]

    if (!priceId) {
      console.error(`Price ID not configured for tier: ${tier}`)
      return NextResponse.json(
        { error: 'Payment configuration error. Please contact support.' },
        { status: 500 }
      )
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, stripe_customer_id')
      .eq('id', user.id)
      .single()

    // Get or create Stripe customer
    let customerId = profile?.stripe_customer_id

    if (!customerId) {
      customerId = await getOrCreateStripeCustomer(
        user.id,
        user.email!,
        profile?.full_name || undefined
      )

      // Save customer ID to database immediately
      await setStripeCustomerId(user.id, customerId)
    }

    // Build success/cancel URLs
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL
    const successUrl = `${origin}/dashboard/billing?success=true&session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = `${origin}/dashboard/billing?canceled=true`

    // Create checkout session with user context
    const session = await createCheckoutSession({
      customerId,
      priceId,
      successUrl,
      cancelUrl,
      metadata: {
        userId: user.id,
        email: user.email!,
        tier,
      },
    })

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    })
  } catch (error) {
    console.error('Checkout session creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
