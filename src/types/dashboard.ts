export interface User {
  id: string
  email: string
  name: string
  company?: string
  plan: 'free' | 'starter' | 'professional' | 'business'
  usage: UsageMetrics
  createdAt: Date
  avatar?: string
}

export interface UsageMetrics {
  conversionsUsed: number
  conversionsLimit: number
  dataProcessed: number // in MB
  apiCallsUsed?: number
  apiCallsLimit?: number
  storageUsed: number // in MB
  storageLimit: number // in MB
}

export interface ProcessingJob {
  id: string
  fileName: string
  fileSize: number
  bank: string
  status: ProcessingStatus
  progress: number
  createdAt: Date
  completedAt?: Date
  estimatedTime?: number
  errorMessage?: string
}

export type ProcessingStatus =
  | "uploading"
  | "processing"
  | "converting"
  | "complete"
  | "error"

export interface ConvertedFile {
  id: string
  originalName: string
  bank: string
  exportFormat: ExportFormat
  downloadUrl: string
  createdAt: Date
  expiresAt: Date
  fileSize: number
  transactionCount: number
  status: 'ready' | 'expired' | 'processing'
}

export type ExportFormat = "csv" | "excel" | "qbo" | "ofx"

export interface DashboardStats {
  monthlyConversions: number
  remainingQuota: number
  successRate: number
  avgProcessingTime: string
}

export interface ActivityItem {
  id: string
  type: 'conversion' | 'download' | 'error' | 'upgrade'
  title: string
  description: string
  timestamp: Date
  status: 'success' | 'error' | 'pending'
  fileName?: string
  bank?: string
}

export interface ChartDataPoint {
  date: string
  conversions: number
  value?: number
}

export interface ApiKey {
  id: string
  name: string
  key: string
  createdAt: Date
  lastUsed?: Date
  isActive: boolean
  permissions: string[]
  usageCount: number
}

export interface TeamMember {
  id: string
  name: string
  email: string
  role: 'owner' | 'admin' | 'member' | 'viewer'
  lastActivity: Date
  status: 'active' | 'invited' | 'suspended'
  avatar?: string
}

export interface BankOption {
  value: string
  label: string
  logo?: string
}