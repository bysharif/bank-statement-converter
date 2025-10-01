'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { AppSidebar } from "@/components/app-sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ChevronDown, FileText, Upload, Download, Shield, Clock, Mail } from 'lucide-react'
import { useState } from 'react'

export default function Help() {
  const [openFaq, setOpenFaq] = useState<string | null>(null)

  const faqs = [
    {
      id: 'supported-banks',
      question: 'Which UK banks are supported?',
      answer: 'We support statements from all major UK banks including HSBC, Lloyds, Barclays, NatWest, Santander, TSB, Halifax, First Direct, Monzo, Starling Bank, and many more. Our system automatically detects the bank format and processes accordingly.'
    },
    {
      id: 'file-formats',
      question: 'What file formats can I upload and download?',
      answer: 'You can upload PDF bank statements from any supported UK bank. We convert them to CSV, QIF, or Excel formats that are compatible with popular accounting software like QuickBooks, Xero, Sage, and FreeAgent.'
    },
    {
      id: 'security',
      question: 'How secure is my financial data?',
      answer: 'Security is our top priority. All files are encrypted during upload and processing. We process everything on secure UK-based servers and automatically delete your files after the retention period you choose. We are GDPR compliant and never store your login credentials or account details.'
    },
    {
      id: 'processing-time',
      question: 'How long does conversion take?',
      answer: 'Most conversions complete within 30-60 seconds. Complex statements with many transactions may take up to 2-3 minutes. You\'ll receive real-time updates on the conversion progress.'
    },
    {
      id: 'accuracy',
      question: 'How accurate is the conversion?',
      answer: 'Our conversion engine achieves 99%+ accuracy on standard bank statements. We use advanced OCR and machine learning to extract transaction data. Always review the converted data before importing into your accounting software.'
    },
    {
      id: 'limits',
      question: 'Are there any usage limits?',
      answer: 'Free accounts can process up to 5 files per month with a 10MB size limit per file. Pro accounts have unlimited conversions and support files up to 50MB. Enterprise accounts include priority processing and API access.'
    }
  ]

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would send the contact form
    console.log('Contact form submitted')
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">
                    Bank Statement Converter
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Help & Support</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="ml-auto flex items-center gap-4 px-4">
            <Badge variant="outline" className="capitalize">
              Free Plan
            </Badge>
            <ThemeToggle />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
          {/* Quick Help Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">Getting Started</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Upload your PDF bank statement and our system will automatically detect the format and convert it to your preferred output format.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  <CardTitle className="text-lg">Supported Formats</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  We support all major UK banks and convert to CSV, QIF, and Excel formats compatible with popular accounting software.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  <CardTitle className="text-lg">Data Security</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Your data is encrypted and processed securely. Files are automatically deleted after your chosen retention period.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Section */}
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>
                Find answers to common questions about using our bank statement converter
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {faqs.map((faq) => (
                <Collapsible
                  key={faq.id}
                  open={openFaq === faq.id}
                  onOpenChange={(open: boolean) => setOpenFaq(open ? faq.id : null)}
                >
                  <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-left">
                    <span className="font-medium">{faq.question}</span>
                    <ChevronDown className="h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pb-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </CardContent>
          </Card>

          {/* Contact Support */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Support</CardTitle>
              <CardDescription>
                Can't find what you're looking for? Get in touch with our support team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="Your full name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="your@email.com" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="Brief description of your issue" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Please describe your issue or question in detail..."
                    rows={5}
                    required
                  />
                </div>
                <Button type="submit" className="w-full md:w-auto">
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Additional Resources */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Resources</CardTitle>
              <CardDescription>
                More ways to get help and stay updated
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Response Times
                  </h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• Free Plan: 48-72 hours</p>
                    <p>• Pro Plan: 24 hours</p>
                    <p>• Enterprise: 4 hours</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Alternative Contact
                  </h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>Email: support@bankconverter.co.uk</p>
                    <p>Phone: +44 20 1234 5678</p>
                    <p>Hours: Mon-Fri 9AM-5PM GMT</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}