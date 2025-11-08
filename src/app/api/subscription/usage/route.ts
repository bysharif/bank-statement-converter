import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserUsageStats, getUserSubscription } from '@/lib/subscription'

export async function GET(req: NextRequest) {
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

    // Get usage stats and subscription
    const [usageStats, subscription] = await Promise.all([
      getUserUsageStats(user.id),
      getUserSubscription(user.id),
    ])

    if (!usageStats || !subscription) {
      return NextResponse.json(
        { error: 'Could not fetch user data' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      subscription: {
        tier: subscription.tier,
        status: subscription.status,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        currentPeriodEnd: subscription.currentPeriodEnd,
      },
      usage: usageStats,
    })
  } catch (error) {
    console.error('Error fetching usage stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
