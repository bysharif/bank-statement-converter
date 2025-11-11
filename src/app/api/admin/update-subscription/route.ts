import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PLAN_FEATURES } from '@/types/subscription'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { tier } = await request.json()

    if (!tier || !['free', 'starter', 'professional', 'business'].includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid tier provided' },
        { status: 400 }
      )
    }

    // Get tier-specific features
    const features = PLAN_FEATURES[tier as 'free' | 'starter' | 'professional' | 'business']

    // Update user subscription
    const { data, error } = await supabase
      .from('profiles')
      .update({
        subscription_tier: tier,
        subscription_status: 'active',
        conversions_limit: features.conversionsLimit,
        allowed_export_formats: features.exportFormats,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating subscription:', error)
      return NextResponse.json(
        { error: 'Failed to update subscription' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Successfully updated to ${tier} tier`,
      subscription: {
        tier: tier,
        conversionsLimit: features.conversionsLimit,
        exportFormats: features.exportFormats,
      },
    })
  } catch (error) {
    console.error('Admin update subscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
