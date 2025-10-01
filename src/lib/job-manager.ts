import { ConversionResult } from './converter'
import { prisma } from './prisma'

export interface ConversionJob {
  id: string
  userId: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  fileName: string
  fileSize: number
  createdAt: Date
  completedAt?: Date
  result?: ConversionResult
  error?: string
  progress?: number
}

export class JobManager {
  static async createJob(userId: string, fileName: string, fileSize: number): Promise<string> {
    const job = await prisma.conversionJob.create({
      data: {
        userId,
        fileName,
        fileSize,
        status: 'pending'
      }
    })

    return job.id
  }

  static async getJob(jobId: string): Promise<ConversionJob | null> {
    const job = await prisma.conversionJob.findUnique({
      where: { id: jobId }
    })

    if (!job) return null

    return {
      id: job.id,
      userId: job.userId,
      status: job.status as ConversionJob['status'],
      fileName: job.fileName,
      fileSize: job.fileSize,
      createdAt: job.createdAt,
      completedAt: job.completedAt || undefined,
      result: job.result ? JSON.parse(job.result) : undefined,
      error: job.error || undefined,
      progress: 0 // We'll calculate this based on status
    }
  }

  static async getUserJobs(userId: string, limit: number = 50): Promise<ConversionJob[]> {
    const jobs = await prisma.conversionJob.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit
    })

    return jobs.map(job => ({
      id: job.id,
      userId: job.userId,
      status: job.status as ConversionJob['status'],
      fileName: job.fileName,
      fileSize: job.fileSize,
      createdAt: job.createdAt,
      completedAt: job.completedAt || undefined,
      result: job.result ? JSON.parse(job.result) : undefined,
      error: job.error || undefined,
      progress: job.status === 'completed' ? 100 : job.status === 'processing' ? 50 : 0
    }))
  }

  static async updateJob(jobId: string, updates: {
    status?: ConversionJob['status']
    result?: ConversionResult
    error?: string
    completedAt?: Date
  }): Promise<void> {
    await prisma.conversionJob.update({
      where: { id: jobId },
      data: {
        ...updates,
        result: updates.result ? JSON.stringify(updates.result) : undefined
      }
    })
  }

  static async completeJob(jobId: string, result: ConversionResult): Promise<void> {
    await this.updateJob(jobId, {
      status: 'completed',
      result,
      completedAt: new Date()
    })
  }

  static async failJob(jobId: string, error: string): Promise<void> {
    await this.updateJob(jobId, {
      status: 'failed',
      error,
      completedAt: new Date()
    })
  }

  static async setProcessing(jobId: string): Promise<void> {
    await this.updateJob(jobId, {
      status: 'processing'
    })
  }

  // Clean up old jobs (older than 7 days)
  static async cleanupOldJobs(): Promise<number> {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    const result = await prisma.conversionJob.deleteMany({
      where: {
        createdAt: { lt: sevenDaysAgo }
      }
    })

    return result.count
  }

  // Get job statistics for a user
  static async getUserStats(userId: string): Promise<{
    totalJobs: number
    completedJobs: number
    failedJobs: number
    processingJobs: number
    totalFilesProcessed: number
  }> {
    const [totalJobs, completedJobs, failedJobs, processingJobs] = await Promise.all([
      prisma.conversionJob.count({ where: { userId } }),
      prisma.conversionJob.count({ where: { userId, status: 'completed' } }),
      prisma.conversionJob.count({ where: { userId, status: 'failed' } }),
      prisma.conversionJob.count({
        where: { userId, status: { in: ['pending', 'processing'] } }
      })
    ])

    return {
      totalJobs,
      completedJobs,
      failedJobs,
      processingJobs,
      totalFilesProcessed: completedJobs
    }
  }

  // Check user's plan limits
  static async checkUserLimits(userId: string): Promise<{
    canProcess: boolean
    dailyCount: number
    monthlyCount: number
    planLimits: { daily: number; monthly: number }
  }> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      throw new Error('User not found')
    }

    // Define plan limits
    const planLimits = {
      free: { daily: 5, monthly: 20 },
      pro: { daily: 50, monthly: 500 },
      enterprise: { daily: -1, monthly: -1 } // Unlimited
    }

    const limits = planLimits[user.plan as keyof typeof planLimits] || planLimits.free

    // Get today's and this month's job counts
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const thisMonth = new Date()
    thisMonth.setDate(1)
    thisMonth.setHours(0, 0, 0, 0)

    const [dailyCount, monthlyCount] = await Promise.all([
      prisma.conversionJob.count({
        where: {
          userId,
          createdAt: { gte: today }
        }
      }),
      prisma.conversionJob.count({
        where: {
          userId,
          createdAt: { gte: thisMonth }
        }
      })
    ])

    const canProcess = limits.daily === -1 || (
      (limits.daily === -1 || dailyCount < limits.daily) &&
      (limits.monthly === -1 || monthlyCount < limits.monthly)
    )

    return {
      canProcess,
      dailyCount,
      monthlyCount,
      planLimits: limits
    }
  }
}