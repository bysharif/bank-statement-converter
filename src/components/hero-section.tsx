'use client'

import { ChevronLeft, ChevronRight, Copy, Plus, RotateCw, Share } from "lucide-react"
import React, { useState } from "react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SignupModal } from "@/components/signup-modal"

export function HeroSection() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleTryFree = () => {
    setIsModalOpen(true)
  }

  return (
    <section className="bg-background">
      <div className="container relative py-32">
        <header className="mx-auto max-w-4xl text-center">
          <h1 className="text-foreground text-5xl font-bold uppercase md:text-7xl leading-tight">
            UK Bank Statement <br />
            <span className="text-uk-blue-600">Converter</span>
          </h1>
          <p className="text-muted-foreground my-7 max-w-3xl tracking-tight md:text-xl">
            Transform your bank statements to CSV, Excel, or QIF in seconds.
            100% private, GDPR-compliant, with support for all major UK banks.
          </p>
        </header>

        <Badge
          variant="outline"
          className="mx-auto mt-10 flex w-fit cursor-pointer items-center justify-center rounded-full border py-2 pl-3 pr-4 font-normal transition-all ease-in-out hover:gap-3"
        >
          <Avatar className="relative -mr-3 overflow-hidden rounded-full border md:size-8">
            <AvatarFallback className="bg-uk-blue-100 text-uk-blue-800 text-xs font-semibold">JD</AvatarFallback>
          </Avatar>
          <Avatar className="relative -mr-3 overflow-hidden rounded-full border md:size-8">
            <AvatarFallback className="bg-uk-green-100 text-uk-green-800 text-xs font-semibold">SM</AvatarFallback>
          </Avatar>
          <Avatar className="relative -mr-3 overflow-hidden rounded-full border md:size-8">
            <AvatarFallback className="bg-gray-100 text-gray-800 text-xs font-semibold">MH</AvatarFallback>
          </Avatar>
          <p className="ml-6 capitalize tracking-tight md:text-lg">
            Trusted by{" "}
            <span className="text-foreground font-bold">500K+</span>{" "}
            UK users
          </p>
        </Badge>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center my-12">
          <Button
            onClick={handleTryFree}
            size="lg"
            className="bg-uk-blue-600 hover:bg-uk-blue-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            <span>Start Converting</span>
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Button>

          <Button variant="outline" size="lg" className="border-gray-300 px-8 py-4 text-lg">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Watch Demo
          </Button>
        </div>

        <div className="relative mt-16 flex h-full w-full flex-col items-center justify-center">
          <BrowserMockup
            className="w-full max-w-6xl"
            url="bankconverter.uk"
          />
          <div className="absolute bottom-0 h-2/3 w-full bg-gradient-to-t from-white to-transparent pointer-events-none" />
        </div>
      </div>

      <SignupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        planName="Free"
        planPrice="£0"
        planType="free"
      />
    </section>
  )
}

const BrowserMockup = ({
  className = "",
  url = "bankconverter.uk",
}) => (
  <div
    className={cn(
      "relative w-full overflow-hidden border rounded-2xl shadow-2xl",
      className,
    )}
  >
    {/* Browser Chrome */}
    <div className="bg-muted flex items-center justify-between gap-10 px-6 py-4">
      <div className="flex items-center gap-2">
        <div className="size-3 rounded-full bg-red-500" />
        <div className="size-3 rounded-full bg-yellow-500" />
        <div className="size-3 rounded-full bg-green-500" />
        <div className="ml-6 hidden items-center gap-2 opacity-40 lg:flex">
          <ChevronLeft className="size-5" />
          <ChevronRight className="size-5" />
        </div>
      </div>
      <div className="flex w-full items-center justify-center">
        <div className="bg-background relative hidden w-full max-w-md rounded-full px-4 py-2 text-center text-sm tracking-tight md:block">
          🔒 {url}
          <RotateCw className="absolute right-3 top-2.5 size-3.5 opacity-50" />
        </div>
      </div>

      <div className="flex items-center gap-4 opacity-40">
        <Share className="size-4" />
        <Plus className="size-4" />
        <Copy className="size-4" />
      </div>
    </div>

    {/* App Screenshot/Demo */}
    <div className="relative w-full bg-gradient-to-br from-uk-blue-50 via-white to-uk-green-50 min-h-[500px] flex items-center justify-center">
      {/* Mock app interface */}
      <div className="w-full max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-uk-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">UK</span>
            </div>
            <span className="font-bold text-gray-900">BankConverter</span>
          </div>
          <Badge className="bg-uk-green-100 text-uk-green-800">GDPR Compliant</Badge>
        </div>

        {/* Main Content */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Upload Your Bank Statement
          </h2>
          <p className="text-gray-600 mb-8">
            Drag & drop your file or click to browse
          </p>

          {/* Upload Area */}
          <div className="border-2 border-dashed border-uk-blue-300 rounded-lg p-12 bg-white/50 backdrop-blur-sm">
            <div className="w-16 h-16 bg-uk-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📄</span>
            </div>
            <p className="text-lg font-medium text-gray-900 mb-2">
              Drop your statement here
            </p>
            <p className="text-gray-600 mb-6">
              Supports PDF, CSV, Excel files
            </p>
            <div className="flex justify-center gap-2">
              <Badge variant="outline">PDF</Badge>
              <Badge variant="outline">CSV</Badge>
              <Badge variant="outline">Excel</Badge>
            </div>
          </div>
        </div>

        {/* Bank Logos */}
        <div className="flex justify-center items-center gap-6 opacity-60">
          <div className="text-xs font-medium text-gray-500 mb-2">Supports:</div>
          <div className="flex gap-4">
            <div className="h-8 w-16 bg-gray-100 rounded flex items-center justify-center text-xs font-bold text-gray-600">HSBC</div>
            <div className="h-8 w-16 bg-gray-100 rounded flex items-center justify-center text-xs font-bold text-gray-600">Lloyds</div>
            <div className="h-8 w-16 bg-gray-100 rounded flex items-center justify-center text-xs font-bold text-gray-600">Barclays</div>
            <div className="h-8 w-16 bg-gray-100 rounded flex items-center justify-center text-xs font-bold text-gray-600">Monzo</div>
          </div>
        </div>
      </div>
    </div>

    {/* Mobile URL bar */}
    <div className="bg-muted absolute bottom-0 z-10 flex w-full items-center justify-center py-3 md:hidden">
      <p className="relative flex items-center gap-2 rounded-full px-8 py-1 text-center text-sm tracking-tight">
        🔒 {url}
      </p>
    </div>
  </div>
)