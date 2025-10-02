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
                5 Common Mistakes When Converting Bank Statements
              </h1>
              <div className="flex gap-3">
                <Avatar className="size-10 rounded-full border-2 border-uk-blue-100">
                  <AvatarImage
                    src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
                    alt="Emma Wilson"
                  />
                </Avatar>
                <div>
                  <h2 className="font-semibold text-gray-900">Emma Wilson</h2>
                  <p className="text-gray-500 text-sm">5 Apr 2024 • 7 min read</p>
                </div>
              </div>
            </aside>

            <article className="flex-1 max-w-4xl">
              <img
                src="https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1200&h=600&fit=crop&crop=center"
                alt="Common Bank Statement Conversion Mistakes"
                className="mb-8 mt-0 aspect-video w-full rounded-lg object-cover border border-gray-200"
              />
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  Even experienced finance teams make critical errors when converting bank statements that can lead to compliance issues, data corruption, and hours of remedial work. Here are the five most common mistakes and how to avoid them.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Mistake #1: Ignoring Date Format Variations</h2>
                <p className="text-gray-700 leading-relaxed mb-6">
                  The most frequent error is assuming all banks use the same date format. UK banks vary between DD/MM/YYYY, DD/MM/YY, and DD MMM YY formats, which can cause transactions to be misdated by months or years.
                </p>

                <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
                  <h4 className="font-semibold text-red-900 mb-3">Real Example</h4>
                  <p className="text-red-800 mb-2">
                    A finance team processed "02/03/24" as 3rd February instead of 2nd March, causing a £15,000 payment to be recorded in the wrong quarter for VAT purposes.
                  </p>
                  <p className="text-red-800 text-sm">
                    <strong>Impact:</strong> HMRC query, penalty fees, and 8 hours of correction work.
                  </p>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">How to Avoid This Mistake</h3>
                <ul className="list-disc pl-6 mb-8 space-y-2 text-gray-700">
                  <li>Always verify the bank's date format before processing</li>
                  <li>Use bank-specific templates or detection algorithms</li>
                  <li>Cross-reference with known transaction dates for validation</li>
                  <li>Implement date format warnings in your conversion process</li>
                </ul>

                <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Mistake #2: Duplicate Transaction Processing</h2>
                <p className="text-gray-700 leading-relaxed mb-6">
                  Processing overlapping statement periods without proper duplicate detection inflates balances and transaction counts, leading to significant reconciliation problems.
                </p>

                <blockquote className="border-l-4 border-uk-blue-600 pl-6 py-4 bg-uk-blue-50 rounded-r-lg mb-8">
                  <p className="text-gray-800 italic">
                    "We discovered we'd been double-counting standing orders for six months. The error only came to light during our annual audit."
                  </p>
                  <footer className="text-gray-600 mt-2">— Senior Accountant, Manufacturing Company</footer>
                </blockquote>

                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Duplicate Detection Strategy</h3>
                <ol className="list-decimal pl-6 mb-8 space-y-3 text-gray-700">
                  <li><strong>Check date ranges:</strong> Identify overlapping periods before processing</li>
                  <li><strong>Match transaction fingerprints:</strong> Compare date, amount, and description</li>
                  <li><strong>Verify reference numbers:</strong> Use unique identifiers when available</li>
                  <li><strong>Flag for review:</strong> Mark potential duplicates for manual verification</li>
                </ol>

                <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Mistake #3: Incomplete Merchant Information</h2>
                <p className="text-gray-700 leading-relaxed mb-6">
                  Truncating or losing merchant details during conversion makes categorization difficult and reduces audit trail quality. Many accounting software packages rely on merchant names for automatic categorization.
                </p>

                <div className="bg-gray-50 rounded-lg p-6 mb-8">
                  <h4 className="font-semibold text-gray-900 mb-4">Examples of Information Loss</h4>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 font-semibold">Original</th>
                        <th className="text-left py-2 font-semibold">Incorrectly Converted</th>
                        <th className="text-left py-2 font-semibold">Impact</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-700">
                      <tr className="border-b border-gray-100">
                        <td className="py-2">OFFICE DEPOT LONDON BRANCH 4</td>
                        <td className="py-2">OFFICE DEPOT</td>
                        <td className="py-2">Lost location data</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2">HMRC VAT PAYMENT REF: 123456789</td>
                        <td className="py-2">HMRC VAT</td>
                        <td className="py-2">Lost reference number</td>
                      </tr>
                      <tr>
                        <td className="py-2">SALARY PAYMENT MARCH 2024 EMP001</td>
                        <td className="py-2">SALARY</td>
                        <td className="py-2">Lost period and employee ID</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Mistake #4: Currency and Amount Formatting Errors</h2>
                <p className="text-gray-700 leading-relaxed mb-6">
                  Mishandling decimal points, thousand separators, and currency symbols can create massive calculation errors that are difficult to detect until reconciliation.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Common Formatting Pitfalls</h3>
                <ul className="list-disc pl-6 mb-8 space-y-2 text-gray-700">
                  <li><strong>Decimal confusion:</strong> "1,234.56" interpreted as "1.234,56" in some locales</li>
                  <li><strong>Missing decimals:</strong> "£1000" recorded as "£10.00" instead of "£1000.00"</li>
                  <li><strong>Negative amounts:</strong> Credits shown as "-£500" instead of positive £500</li>
                  <li><strong>Currency stripping:</strong> Losing currency indicators during conversion</li>
                </ul>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
                  <h4 className="font-semibold text-yellow-900 mb-3">Prevention Checklist</h4>
                  <ul className="space-y-2 text-yellow-800 text-sm">
                    <li>✓ Validate amount totals against statement summaries</li>
                    <li>✓ Check for unrealistic amounts (too high/low)</li>
                    <li>✓ Verify debit/credit indicators are correct</li>
                    <li>✓ Ensure decimal precision is maintained</li>
                    <li>✓ Test with known transaction amounts first</li>
                  </ul>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Mistake #5: Skipping Data Validation</h2>
                <p className="text-gray-700 leading-relaxed mb-6">
                  The most costly mistake is failing to validate converted data before importing into accounting systems. Once corrupted data enters your books, correction becomes exponentially more difficult.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Essential Validation Steps</h3>
                <ol className="list-decimal pl-6 mb-8 space-y-3 text-gray-700">
                  <li><strong>Balance reconciliation:</strong> Opening + transactions = closing balance</li>
                  <li><strong>Transaction count verification:</strong> Ensure no transactions are missing</li>
                  <li><strong>Date sequence checking:</strong> Verify chronological order</li>
                  <li><strong>Amount reasonableness:</strong> Flag unusually large/small amounts</li>
                  <li><strong>Format consistency:</strong> Check all fields follow expected patterns</li>
                </ol>

                <div className="bg-uk-green-50 border border-uk-green-200 rounded-lg p-6 mb-8">
                  <h4 className="font-semibold text-uk-green-900 mb-3">Automated Validation Benefits</h4>
                  <p className="text-uk-green-800">
                    Quality conversion tools perform these validations automatically, catching 99% of errors before they impact your accounting system. Manual validation is time-consuming and error-prone.
                  </p>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Building Error-Resistant Processes</h2>
                <p className="text-gray-700 leading-relaxed mb-6">
                  The best defense against conversion mistakes is implementing systematic checks and using purpose-built tools designed for bank statement processing.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Process Improvement Framework</h3>
                <ul className="list-disc pl-6 mb-8 space-y-2 text-gray-700">
                  <li><strong>Standardize procedures:</strong> Document conversion workflows for consistency</li>
                  <li><strong>Use specialized tools:</strong> Bank-specific conversion software reduces errors</li>
                  <li><strong>Implement peer review:</strong> Second-person verification for critical conversions</li>
                  <li><strong>Maintain audit logs:</strong> Track what was converted, when, and by whom</li>
                  <li><strong>Regular training:</strong> Keep team updated on common pitfalls</li>
                </ul>

                <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Conclusion</h2>
                <p className="text-gray-700 leading-relaxed mb-6">
                  These five mistakes account for over 80% of bank statement conversion problems we see in practice. By being aware of these pitfalls and implementing proper validation procedures, you can eliminate most conversion errors before they impact your financial records.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Remember: time spent on accurate conversion upfront saves exponentially more time in corrections, reconciliation, and compliance activities later.
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