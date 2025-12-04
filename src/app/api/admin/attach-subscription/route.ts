import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PLAN_FEATURES, SubscriptionTier } from '@/types/subscription'

// List of admin emails (should be moved to env var or database in production)
const ADMIN_EMAILS = [
  'sharif@myfocus.co',
  // Add other admin emails here
]

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user (must be authenticated)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is an admin
    if (!ADMIN_EMAILS.includes(user.email?.toLowerCase() || '')) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      )
    }

    const { email, tier, stripeCustomerId, stripeSubscriptionId } =
      await request.json()

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    if (!tier || !['free', 'starter', 'professional', 'business'].includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid tier. Must be: free, starter, professional, or business' },
        { status: 400 }
      )
    }

    // Find user by email (case-insensitive)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, subscription_tier, stripe_customer_id')
      .ilike('email', email)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: `User not found with email: ${email}` },
        { status: 404 }
      )
    }

    // Get tier-specific features
    const features = PLAN_FEATURES[tier as SubscriptionTier]

    // Update user subscription
    const updateData: Record<string, unknown> = {
      subscription_tier: tier,
      subscription_status: 'active',
      conversions_limit: features.conversionsLimit,
      allowed_export_formats: features.exportFormats,
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      ).toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Optionally set Stripe IDs if provided
    if (stripeCustomerId) {
      updateData.stripe_customer_id = stripeCustomerId
    }
    if (stripeSubscriptionId) {
      updateData.stripe_subscription_id = stripeSubscriptionId
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
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

    console.log(
      `Admin ${user.email} attached ${tier} subscription to ${email}`
    )

    return NextResponse.json({
      success: true,
      message: `Successfully attached ${tier} tier to ${email}`,
      user: {
        id: profile.id,
        email: profile.email,
        previousTier: profile.subscription_tier,
        newTier: tier,
        conversionsLimit: features.conversionsLimit,
        exportFormats: features.exportFormats,
      },
    })
  } catch (error) {
    console.error('Admin attach subscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
