'use client'

import { FileText, Clock, CheckCircle, TrendingUp } from 'lucide-react'

export function StatsWidgets() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Statements Processed */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-uk-blue-100 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-uk-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Statements Processed</p>
            <p className="text-2xl font-bold text-gray-900">12</p>
            <p className="text-xs text-gray-500">This month</p>
          </div>
        </div>
      </div>

      {/* Total Transactions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-uk-green-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-uk-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Transactions</p>
            <p className="text-2xl font-bold text-gray-900">14,892</p>
            <p className="text-xs text-gray-500">All time</p>
          </div>
        </div>
      </div>

      {/* Time Saved */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <Clock className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Time Saved</p>
            <p className="text-2xl font-bold text-gray-900">23.5</p>
            <p className="text-xs text-gray-500">Hours this month</p>
          </div>
        </div>
      </div>

      {/* Accuracy Rate */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-uk-green-100 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-uk-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Accuracy Rate</p>
            <p className="text-2xl font-bold text-gray-900">99.6%</p>
            <p className="text-xs text-gray-500">Average</p>
          </div>
        </div>
      </div>
    </div>
  )
}