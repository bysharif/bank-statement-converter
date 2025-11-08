import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createPortalSession, getOrCreateStripeCustomer } from '@/lib/stripe'
import { getUserSubscription } from '@/lib/subscription'

export async function POST(req: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's subscription
    const subscription = await getUserSubscription(user.id)

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }

    let customerId = subscription.stripeCustomerId

    // If user doesn't have a Stripe customer ID yet, create one
    if (!customerId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', user.id)
        .single()

      if (!profile) {
        return NextResponse.json(
          { error: 'User profile not found' },
          { status: 404 }
        )
      }

      customerId = await getOrCreateStripeCustomer(
        user.id,
        profile.email,
        profile.full_name || undefined
      )

      // Update profile with customer ID
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    // Create portal session
    const returnUrl = `${req.nextUrl.origin}/dashboard/billing`
    const portalSession = await createPortalSession(customerId, returnUrl)

    return NextResponse.json({ url: portalSession.url })
  } catch (error) {
    console.error('Error creating portal session:', error)
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    )
  }
}
