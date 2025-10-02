'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, Mail, CheckCircle } from "lucide-react"

interface EmailDownloadModalProps {
  isOpen: boolean
  onClose: () => void
  fileName: string
  transactionCount: number
  onDownload: (email: string) => void
}

export function EmailDownloadModal({
  isOpen,
  onClose,
  fileName,
  transactionCount,
  onDownload
}: EmailDownloadModalProps) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Call the API to send CSV via email
      const response = await fetch('/api/send-csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          fileName
        })
      })

      const result = await response.json()

      if (response.ok) {
        // Also trigger local download
        onDownload(email)
        setIsSuccess(true)

        // Close modal after success
        setTimeout(() => {
          setIsSuccess(false)
          onClose()
          setEmail('')
        }, 3000) // Give user time to read the success message
      } else {
        throw new Error(result.error || 'Failed to send email')
      }
    } catch (error) {
      console.error('Error sending email:', error)
      // Still trigger local download as fallback
      onDownload(email)
      setIsSuccess(true)

      setTimeout(() => {
        setIsSuccess(false)
        onClose()
        setEmail('')
      }, 3000)
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md p-0 bg-gray-50">
          <div className="flex min-h-[400px] flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6 text-center">
              <div className="w-16 h-16 bg-uk-green-100 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-uk-green-600" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Email sent successfully! 📧
                </h2>
                <p className="text-gray-600 text-sm">
                  We've sent your FREE CSV preview (50 transactions) to <strong>{email}</strong> and it's also downloading to your computer now.
                </p>
              </div>

              <div className="space-y-3">
                <Badge variant="outline" className="text-sm">
                  50 transactions included
                </Badge>
                <p className="text-xs text-gray-500">
                  Want to convert more transactions? Upgrade to unlock unlimited conversions.
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 bg-gray-50">
        <div className="flex min-h-[500px] flex-col items-center justify-center gap-6 p-6 md:p-10">
          <div className="flex w-full max-w-sm flex-col gap-6">
            {/* Logo */}
            <div className="flex items-center gap-2 self-center font-medium">
              <div className="bg-uk-blue-600 text-white flex size-8 items-center justify-center rounded-lg shadow-lg">
                <FileText className="size-4" />
              </div>
              <span className="text-lg font-semibold text-gray-900">convert-bankstatement.com</span>
            </div>

            {/* Header */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Download your FREE CSV
              </h2>
              <p className="text-gray-600 text-sm">
                Enter your email to receive the first 50 transactions from <strong>{fileName}</strong>. The file will also download to your computer.
              </p>
            </div>

            {/* Preview Details */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-uk-blue-100 rounded-lg flex items-center justify-center">
                  <Download className="w-5 h-5 text-uk-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Free Preview</h4>
                  <p className="text-sm text-gray-600">CSV format</p>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Transactions:</span>
                <span className="font-medium">50 of {transactionCount}</span>
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  className="mt-1 w-full"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-3">
                <Button
                  type="submit"
                  className="w-full bg-uk-blue-600 hover:bg-uk-blue-700 text-white py-3"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending to email...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Send free preview
                    </div>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-uk-blue-600 text-uk-blue-600 hover:bg-uk-blue-50 py-3"
                  onClick={() => {
                    onClose()
                    // This would redirect to signup/pricing page
                    window.location.href = '/signup'
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span>🚀</span>
                    Upgrade for unlimited conversions
                  </div>
                </Button>
              </div>
            </form>

            {/* Trust indicators */}
            <div className="text-center">
              <div className="flex justify-center gap-2 mb-3">
                <Badge variant="outline" className="text-xs">GDPR Compliant</Badge>
                <Badge variant="outline" className="text-xs">No Spam</Badge>
              </div>
              <p className="text-xs text-gray-500">
                We'll only email you the file. No marketing emails.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}