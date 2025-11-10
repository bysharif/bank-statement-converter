'use client'

import React, { useState, useRef, useEffect } from 'react'
import { X, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'

interface Message {
  id: string
  type: 'bot' | 'user'
  content: string
  timestamp: Date
}

interface ChatOption {
  label: string
  action: () => void
}

interface JuntoChatProps {
  isOpen: boolean
  onClose: () => void
}

export function JuntoChat({ isOpen, onClose }: JuntoChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [options, setOptions] = useState<ChatOption[]>([])
  const [conversationHistory, setConversationHistory] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Initial welcome message
      setTimeout(() => {
        addBotMessage('Hey, I am Junto, how can I help you today?')
        setOptions([
          { label: 'Pricing & Plans', action: () => handlePricingQuestion() },
          { label: 'Supported Banks', action: () => handleBanksQuestion() },
          { label: 'Export Formats', action: () => handleFormatsQuestion() },
          { label: 'Getting Started', action: () => handleGettingStarted() },
        ])
      }, 500)
    }
  }, [isOpen])

  const addBotMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'bot',
      content,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newMessage])
  }

  const addUserMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newMessage])
  }

  const goBack = () => {
    if (conversationHistory.length > 0) {
      const previousStep = conversationHistory[conversationHistory.length - 1]
      setConversationHistory((prev) => prev.slice(0, -1))

      // Reset to main menu
      addBotMessage('What else can I help you with?')
      setOptions([
        { label: 'Pricing & Plans', action: () => handlePricingQuestion() },
        { label: 'Supported Banks', action: () => handleBanksQuestion() },
        { label: 'Export Formats', action: () => handleFormatsQuestion() },
        { label: 'Getting Started', action: () => handleGettingStarted() },
      ])
    }
  }

  // PRICING CONVERSATIONS
  const handlePricingQuestion = () => {
    addUserMessage('Pricing & Plans')
    setConversationHistory((prev) => [...prev, 'pricing'])

    setTimeout(() => {
      addBotMessage('We offer 4 flexible plans to suit your needs:\n\n• Free: 5 conversions/month\n• Starter (£9/mo): 50 conversions\n• Professional (£29/mo): 200 conversions\n• Business (£79/mo): 1000 conversions\n\nAll plans include HMRC-compliant exports!')
      setOptions([
        { label: 'Tell me about Free plan', action: () => handleFreePlan() },
        { label: 'What\'s in Starter?', action: () => handleStarterPlan() },
        { label: 'Professional features', action: () => handleProfessionalPlan() },
        { label: 'Back to menu', action: () => goBack() },
      ])
    }, 800)
  }

  const handleFreePlan = () => {
    addUserMessage('Tell me about Free plan')

    setTimeout(() => {
      addBotMessage('Perfect for trying our service!\n\n✓ 5 conversions per month\n✓ CSV export\n✓ 7 days data retention\n✓ Email support\n✓ 99.6% accuracy\n\nReady to get started?')
      setOptions([
        { label: 'Start Free Trial', action: () => handleStartFreeTrial() },
        { label: 'View other plans', action: () => handlePricingQuestion() },
        { label: 'Back to menu', action: () => goBack() },
      ])
    }, 800)
  }

  const handleStarterPlan = () => {
    addUserMessage('What\'s in Starter?')

    setTimeout(() => {
      addBotMessage('Great for small businesses & freelancers!\n\n✓ 50 conversions/month (£9)\n✓ CSV & Excel exports\n✓ 30 days data retention\n✓ Email support\n✓ Bulk processing\n\nMost popular choice!')
      setOptions([
        { label: 'Subscribe to Starter', action: () => handleSubscribeStarter() },
        { label: 'Compare all plans', action: () => handleComparePlans() },
        { label: 'Back to menu', action: () => goBack() },
      ])
    }, 800)
  }

  const handleProfessionalPlan = () => {
    addUserMessage('Professional features')

    setTimeout(() => {
      addBotMessage('For growing businesses!\n\n✓ 200 conversions/month (£29)\n✓ All export formats (CSV, Excel, QIF, QBO)\n✓ 1 year data retention\n✓ Priority support\n✓ Bulk processing\n✓ QuickBooks integration')
      setOptions([
        { label: 'Subscribe to Professional', action: () => handleSubscribeProfessional() },
        { label: 'Compare all plans', action: () => handleComparePlans() },
        { label: 'Back to menu', action: () => goBack() },
      ])
    }, 800)
  }

  const handleStartFreeTrial = () => {
    addUserMessage('Start Free Trial')

    setTimeout(() => {
      addBotMessage('Excellent choice! Click below to create your free account and start converting immediately.')
      setOptions([
        { label: '→ Create Free Account', action: () => window.location.href = '/dashboard' },
        { label: 'Learn more first', action: () => handleGettingStarted() },
        { label: 'Back to menu', action: () => goBack() },
      ])
    }, 800)
  }

  const handleSubscribeStarter = () => {
    addUserMessage('Subscribe to Starter')

    setTimeout(() => {
      addBotMessage('Great! The Starter plan is just £9/month. You can cancel anytime.')
      setOptions([
        { label: '→ View Pricing Page', action: () => window.location.href = '/pricing' },
        { label: 'Back to plans', action: () => handlePricingQuestion() },
        { label: 'Back to menu', action: () => goBack() },
      ])
    }, 800)
  }

  const handleSubscribeProfessional = () => {
    addUserMessage('Subscribe to Professional')

    setTimeout(() => {
      addBotMessage('Perfect for growing teams! Professional is £29/month with priority support.')
      setOptions([
        { label: '→ View Pricing Page', action: () => window.location.href = '/pricing' },
        { label: 'Back to plans', action: () => handlePricingQuestion() },
        { label: 'Back to menu', action: () => goBack() },
      ])
    }, 800)
  }

  const handleComparePlans = () => {
    addUserMessage('Compare all plans')

    setTimeout(() => {
      addBotMessage('Check out our detailed pricing comparison to find the perfect fit for your needs.')
      setOptions([
        { label: '→ View Full Pricing', action: () => window.location.href = '/pricing' },
        { label: 'Ask another question', action: () => goBack() },
      ])
    }, 800)
  }

  // BANKS CONVERSATIONS
  const handleBanksQuestion = () => {
    addUserMessage('Supported Banks')
    setConversationHistory((prev) => [...prev, 'banks'])

    setTimeout(() => {
      addBotMessage('We support 30+ major UK banks including:\n\n🏦 Traditional: HSBC, Barclays, Lloyds, Nationwide, Santander\n💳 Digital: Monzo, Starling, Revolut, N26, Wise\n\nWhich type are you interested in?')
      setOptions([
        { label: 'Traditional Banks', action: () => handleTraditionalBanks() },
        { label: 'Digital/Challenger Banks', action: () => handleDigitalBanks() },
        { label: 'Is my bank supported?', action: () => handleCheckBank() },
        { label: 'Back to menu', action: () => goBack() },
      ])
    }, 800)
  }

  const handleTraditionalBanks = () => {
    addUserMessage('Traditional Banks')

    setTimeout(() => {
      addBotMessage('All major UK traditional banks are supported:\n\n✓ HSBC\n✓ Barclays\n✓ Lloyds\n✓ Nationwide\n✓ Santander\n✓ NatWest\n✓ RBS\n✓ TSB\n✓ Halifax\n✓ First Direct\n\n...and many more!')
      setOptions([
        { label: 'Try it now', action: () => handleStartFreeTrial() },
        { label: 'View digital banks', action: () => handleDigitalBanks() },
        { label: 'Back to menu', action: () => goBack() },
      ])
    }, 800)
  }

  const handleDigitalBanks = () => {
    addUserMessage('Digital/Challenger Banks')

    setTimeout(() => {
      addBotMessage('All popular digital banks supported:\n\n✓ Monzo\n✓ Starling\n✓ Revolut\n✓ N26\n✓ Wise (TransferWise)\n✓ Tide\n✓ Coconut\n\nPerfect for modern businesses!')
      setOptions([
        { label: 'Start converting', action: () => handleStartFreeTrial() },
        { label: 'View traditional banks', action: () => handleTraditionalBanks() },
        { label: 'Back to menu', action: () => goBack() },
      ])
    }, 800)
  }

  const handleCheckBank = () => {
    addUserMessage('Is my bank supported?')

    setTimeout(() => {
      addBotMessage('We support 30+ UK banks! If you don\'t see yours listed, contact our support team and we\'ll add it within 48 hours.')
      setOptions([
        { label: 'Contact Support', action: () => handleContactSupport() },
        { label: 'Try with another bank', action: () => handleStartFreeTrial() },
        { label: 'Back to menu', action: () => goBack() },
      ])
    }, 800)
  }

  // FORMATS CONVERSATIONS
  const handleFormatsQuestion = () => {
    addUserMessage('Export Formats')
    setConversationHistory((prev) => [...prev, 'formats'])

    setTimeout(() => {
      addBotMessage('We support multiple export formats:\n\n📊 CSV: Universal format\n📈 Excel (XLSX): Professional reports\n💼 QIF: QuickBooks, Xero, Sage\n📁 QBO/QFX: QuickBooks Desktop\n🔧 JSON: Custom integrations\n\nWhich format do you need?')
      setOptions([
        { label: 'CSV & Excel', action: () => handleCSVExcel() },
        { label: 'Accounting Software (QIF/QBO)', action: () => handleAccountingSoftware() },
        { label: 'Custom (JSON API)', action: () => handleCustomFormats() },
        { label: 'Back to menu', action: () => goBack() },
      ])
    }, 800)
  }

  const handleCSVExcel = () => {
    addUserMessage('CSV & Excel')

    setTimeout(() => {
      addBotMessage('CSV and Excel formats work with:\n\n✓ Microsoft Excel\n✓ Google Sheets\n✓ LibreOffice\n✓ Numbers (Mac)\n\nAvailable on all plans, including Free!')
      setOptions([
        { label: 'Start converting', action: () => handleStartFreeTrial() },
        { label: 'View pricing', action: () => handlePricingQuestion() },
        { label: 'Back to menu', action: () => goBack() },
      ])
    }, 800)
  }

  const handleAccountingSoftware = () => {
    addUserMessage('Accounting Software (QIF/QBO)')

    setTimeout(() => {
      addBotMessage('QIF and QBO formats integrate with:\n\n✓ QuickBooks (Desktop & Online)\n✓ Xero\n✓ Sage\n✓ FreeAgent\n\nAvailable on Professional & Business plans')
      setOptions([
        { label: 'View Professional plan', action: () => handleProfessionalPlan() },
        { label: 'Compare all plans', action: () => handleComparePlans() },
        { label: 'Back to menu', action: () => goBack() },
      ])
    }, 800)
  }

  const handleCustomFormats = () => {
    addUserMessage('Custom (JSON API)')

    setTimeout(() => {
      addBotMessage('Our JSON API allows custom integrations with your systems. Perfect for:\n\n✓ Custom accounting systems\n✓ Internal tools\n✓ Automated workflows\n✓ Enterprise integrations\n\nAvailable on Business plan (£79/mo)')
      setOptions([
        { label: 'Contact for demo', action: () => handleContactSupport() },
        { label: 'View Business plan', action: () => window.location.href = '/pricing' },
        { label: 'Back to menu', action: () => goBack() },
      ])
    }, 800)
  }

  // GETTING STARTED
  const handleGettingStarted = () => {
    addUserMessage('Getting Started')
    setConversationHistory((prev) => [...prev, 'getting-started'])

    setTimeout(() => {
      addBotMessage('Getting started is easy:\n\n1. Upload your PDF bank statement\n2. Our AI processes it (~15 seconds)\n3. Download in your format\n\nWhat would you like to know?')
      setOptions([
        { label: 'How accurate is it?', action: () => handleAccuracy() },
        { label: 'Is my data secure?', action: () => handleSecurity() },
        { label: 'HMRC compliance?', action: () => handleHMRC() },
        { label: 'Back to menu', action: () => goBack() },
      ])
    }, 800)
  }

  const handleAccuracy = () => {
    addUserMessage('How accurate is it?')

    setTimeout(() => {
      addBotMessage('Our AI achieves 99.6% accuracy on bank statement conversions!\n\n✓ Tested on 1000s of statements\n✓ All major UK banks\n✓ Complex transactions handled\n✓ Manual review available\n\nTry it free to see for yourself!')
      setOptions([
        { label: 'Start Free Trial', action: () => handleStartFreeTrial() },
        { label: 'Learn more', action: () => handleGettingStarted() },
        { label: 'Back to menu', action: () => goBack() },
      ])
    }, 800)
  }

  const handleSecurity = () => {
    addUserMessage('Is my data secure?')

    setTimeout(() => {
      addBotMessage('Your data security is our priority:\n\n🔒 Bank-grade encryption\n✓ GDPR compliant\n✓ Data deleted after retention period\n✓ No data sharing\n✓ Secure UK servers\n\nYour financial data is safe with us.')
      setOptions([
        { label: 'View security details', action: () => window.location.href = '/security' },
        { label: 'Start converting', action: () => handleStartFreeTrial() },
        { label: 'Back to menu', action: () => goBack() },
      ])
    }, 800)
  }

  const handleHMRC = () => {
    addUserMessage('HMRC compliance?')

    setTimeout(() => {
      addBotMessage('All our exports are HMRC compliant!\n\n✓ Making Tax Digital ready\n✓ Proper date formatting\n✓ Correct transaction categorization\n✓ Audit trail maintained\n\nPerfect for your tax returns.')
      setOptions([
        { label: 'Start Free Trial', action: () => handleStartFreeTrial() },
        { label: 'View pricing', action: () => handlePricingQuestion() },
        { label: 'Back to menu', action: () => goBack() },
      ])
    }, 800)
  }

  const handleContactSupport = () => {
    addUserMessage('Contact Support')

    setTimeout(() => {
      addBotMessage('Our team is here to help!\n\nEmail: support@convertbank-statement.com\n\nOr use the contact form on the left to send us a message. We typically respond within 24 hours.')
      setOptions([
        { label: 'Back to menu', action: () => goBack() },
      ])
    }, 800)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl h-[600px] m-4 bg-white rounded-2xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-[#1E40AF] to-[#1E3A8A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center p-1.5">
              <Image
                src="/logo.svg"
                alt="Junto"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <div>
              <h3 className="font-semibold text-white">Junto</h3>
              <p className="text-xs text-blue-100">
                Powered by Taxformed
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.type === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === 'user'
                    ? 'bg-gray-200'
                    : 'bg-white border border-[#1E40AF]'
                }`}
              >
                {message.type === 'bot' ? (
                  <Image
                    src="/logo.svg"
                    alt="Junto"
                    width={20}
                    height={20}
                    className="object-contain"
                  />
                ) : (
                  <div className="w-4 h-4 bg-[#1E40AF] rounded-full"></div>
                )}
              </div>
              <div
                className={`flex-1 max-w-[80%] ${
                  message.type === 'user' ? 'text-right' : ''
                }`}
              >
                <div
                  className={`inline-block p-3 rounded-2xl ${
                    message.type === 'user'
                      ? 'bg-[#1E40AF] text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* Options/Buttons */}
        {options.length > 0 && (
          <div className="p-4 border-t bg-gray-50 space-y-2">
            {conversationHistory.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={goBack}
                className="w-full text-xs text-gray-600 hover:text-gray-900 mb-2"
              >
                <ArrowLeft className="w-3 h-3 mr-1" />
                Back
              </Button>
            )}
            <div className="grid grid-cols-1 gap-2">
              {options.map((option, index) => (
                <Button
                  key={index}
                  onClick={option.action}
                  className="bg-[#4A69D2]/90 hover:bg-[#4A69D2] text-white text-sm py-2.5 rounded-lg font-medium transition-all"
                  variant="default"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
