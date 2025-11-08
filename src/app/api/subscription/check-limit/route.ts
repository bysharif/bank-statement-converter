import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { canUserConvert, getUserUsageStats } from '@/lib/subscription'

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

    // Check if user can convert
    const canConvert = await canUserConvert(user.id)

    // Get usage stats
    const usageStats = await getUserUsageStats(user.id)

    if (!usageStats) {
      return NextResponse.json(
        { error: 'Could not fetch usage stats' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      canConvert,
      ...usageStats,
    })
  } catch (error) {
    console.error('Error checking conversion limit:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
