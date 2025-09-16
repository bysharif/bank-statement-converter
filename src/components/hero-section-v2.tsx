'use client'

import { ExternalLink, FileText, Zap, Shield, Download } from "lucide-react"
import React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

export function HeroSectionV2() {
  return (
    <section className="relative overflow-hidden py-32">
      {/* Background Pattern */}
      <div className="absolute inset-x-0 top-0 flex h-full w-full items-center justify-center opacity-100">
        <img
          alt="background"
          src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/patterns/square-alt-grid.svg"
          className="[mask-image:radial-gradient(75%_75%_at_center,white,transparent)] opacity-90"
        />
      </div>

      <div className="relative z-10 container">
        <div className="mx-auto flex max-w-7xl">
          {/* Left Side - Content */}
          <div className="flex-1 flex flex-col justify-center pr-12">
            <div className="flex flex-col gap-6">
              {/* Logo */}
              <div className="rounded-xl bg-uk-blue-100/50 p-4 shadow-sm backdrop-blur-sm w-fit">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-uk-blue-600 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-uk-blue-900">convertdocs</span>
                </div>
              </div>

              {/* Main Content */}
              <div>
                <h1 className="mb-6 text-4xl font-bold tracking-tight text-pretty lg:text-6xl">
                  Increase{" "}
                  <span className="text-uk-blue-600">accuracy</span>, not{" "}
                  effort.
                </h1>
                <p className="max-w-2xl text-muted-foreground lg:text-xl leading-relaxed">
                  We streamline your bank statement conversion tasks, letting you focus on
                  achieving results more quickly. Transform any UK bank statement to CSV, QIF, or Excel instantly.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="mt-6 flex gap-3">
                <Link href="/signup">
                  <Button className="shadow-sm transition-shadow hover:shadow bg-uk-blue-600 hover:bg-uk-blue-700 text-lg px-8 py-6">
                    Try for Free
                  </Button>
                </Link>
                <Button variant="outline" className="group text-lg px-8 py-6">
                  Book a Demo{" "}
                  <ExternalLink className="ml-2 h-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-uk-green-500 rounded-full"></div>
                  <span>30-day free trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-uk-green-500 rounded-full"></div>
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-uk-green-500 rounded-full"></div>
                  <span>Cancel anytime</span>
                </div>
              </div>

              {/* Supported Banks */}
              <div className="mt-12 flex flex-col gap-4">
                <p className="font-medium text-muted-foreground">
                  Supports all major UK banks
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  {["HSBC", "Lloyds", "Barclays", "NatWest", "Monzo", "Starling"].map((bank) => (
                    <div
                      key={bank}
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "group flex h-10 items-center justify-center px-4 text-sm font-medium",
                      )}
                    >
                      {bank}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Interactive File Drop Zone */}
          <div className="flex-1 flex items-center justify-center relative">
            <div className="relative w-full max-w-md">
              {/* Main App Card - Interactive File Drop Zone */}
              <Card className="relative bg-white shadow-2xl border-0 overflow-hidden cursor-pointer hover:shadow-3xl transition-shadow duration-300">
                <input
                  type="file"
                  id="hero-file-upload"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  accept=".pdf,.csv,.xlsx,.xls"
                  multiple={false}
                />
                <CardContent className="p-0">
                  {/* App Header */}
                  <div className="bg-gradient-to-r from-uk-blue-50 to-uk-green-50 p-4 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-uk-blue-600 rounded flex items-center justify-center">
                          <FileText className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-semibold text-sm">convertdocs</span>
                      </div>
                      <Badge className="bg-uk-green-100 text-uk-green-800 text-xs">
                        GDPR Safe
                      </Badge>
                    </div>
                  </div>

                  {/* Upload Interface */}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-4 text-center">
                      Upload Bank Statement
                    </h3>

                    {/* Upload Area */}
                    <div className="border-2 border-dashed border-uk-blue-200 rounded-lg p-8 text-center bg-uk-blue-50/30 hover:bg-uk-blue-50/50 transition-colors">
                      <div className="w-12 h-12 bg-uk-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <FileText className="w-6 h-6 text-uk-blue-600" />
                      </div>
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Drop your file here
                      </p>
                      <p className="text-xs text-gray-500 mb-3">
                        PDF, CSV, Excel supported
                      </p>
                      <div className="flex justify-center gap-1">
                        <Badge variant="outline" className="text-xs">PDF</Badge>
                        <Badge variant="outline" className="text-xs">CSV</Badge>
                        <Badge variant="outline" className="text-xs">Excel</Badge>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="mt-6 space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-6 h-6 bg-uk-green-100 rounded-full flex items-center justify-center">
                          <Zap className="w-3 h-3 text-uk-green-600" />
                        </div>
                        <span className="text-gray-600">Instant processing</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-6 h-6 bg-uk-blue-100 rounded-full flex items-center justify-center">
                          <Shield className="w-3 h-3 text-uk-blue-600" />
                        </div>
                        <span className="text-gray-600">100% private & secure</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-6 h-6 bg-uk-green-100 rounded-full flex items-center justify-center">
                          <Download className="w-3 h-3 text-uk-green-600" />
                        </div>
                        <span className="text-gray-600">Multiple export formats</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Floating Elements - Outside clickable area */}
            <div className="absolute -top-4 right-8 bg-white rounded-lg shadow-lg p-3 border pointer-events-none">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-uk-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium">Processing...</span>
              </div>
            </div>

            <div className="absolute -bottom-4 left-8 bg-white rounded-lg shadow-lg p-3 border pointer-events-none">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-uk-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-uk-blue-600">✓</span>
                </div>
                <div className="text-xs">
                  <div className="font-medium">1,247 transactions</div>
                  <div className="text-gray-500">Ready to download</div>
                </div>
              </div>
            </div>

            {/* Statistics - Outside clickable area */}
            <div className="absolute top-1/2 -right-16 transform -translate-y-1/2 pointer-events-none">
              <div className="bg-white rounded-full shadow-lg p-4 border">
                <div className="text-center">
                  <div className="text-lg font-bold text-uk-blue-600">99.9%</div>
                  <div className="text-xs text-gray-500">Accuracy</div>
                </div>
              </div>
            </div>

            <div className="absolute top-1/4 -left-12 pointer-events-none">
              <div className="bg-white rounded-lg shadow-lg p-3 border">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-uk-blue-500 to-uk-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">UK</span>
                  </div>
                  <div className="text-xs">
                    <div className="font-medium">500K+</div>
                    <div className="text-gray-500">Users</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}