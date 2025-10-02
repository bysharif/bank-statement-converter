'use client'

import { ChevronLeft } from "lucide-react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Navigation } from '@/components/landing/navigation';
import { Footer } from '@/components/landing/footer';
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
                How to Convert Bank Statements for HMRC Digital Tax Returns
              </h1>
              <div className="flex gap-3">
                <Avatar className="size-10 rounded-full border-2 border-uk-blue-100">
                  <AvatarImage
                    src="https://images.unsplash.com/photo-1494790108755-2616b612b1a4?w=150&h=150&fit=crop&crop=face"
                    alt="Sarah Mitchell"
                  />
                </Avatar>
                <div>
                  <h2 className="font-semibold text-gray-900">Sarah Mitchell</h2>
                  <p className="text-gray-500 text-sm">15 Mar 2024 • 8 min read</p>
                </div>
              </div>
            </aside>

            <article className="flex-1 max-w-4xl">
              <img
                src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&h=600&fit=crop&crop=center"
                alt="HMRC Digital Tax Returns"
                className="mb-8 mt-0 aspect-video w-full rounded-lg object-cover border border-gray-200"
              />
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  Making Tax Digital (MTD) has revolutionized how UK businesses handle their tax obligations. One crucial aspect is ensuring your bank statements are properly formatted for HMRC submissions. This comprehensive guide walks you through the essential steps.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Understanding HMRC Digital Requirements</h2>
                <p className="text-gray-700 leading-relaxed mb-6">
                  HMRC's Making Tax Digital initiative requires businesses to keep digital records and submit VAT returns using compatible software. Your bank statements play a crucial role in this process, as they provide the foundational data for your tax calculations.
                </p>

                <blockquote className="border-l-4 border-uk-blue-600 pl-6 py-4 bg-uk-blue-50 rounded-r-lg mb-8">
                  <p className="text-gray-800 italic text-lg">
                    "Properly formatted bank statements can reduce your tax preparation time by up to 70% and significantly decrease the risk of errors in your HMRC submissions."
                  </p>
                </blockquote>

                <h3 className="text-xl font-semibold text-gray-900 mt-10 mb-4">Required Data Fields</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  HMRC-compliant bank statement conversions must include specific data fields to ensure accurate processing:
                </p>
                <ul className="list-disc pl-6 mb-8 space-y-2 text-gray-700">
                  <li>Transaction date in DD/MM/YYYY format</li>
                  <li>Transaction description with clear merchant information</li>
                  <li>Amount with proper decimal formatting (£00.00)</li>
                  <li>Transaction type (debit/credit)</li>
                  <li>Account balance after each transaction</li>
                  <li>Unique transaction reference numbers</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mt-10 mb-4">File Format Requirements</h3>
                <p className="text-gray-700 leading-relaxed mb-6">
                  HMRC accepts several file formats, but each has specific requirements:
                </p>

                <div className="bg-gray-50 rounded-lg p-6 mb-8">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 font-semibold text-gray-900">Format</th>
                        <th className="text-left py-3 font-semibold text-gray-900">Best For</th>
                        <th className="text-left py-3 font-semibold text-gray-900">HMRC Compatible</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-700">
                      <tr className="border-b border-gray-100">
                        <td className="py-3">CSV</td>
                        <td className="py-3">Most accounting software</td>
                        <td className="py-3">✓ Fully supported</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3">QIF</td>
                        <td className="py-3">QuickBooks, Sage</td>
                        <td className="py-3">✓ Fully supported</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3">Excel</td>
                        <td className="py-3">Manual processing</td>
                        <td className="py-3">⚠️ Requires conversion</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Step-by-Step Conversion Process</h2>

                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Step 1: Gather Your Bank Statements</h3>
                <p className="text-gray-700 leading-relaxed mb-6">
                  Download statements from all your business bank accounts for the relevant tax period. Most UK banks provide statements in PDF format, which will need to be converted to a structured data format.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Step 2: Choose Your Conversion Method</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You have several options for converting your bank statements:
                </p>
                <ul className="list-disc pl-6 mb-8 space-y-2 text-gray-700">
                  <li><strong>Automated AI conversion:</strong> 99.6% accuracy, processes in seconds</li>
                  <li><strong>Manual data entry:</strong> Time-intensive but gives full control</li>
                  <li><strong>OCR software:</strong> Moderate accuracy, requires verification</li>
                  <li><strong>Bank's own export tools:</strong> Limited formatting options</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Step 3: Validate and Clean Data</h3>
                <p className="text-gray-700 leading-relaxed mb-6">
                  Before submitting to HMRC, ensure your converted data is clean and accurate. Look for duplicate transactions, incorrect dates, and missing descriptions. A good conversion tool will automatically handle most of these issues.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Common Pitfalls to Avoid</h2>

                <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
                  <h4 className="font-semibold text-red-900 mb-3">Critical Mistakes That Cost Time</h4>
                  <ul className="space-y-2 text-red-800">
                    <li>• Using incorrect date formats (US vs UK)</li>
                    <li>• Missing transaction categories required by HMRC</li>
                    <li>• Duplicate entries from multiple statement periods</li>
                    <li>• Incomplete merchant information</li>
                    <li>• Currency formatting issues</li>
                  </ul>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Benefits of Proper Conversion</h2>
                <p className="text-gray-700 leading-relaxed mb-6">
                  When done correctly, converting your bank statements for HMRC digital submissions offers significant advantages:
                </p>
                <ul className="list-disc pl-6 mb-8 space-y-2 text-gray-700">
                  <li>Faster tax return processing and approval</li>
                  <li>Reduced risk of HMRC queries and investigations</li>
                  <li>Improved cash flow through quicker VAT refunds</li>
                  <li>Better financial record keeping and audit trails</li>
                  <li>Seamless integration with accounting software</li>
                </ul>

                <div className="bg-uk-green-50 border border-uk-green-200 rounded-lg p-6 mb-8">
                  <h4 className="font-semibold text-uk-green-900 mb-3">Pro Tip</h4>
                  <p className="text-uk-green-800">
                    Set up automated monthly conversions rather than waiting until tax deadline. This approach spreads the workload and helps identify issues early when they're easier to resolve.
                  </p>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Conclusion</h2>
                <p className="text-gray-700 leading-relaxed mb-6">
                  Converting bank statements for HMRC digital tax returns doesn't have to be complicated. By following the proper format requirements, using reliable conversion tools, and maintaining good data hygiene practices, you can ensure smooth submissions and maintain compliance with Making Tax Digital requirements.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Remember that investing time in proper bank statement conversion saves significantly more time during tax season and reduces the stress of dealing with HMRC queries or compliance issues.
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