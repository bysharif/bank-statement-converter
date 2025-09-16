'use client'

import { ChevronLeft } from "lucide-react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import Link from 'next/link';

export default function BlogPost() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="relative flex flex-col justify-between gap-10 lg:flex-row max-w-7xl mx-auto">
            <aside className="top-10 h-fit flex-shrink-0 lg:sticky lg:w-[300px] xl:w-[400px]">
              <Link
                className="text-gray-500 hover:text-uk-blue-600 mb-5 flex items-center gap-1 transition-colors"
                href="/blog"
              >
                <ChevronLeft className="h-full w-4" />
                Return to blog
              </Link>
              <h1 className="mb-5 text-balance text-3xl font-bold lg:text-4xl text-gray-900">
                Complete Guide to Bank Statement Formats Across UK Banks
              </h1>
              <div className="flex gap-3">
                <Avatar className="size-10 rounded-full border-2 border-uk-blue-100">
                  <AvatarImage
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
                    alt="Michael Roberts"
                  />
                </Avatar>
                <div>
                  <h2 className="font-semibold text-gray-900">Michael Roberts</h2>
                  <p className="text-gray-500 text-sm">28 Mar 2024 • 12 min read</p>
                </div>
              </div>
            </aside>

            <article className="flex-1 max-w-4xl">
              <img
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=600&fit=crop&crop=center"
                alt="UK Bank Statement Formats"
                className="mb-8 mt-0 aspect-video w-full rounded-lg object-cover border border-gray-200"
              />
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  Understanding the various bank statement formats used across UK financial institutions is crucial for efficient data processing. Each bank has unique formatting quirks that can impact your conversion process.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Major UK Banks Overview</h2>

                <h3 className="text-xl font-semibold text-gray-900 mt-10 mb-4">HSBC Format Characteristics</h3>
                <p className="text-gray-700 leading-relaxed mb-4">HSBC uses a standardized format with clear transaction categorization:</p>
                <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700">
                  <li>Date format: DD/MM/YYYY</li>
                  <li>Merchant names in CAPS</li>
                  <li>Clear debit/credit indicators</li>
                  <li>Consistent reference numbering</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Barclays Unique Elements</h3>
                <p className="text-gray-700 leading-relaxed mb-4">Barclays statements include several distinctive features:</p>
                <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700">
                  <li>Transaction codes for categorization</li>
                  <li>Location data for card payments</li>
                  <li>Enhanced security markings</li>
                  <li>Multi-line transaction descriptions</li>
                </ul>

                <div className="bg-gray-50 rounded-lg p-6 mb-8">
                  <h4 className="font-semibold text-gray-900 mb-4">Bank Format Comparison</h4>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 font-semibold">Bank</th>
                        <th className="text-left py-2 font-semibold">Date Format</th>
                        <th className="text-left py-2 font-semibold">Special Features</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-700">
                      <tr className="border-b border-gray-100">
                        <td className="py-2">HSBC</td>
                        <td className="py-2">DD/MM/YYYY</td>
                        <td className="py-2">CAPS merchants, clear D/C</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2">Barclays</td>
                        <td className="py-2">DD/MM/YY</td>
                        <td className="py-2">Transaction codes, location</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2">Lloyds</td>
                        <td className="py-2">DD MMM YY</td>
                        <td className="py-2">Grouped transactions</td>
                      </tr>
                      <tr>
                        <td className="py-2">Monzo</td>
                        <td className="py-2">DD/MM/YYYY</td>
                        <td className="py-2">Emoji categories, real-time</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Digital Bank Innovations</h2>
                <p className="text-gray-700 leading-relaxed mb-6">
                  Modern digital banks like Monzo, Starling, and Revolut have revolutionized statement formats with enhanced categorization and real-time data.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Monzo's Smart Categorization</h3>
                <p className="text-gray-700 leading-relaxed mb-6">
                  Monzo automatically categorizes transactions and includes emoji icons, merchant logos, and location data that traditional banks lack.
                </p>

                <blockquote className="border-l-4 border-uk-blue-600 pl-6 py-4 bg-uk-blue-50 rounded-r-lg mb-8">
                  <p className="text-gray-800 italic">
                    "Digital bank statements often contain richer metadata that can significantly improve automated categorization and analysis."
                  </p>
                </blockquote>

                <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Processing Challenges by Bank</h2>

                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Common Format Issues</h3>
                <ul className="list-disc pl-6 mb-8 space-y-2 text-gray-700">
                  <li><strong>Date inconsistencies:</strong> Some banks use 2-digit years, others 4-digit</li>
                  <li><strong>Currency formatting:</strong> Variations in decimal placement and symbols</li>
                  <li><strong>Multi-line descriptions:</strong> Information split across multiple rows</li>
                  <li><strong>Reference numbers:</strong> Different formats and positioning</li>
                </ul>

                <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Best Practices for Multi-Bank Processing</h2>
                <p className="text-gray-700 leading-relaxed mb-6">
                  When dealing with statements from multiple UK banks, follow these guidelines for consistent processing:
                </p>

                <ol className="list-decimal pl-6 mb-8 space-y-3 text-gray-700">
                  <li><strong>Standardize date formats:</strong> Convert all dates to DD/MM/YYYY</li>
                  <li><strong>Normalize descriptions:</strong> Apply consistent capitalization rules</li>
                  <li><strong>Validate amounts:</strong> Ensure decimal precision is maintained</li>
                  <li><strong>Preserve references:</strong> Keep original reference numbers for audit trails</li>
                </ol>

                <div className="bg-uk-green-50 border border-uk-green-200 rounded-lg p-6 mb-8">
                  <h4 className="font-semibold text-uk-green-900 mb-3">Pro Tip</h4>
                  <p className="text-uk-green-800">
                    Use bank-specific templates for optimal conversion accuracy. A good conversion tool should automatically detect the bank format and apply appropriate processing rules.
                  </p>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Future of UK Bank Statement Formats</h2>
                <p className="text-gray-700 leading-relaxed mb-6">
                  Open Banking initiatives are driving standardization across UK financial institutions. Expect more consistent formatting and enhanced data fields in coming years.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Understanding current format variations ensures your processing systems remain robust while preparing for future standardization improvements.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}