'use client'

import { useState, useEffect } from 'react'
import { Zap, FileText, CheckCircle, X, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface ProcessingStatusProps {
  state: 'uploading' | 'processing'
  file: File | null
  onCancel: () => void
}

export function ProcessingStatus({ state, file, onCancel }: ProcessingStatusProps) {
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState('Analyzing file format...')

  useEffect(() => {
    if (state === 'uploading') {
      setProgress(15)
      setCurrentStep('Uploading file...')
    } else if (state === 'processing') {
      // Simulate processing steps
      const steps = [
        { progress: 25, step: 'Analyzing file format...' },
        { progress: 40, step: 'Extracting transaction data...' },
        { progress: 60, step: 'Categorizing transactions...' },
        { progress: 75, step: 'Removing duplicates...' },
        { progress: 90, step: 'Validating data integrity...' },
        { progress: 100, step: 'Processing complete!' }
      ]

      let currentIndex = 0
      const interval = setInterval(() => {
        if (currentIndex < steps.length) {
          setProgress(steps[currentIndex].progress)
          setCurrentStep(steps[currentIndex].step)
          currentIndex++
        } else {
          clearInterval(interval)
        }
      }, 500)

      return () => clearInterval(interval)
    }
  }, [state])

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-uk-blue-600 rounded-xl flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Processing Statement</h2>
            <p className="text-gray-600">{file?.name || 'Unknown file'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-uk-blue-100 text-uk-blue-800">
            {state === 'uploading' ? 'Uploading...' : 'Processing...'}
          </Badge>
          <Button variant="outline" size="sm" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">{currentStep}</span>
          <span className="text-sm text-gray-500">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-uk-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* File Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-900">File Details</span>
          </div>
          <div className="space-y-1 text-sm text-gray-600">
            <div>Size: {file ? (file.size / 1024 / 1024).toFixed(2) : '0'} MB</div>
            <div>Type: {file?.type || 'Unknown'}</div>
            <div>Format: {file?.name.split('.').pop()?.toUpperCase() || 'Unknown'}</div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-uk-blue-600" />
            <span className="text-sm font-medium text-gray-900">AI Processing</span>
          </div>
          <div className="space-y-1 text-sm text-gray-600">
            <div>Engine: GPT-4 Financial</div>
            <div>Accuracy: 99.6%</div>
            <div>Speed: Real-time</div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-uk-green-600" />
            <span className="text-sm font-medium text-gray-900">Security</span>
          </div>
          <div className="space-y-1 text-sm text-gray-600">
            <div>Encryption: AES-256</div>
            <div>Storage: None</div>
            <div>Compliance: GDPR</div>
          </div>
        </div>
      </div>

      {/* Processing Activity */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-900">Processing Activity</h3>
        <div className="space-y-2">
          {[
            { step: 'File uploaded successfully', status: 'completed', time: '2s ago' },
            { step: 'Bank format detected: HSBC Current Account', status: 'completed', time: '1s ago' },
            { step: 'Extracting transaction data', status: progress >= 40 ? 'completed' : 'active', time: 'now' },
            { step: 'Categorizing transactions', status: progress >= 60 ? 'completed' : progress >= 40 ? 'active' : 'pending', time: '' },
            { step: 'Removing duplicate entries', status: progress >= 75 ? 'completed' : progress >= 60 ? 'active' : 'pending', time: '' },
            { step: 'Validating data integrity', status: progress >= 90 ? 'completed' : progress >= 75 ? 'active' : 'pending', time: '' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center gap-3 text-sm">
              {activity.status === 'completed' ? (
                <CheckCircle className="w-4 h-4 text-uk-green-600" />
              ) : activity.status === 'active' ? (
                <div className="w-4 h-4 bg-uk-blue-600 rounded-full animate-pulse"></div>
              ) : (
                <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
              )}
              <span className={`flex-1 ${activity.status === 'completed' ? 'text-gray-700' : activity.status === 'active' ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                {activity.step}
              </span>
              {activity.time && (
                <span className="text-gray-500 text-xs">{activity.time}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Security Notice */}
      <div className="mt-6 p-4 bg-uk-green-50 rounded-lg flex items-center gap-3">
        <CheckCircle className="w-5 h-5 text-uk-green-600" />
        <div className="text-sm">
          <p className="font-medium text-uk-green-900">Processing securely</p>
          <p className="text-uk-green-700">Your file is being processed in a secure environment and will be automatically deleted after conversion.</p>
        </div>
      </div>
    </div>
  )
}