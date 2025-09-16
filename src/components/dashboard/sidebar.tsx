'use client'

import {
  Upload,
  FileText,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  User,
  Shield,
  Clock
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export function DashboardSidebar() {
  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-uk-blue-600 to-uk-blue-700 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-gray-900">BankConverter</span>
            <span className="text-xs text-gray-500">Dashboard</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-uk-blue-600 bg-uk-blue-50 rounded-lg">
            <Upload className="w-4 h-4" />
            <span>Upload & Convert</span>
          </Link>

          <Link href="/dashboard/history" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
            <FileText className="w-4 h-4" />
            <span>Processing History</span>
          </Link>

          <Link href="/dashboard/analytics" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
            <BarChart3 className="w-4 h-4" />
            <span>Analytics</span>
          </Link>

          <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </Link>
        </div>

        {/* Usage Stats */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Usage This Month</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Statements</span>
              <span className="font-medium">12 / 50</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-uk-blue-600 h-1.5 rounded-full" style={{ width: '24%' }}></div>
            </div>
          </div>
        </div>

        {/* Security Status */}
        <div className="mt-6 p-4 bg-uk-green-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-uk-green-600" />
            <span className="text-sm font-medium text-uk-green-900">Security Active</span>
          </div>
          <div className="flex flex-wrap gap-1">
            <Badge variant="success" className="text-xs">GDPR</Badge>
            <Badge variant="success" className="text-xs">SOC</Badge>
          </div>
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-uk-blue-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-uk-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">John Smith</p>
            <p className="text-xs text-gray-500 truncate">john@company.com</p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <Link href="/help" className="flex items-center gap-2 text-xs text-gray-600 hover:text-gray-900">
            <HelpCircle className="w-3 h-3" />
            <span>Help</span>
          </Link>
          <span className="text-gray-300">•</span>
          <button className="flex items-center gap-2 text-xs text-gray-600 hover:text-gray-900">
            <LogOut className="w-3 h-3" />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </div>
  )
}