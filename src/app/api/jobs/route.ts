import { NextRequest, NextResponse } from 'next/server'
import { JobManager } from '@/lib/job-manager'
import { requireAuth } from '@/lib/auth-utils'

export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const { user } = await requireAuth()

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')

    // Get user jobs with pagination
    const jobs = await JobManager.getUserJobs(user.id, limit)
    const stats = await JobManager.getUserStats(user.id)
    const limits = await JobManager.checkUserLimits(user.id)

    return NextResponse.json({
      success: true,
      data: {
        jobs,
        stats,
        limits: {
          canProcess: limits.canProcess,
          daily: {
            used: limits.dailyCount,
            limit: limits.planLimits.daily === -1 ? 'unlimited' : limits.planLimits.daily
          },
          monthly: {
            used: limits.monthlyCount,
            limit: limits.planLimits.monthly === -1 ? 'unlimited' : limits.planLimits.monthly
          }
        },
        pagination: {
          page,
          limit,
          totalItems: stats.totalJobs
        }
      }
    })

  } catch (error) {
    console.error('Get jobs error:', error)

    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      {
        error: 'Failed to get jobs',
        success: false
      },
      { status: 500 }
    )
  }
}