'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface ProcessingStep {
  id: string
  title: string
  description: string
  status: 'pending' | 'processing' | 'completed' | 'error'
}

export function ProcessingSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)

  const [steps, setSteps] = useState<ProcessingStep[]>([
    {
      id: 'upload',
      title: 'File Upload',
      description: 'Securely receiving your bank statement',
      status: 'pending'
    },
    {
      id: 'analysis',
      title: 'Document Analysis',
      description: 'Identifying bank format and transaction patterns',
      status: 'pending'
    },
    {
      id: 'extraction',
      title: 'Data Extraction',
      description: 'Extracting transaction data with high accuracy',
      status: 'pending'
    },
    {
      id: 'conversion',
      title: 'Format Conversion',
      description: 'Converting to your selected output format',
      status: 'pending'
    },
    {
      id: 'validation',
      title: 'Data Validation',
      description: 'Ensuring accuracy and completeness',
      status: 'pending'
    },
    {
      id: 'complete',
      title: 'Ready for Download',
      description: 'Your converted file is ready',
      status: 'pending'
    }
  ])

  const startDemo = async () => {
    setIsVisible(true)
    setProgress(0)
    setCurrentStep(0)

    // Reset all steps
    setSteps(prev => prev.map(step => ({ ...step, status: 'pending' })))

    // Simulate processing
    for (let i = 0; i < steps.length; i++) {
      // Update current step to processing
      setSteps(prev => prev.map((step, index) => ({
        ...step,
        status: index === i ? 'processing' : index < i ? 'completed' : 'pending'
      })))
      setCurrentStep(i)

      // Simulate step duration
      const stepDuration = 800 + Math.random() * 400 // 800-1200ms per step
      const stepStart = Date.now()

      while (Date.now() - stepStart < stepDuration) {
        const stepProgress = (Date.now() - stepStart) / stepDuration
        const totalProgress = ((i + stepProgress) / steps.length) * 100
        setProgress(totalProgress)
        await new Promise(resolve => setTimeout(resolve, 50))
      }

      // Mark step as completed
      setSteps(prev => prev.map((step, index) => ({
        ...step,
        status: index <= i ? 'completed' : 'pending'
      })))
      setProgress(((i + 1) / steps.length) * 100)
    }
  }

  const getStepIcon = (status: ProcessingStep['status']) => {
    switch (status) {
      case 'completed':
        return <div className="w-6 h-6 bg-uk-green-100 text-uk-green-700 rounded-full flex items-center justify-center text-sm">✓</div>
      case 'processing':
        return <div className="w-6 h-6 bg-uk-blue-100 text-uk-blue-700 rounded-full flex items-center justify-center text-sm animate-spin">⟳</div>
      case 'error':
        return <div className="w-6 h-6 bg-red-100 text-red-700 rounded-full flex items-center justify-center text-sm">✕</div>
      default:
        return <div className="w-6 h-6 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center text-sm">○</div>
    }
  }

  if (!isVisible) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              See How It Works
            </h2>
            <p className="text-gray-600 mb-8">
              Watch our secure processing pipeline convert your bank statement in real-time
            </p>
            <Button onClick={startDemo} size="lg" variant="outline">
              View Demo Processing
            </Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Processing Your Statement
            </h2>
            <p className="text-gray-600">
              Converting your bank statement with bank-grade security
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Conversion Progress</CardTitle>
                <Badge variant={progress === 100 ? "success" : "secondary"}>
                  {Math.round(progress)}% Complete
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Progress value={progress} className="mb-4" />
              <div className="text-sm text-gray-600">
                {progress === 100
                  ? 'Conversion completed successfully!'
                  : `Processing step ${currentStep + 1} of ${steps.length}...`
                }
              </div>
            </CardContent>
          </Card>

          {/* Processing Steps */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`flex items-start space-x-4 p-4 rounded-lg transition-colors ${
                      step.status === 'processing'
                        ? 'bg-uk-blue-50 border border-uk-blue-200'
                        : step.status === 'completed'
                        ? 'bg-uk-green-50 border border-uk-green-200'
                        : 'bg-gray-50'
                    }`}
                  >
                    {getStepIcon(step.status)}
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-medium ${
                        step.status === 'processing' ? 'text-uk-blue-900' :
                        step.status === 'completed' ? 'text-uk-green-900' :
                        'text-gray-900'
                      }`}>
                        {step.title}
                      </h3>
                      <p className={`text-sm ${
                        step.status === 'processing' ? 'text-uk-blue-700' :
                        step.status === 'completed' ? 'text-uk-green-700' :
                        'text-gray-600'
                      }`}>
                        {step.description}
                      </p>
                    </div>
                    {step.status === 'processing' && (
                      <Badge variant="secondary" className="text-xs">
                        Processing...
                      </Badge>
                    )}
                    {step.status === 'completed' && (
                      <Badge variant="success" className="text-xs">
                        Done
                      </Badge>
                    )}
                  </div>
                ))}
              </div>

              {progress === 100 && (
                <div className="mt-6 pt-6 border-t text-center">
                  <Button className="bg-uk-green-700 hover:bg-uk-green-800">
                    Download Converted File
                  </Button>
                  <p className="text-sm text-gray-600 mt-2">
                    Your file has been processed locally and is ready for download
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security Notice */}
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 text-sm text-gray-600 bg-white px-4 py-2 rounded-lg border">
              <div className="w-4 h-4 text-uk-blue-600">🔒</div>
              All processing happens locally in your browser - your data never leaves your device
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}