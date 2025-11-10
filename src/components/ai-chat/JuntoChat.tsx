'use client'

import React, { useState, useRef, useEffect } from 'react'
import { X, Send, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

interface Message {
  id: string
  type: 'bot' | 'user'
  content: string
  timestamp: Date
  options?: ChatOption[]
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
  const [inputValue, setInputValue] = useState('')
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
        addBotMessage('Hey, I am Junto, how can I help you today?', [
          { label: 'Pricing & Plans', action: () => handlePricingQuestion() },
          { label: 'Supported Banks', action: () => handleBanksQuestion() },
          { label: 'Export Formats', action: () => handleFormatsQuestion() },
          { label: 'Getting Started', action: () => handleGettingStarted() },
        ])
      }, 300)
    }
  }, [isOpen])

  const addBotMessage = (content: string, options?: ChatOption[]) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'bot',
      content,
      timestamp: new Date(),
      options,
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

  const handleReset = () => {
    setMessages([])
    setConversationHistory([])
    setInputValue('')
    setTimeout(() => {
      addBotMessage('Hey, I am Junto, how can I help you today?', [
        { label: 'Pricing & Plans', action: () => handlePricingQuestion() },
        { label: 'Supported Banks', action: () => handleBanksQuestion() },
        { label: 'Export Formats', action: () => handleFormatsQuestion() },
        { label: 'Getting Started', action: () => handleGettingStarted() },
      ])
    }, 300)
  }

  const goBackToMain = () => {
    addBotMessage('What else can I help you with?', [
      { label: 'Pricing & Plans', action: () => handlePricingQuestion() },
      { label: 'Supported Banks', action: () => handleBanksQuestion() },
      { label: 'Export Formats', action: () => handleFormatsQuestion() },
      { label: 'Getting Started', action: () => handleGettingStarted() },
    ])
  }

  // PRICING CONVERSATIONS
  const handlePricingQuestion = () => {
    addUserMessage('Pricing & Plans')
    setConversationHistory((prev) => [...prev, 'pricing'])

    setTimeout(() => {
      addBotMessage('We offer 4 flexible plans to suit your needs:\n\n• Free: 5 conversions/month\n• Starter (£9/mo): 50 conversions\n• Professional (£29/mo): 200 conversions\n• Business (£79/mo): 1000 conversions\n\nAll plans include HMRC-compliant exports!', [
        { label: 'Tell me about Free plan', action: () => handleFreePlan() },
        { label: 'What\'s in Starter?', action: () => handleStarterPlan() },
        { label: 'Professional features', action: () => handleProfessionalPlan() },
        { label: 'Back to menu', action: () => goBackToMain() },
      ])
    }, 600)
  }

  const handleFreePlan = () => {
    addUserMessage('Tell me about Free plan')

    setTimeout(() => {
      addBotMessage('Perfect for trying our service!\n\n✓ 5 conversions per month\n✓ CSV export\n✓ 7 days data retention\n✓ Email support\n✓ 99.6% accuracy\n\nReady to get started?', [
        { label: '→ Start Free Trial', action: () => window.location.href = '/dashboard' },
        { label: 'View other plans', action: () => handlePricingQuestion() },
        { label: 'Back to menu', action: () => goBackToMain() },
      ])
    }, 600)
  }

  const handleStarterPlan = () => {
    addUserMessage('What\'s in Starter?')

    setTimeout(() => {
      addBotMessage('Great for small businesses & freelancers!\n\n✓ 50 conversions/month (£9)\n✓ CSV & Excel exports\n✓ 30 days data retention\n✓ Email support\n✓ Bulk processing\n\nMost popular choice!', [
        { label: '→ View Pricing Page', action: () => window.location.href = '/pricing' },
        { label: 'Compare all plans', action: () => window.location.href = '/pricing' },
        { label: 'Back to menu', action: () => goBackToMain() },
      ])
    }, 600)
  }

  const handleProfessionalPlan = () => {
    addUserMessage('Professional features')

    setTimeout(() => {
      addBotMessage('For growing businesses!\n\n✓ 200 conversions/month (£29)\n✓ All export formats (CSV, Excel, QIF, QBO)\n✓ 1 year data retention\n✓ Priority support\n✓ Bulk processing\n✓ QuickBooks integration', [
        { label: '→ View Pricing Page', action: () => window.location.href = '/pricing' },
        { label: 'Compare all plans', action: () => window.location.href = '/pricing' },
        { label: 'Back to menu', action: () => goBackToMain() },
      ])
    }, 600)
  }

  // BANKS CONVERSATIONS
  const handleBanksQuestion = () => {
    addUserMessage('Supported Banks')
    setConversationHistory((prev) => [...prev, 'banks'])

    setTimeout(() => {
      addBotMessage('We support 30+ major UK banks including:\n\n🏦 Traditional: HSBC, Barclays, Lloyds, Nationwide, Santander\n💳 Digital: Monzo, Starling, Revolut, N26, Wise\n\nWhich type are you interested in?', [
        { label: 'Traditional Banks', action: () => handleTraditionalBanks() },
        { label: 'Digital/Challenger Banks', action: () => handleDigitalBanks() },
        { label: 'Is my bank supported?', action: () => handleCheckBank() },
        { label: 'Back to menu', action: () => goBackToMain() },
      ])
    }, 600)
  }

  const handleTraditionalBanks = () => {
    addUserMessage('Traditional Banks')

    setTimeout(() => {
      addBotMessage('All major UK traditional banks are supported:\n\n✓ HSBC\n✓ Barclays\n✓ Lloyds\n✓ Nationwide\n✓ Santander\n✓ NatWest\n✓ RBS\n✓ TSB\n✓ Halifax\n✓ First Direct\n\n...and many more!', [
        { label: '→ Try it now', action: () => window.location.href = '/dashboard' },
        { label: 'View digital banks', action: () => handleDigitalBanks() },
        { label: 'Back to menu', action: () => goBackToMain() },
      ])
    }, 600)
  }

  const handleDigitalBanks = () => {
    addUserMessage('Digital/Challenger Banks')

    setTimeout(() => {
      addBotMessage('All popular digital banks supported:\n\n✓ Monzo\n✓ Starling\n✓ Revolut\n✓ N26\n✓ Wise (TransferWise)\n✓ Tide\n✓ Coconut\n\nPerfect for modern businesses!', [
        { label: '→ Start converting', action: () => window.location.href = '/dashboard' },
        { label: 'View traditional banks', action: () => handleTraditionalBanks() },
        { label: 'Back to menu', action: () => goBackToMain() },
      ])
    }, 600)
  }

  const handleCheckBank = () => {
    addUserMessage('Is my bank supported?')

    setTimeout(() => {
      addBotMessage('We support 30+ UK banks! If you don\'t see yours listed, contact our support team and we\'ll add it within 48 hours.', [
        { label: 'Try with another bank', action: () => window.location.href = '/dashboard' },
        { label: 'Back to menu', action: () => goBackToMain() },
      ])
    }, 600)
  }

  // FORMATS CONVERSATIONS
  const handleFormatsQuestion = () => {
    addUserMessage('Export Formats')
    setConversationHistory((prev) => [...prev, 'formats'])

    setTimeout(() => {
      addBotMessage('We support multiple export formats:\n\n📊 CSV: Universal format\n📈 Excel (XLSX): Professional reports\n💼 QIF: QuickBooks, Xero, Sage\n📁 QBO/QFX: QuickBooks Desktop\n🔧 JSON: Custom integrations\n\nWhich format do you need?', [
        { label: 'CSV & Excel', action: () => handleCSVExcel() },
        { label: 'Accounting Software (QIF/QBO)', action: () => handleAccountingSoftware() },
        { label: 'Custom (JSON API)', action: () => handleCustomFormats() },
        { label: 'Back to menu', action: () => goBackToMain() },
      ])
    }, 600)
  }

  const handleCSVExcel = () => {
    addUserMessage('CSV & Excel')

    setTimeout(() => {
      addBotMessage('CSV and Excel formats work with:\n\n✓ Microsoft Excel\n✓ Google Sheets\n✓ LibreOffice\n✓ Numbers (Mac)\n\nAvailable on all plans, including Free!', [
        { label: '→ Start converting', action: () => window.location.href = '/dashboard' },
        { label: 'View pricing', action: () => handlePricingQuestion() },
        { label: 'Back to menu', action: () => goBackToMain() },
      ])
    }, 600)
  }

  const handleAccountingSoftware = () => {
    addUserMessage('Accounting Software (QIF/QBO)')

    setTimeout(() => {
      addBotMessage('QIF and QBO formats integrate with:\n\n✓ QuickBooks (Desktop & Online)\n✓ Xero\n✓ Sage\n✓ FreeAgent\n\nAvailable on Professional & Business plans', [
        { label: 'View Professional plan', action: () => handleProfessionalPlan() },
        { label: '→ View Pricing Page', action: () => window.location.href = '/pricing' },
        { label: 'Back to menu', action: () => goBackToMain() },
      ])
    }, 600)
  }

  const handleCustomFormats = () => {
    addUserMessage('Custom (JSON API)')

    setTimeout(() => {
      addBotMessage('Our JSON API allows custom integrations with your systems. Perfect for:\n\n✓ Custom accounting systems\n✓ Internal tools\n✓ Automated workflows\n✓ Enterprise integrations\n\nAvailable on Business plan (£79/mo)', [
        { label: '→ View Pricing', action: () => window.location.href = '/pricing' },
        { label: 'Back to menu', action: () => goBackToMain() },
      ])
    }, 600)
  }

  // GETTING STARTED
  const handleGettingStarted = () => {
    addUserMessage('Getting Started')
    setConversationHistory((prev) => [...prev, 'getting-started'])

    setTimeout(() => {
      addBotMessage('Getting started is easy:\n\n1. Upload your PDF bank statement\n2. Our AI processes it (~15 seconds)\n3. Download in your format\n\nWhat would you like to know?', [
        { label: 'How accurate is it?', action: () => handleAccuracy() },
        { label: 'Is my data secure?', action: () => handleSecurity() },
        { label: 'HMRC compliance?', action: () => handleHMRC() },
        { label: 'Back to menu', action: () => goBackToMain() },
      ])
    }, 600)
  }

  const handleAccuracy = () => {
    addUserMessage('How accurate is it?')

    setTimeout(() => {
      addBotMessage('Our AI achieves 99.6% accuracy on bank statement conversions!\n\n✓ Tested on 1000s of statements\n✓ All major UK banks\n✓ Complex transactions handled\n✓ Manual review available\n\nTry it free to see for yourself!', [
        { label: '→ Start Free Trial', action: () => window.location.href = '/dashboard' },
        { label: 'Learn more', action: () => handleGettingStarted() },
        { label: 'Back to menu', action: () => goBackToMain() },
      ])
    }, 600)
  }

  const handleSecurity = () => {
    addUserMessage('Is my data secure?')

    setTimeout(() => {
      addBotMessage('Your data security is our priority:\n\n🔒 Bank-grade encryption\n✓ GDPR compliant\n✓ Data deleted after retention period\n✓ No data sharing\n✓ Secure UK servers\n\nYour financial data is safe with us.', [
        { label: '→ Start converting', action: () => window.location.href = '/dashboard' },
        { label: 'Back to menu', action: () => goBackToMain() },
      ])
    }, 600)
  }

  const handleHMRC = () => {
    addUserMessage('HMRC compliance?')

    setTimeout(() => {
      addBotMessage('All our exports are HMRC compliant!\n\n✓ Making Tax Digital ready\n✓ Proper date formatting\n✓ Correct transaction categorization\n✓ Audit trail maintained\n\nPerfect for your tax returns.', [
        { label: '→ Start Free Trial', action: () => window.location.href = '/dashboard' },
        { label: 'View pricing', action: () => handlePricingQuestion() },
        { label: 'Back to menu', action: () => goBackToMain() },
      ])
    }, 600)
  }

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    addUserMessage(inputValue)
    setInputValue('')

    // Simple response for text input
    setTimeout(() => {
      addBotMessage('Thanks for your message! I can help you best through the button options. Here are the main topics:', [
        { label: 'Pricing & Plans', action: () => handlePricingQuestion() },
        { label: 'Supported Banks', action: () => handleBanksQuestion() },
        { label: 'Export Formats', action: () => handleFormatsQuestion() },
        { label: 'Getting Started', action: () => handleGettingStarted() },
      ])
    }, 600)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-3xl h-[700px] bg-background rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-border">
        {/* Header */}
        <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="size-2 rounded-full bg-green-500" />
              <div className="flex items-center gap-2">
                <Image
                  src="/logo.svg"
                  alt="Junto"
                  width={20}
                  height={20}
                  className="object-contain"
                />
                <span className="font-semibold text-sm">Junto</span>
              </div>
            </div>
            <div className="h-4 w-px bg-border" />
            <span className="text-muted-foreground text-xs">
              Powered by Taxformed
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-8 px-2 text-xs"
            >
              <RotateCcw className="size-3.5 mr-1" />
              Reset
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 px-2"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.map((message) => (
            <div key={message.id} className="space-y-3">
              <div
                className={`flex gap-3 ${
                  message.type === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                {/* Avatar */}
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ring-1 ring-border ${
                    message.type === 'user'
                      ? 'bg-[#1E40AF]'
                      : 'bg-background'
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
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  )}
                </div>

                {/* Message Content */}
                <div
                  className={`flex-1 max-w-[85%] ${
                    message.type === 'user' ? 'text-right' : ''
                  }`}
                >
                  <div
                    className={`inline-block px-4 py-2.5 rounded-2xl ${
                      message.type === 'user'
                        ? 'bg-[#1E40AF] text-white'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5 px-1">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              {/* Option Buttons - Appear after bot message */}
              {message.type === 'bot' && message.options && message.options.length > 0 && (
                <div className="ml-11 space-y-2">
                  {message.options.map((option, index) => (
                    <Button
                      key={index}
                      onClick={option.action}
                      variant="outline"
                      className="w-full justify-start text-left bg-[#5B7FE3]/10 hover:bg-[#5B7FE3]/20 border-[#5B7FE3]/30 hover:border-[#5B7FE3]/50 text-foreground font-medium text-sm h-auto py-2.5 px-4 rounded-lg transition-all"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t p-4 bg-muted/20">
          <form onSubmit={handleTextSubmit} className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type a message or use the buttons above..."
                className="w-full min-h-[52px] max-h-32 resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleTextSubmit(e)
                  }
                }}
              />
            </div>
            <Button
              type="submit"
              size="icon"
              disabled={!inputValue.trim()}
              className="h-[52px] w-[52px] rounded-xl bg-[#1E40AF] hover:bg-[#1E3A8A] shrink-0"
            >
              <Send className="size-4" />
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            For best results, use the suggested buttons above
          </p>
        </div>
      </div>
    </div>
  )
}
