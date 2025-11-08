import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Back Button */}
        <Link href="/" className="inline-block mb-8">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Terms of Service
          </h1>
          <p className="text-lg text-gray-600">
            Last updated: November 8, 2025
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Agreement to Terms</h2>
            <p className="text-gray-700 mb-4">
              By accessing or using ConvertBank Statement Converter ("Service," "we," "our," or "us"), you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, you may not use our Service.
            </p>
            <p className="text-gray-700">
              These Terms constitute a legally binding agreement between you and ConvertBank Statement Converter. Please read them carefully.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="text-gray-700 mb-4">
              ConvertBank Statement Converter is a web-based service that converts bank statements from PDF format into various formats including CSV, Excel, QIF, OFX, and JSON. Our service:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Processes bank statements from major UK banks and financial institutions</li>
              <li>Extracts transaction data using AI-powered parsing</li>
              <li>Converts data into multiple standard formats</li>
              <li>Does not store your bank statements after conversion</li>
              <li>Provides different subscription tiers with varying conversion limits</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Account Registration and Security</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">3.1 Account Creation</h3>
            <p className="text-gray-700 mb-4">
              To use our Service, you must:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Be at least 18 years of age</li>
              <li>Provide accurate and complete registration information</li>
              <li>Maintain and update your information to keep it accurate</li>
              <li>Maintain the security of your account credentials</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">3.2 Account Security</h3>
            <p className="text-gray-700 mb-4">
              You are responsible for:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Maintaining the confidentiality of your password</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized access</li>
            </ul>
            <p className="text-gray-700">
              We are not liable for any losses caused by unauthorized use of your account.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Subscription Plans and Pricing</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">4.1 Available Plans</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-4">
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-gray-900">Free Plan (£0.00/month)</p>
                  <p className="text-sm text-gray-600">3 conversions per month</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Starter Plan (£9.99/month)</p>
                  <p className="text-sm text-gray-600">30 conversions per month</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Professional Plan (£19.99/month)</p>
                  <p className="text-sm text-gray-600">100 conversions per month</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Business Plan (£39.99/month)</p>
                  <p className="text-sm text-gray-600">Unlimited conversions</p>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">4.2 Billing and Payment</h3>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Subscriptions are billed monthly in advance</li>
              <li>All prices are in British Pounds (GBP) and inclusive of VAT where applicable</li>
              <li>Payment is processed securely through Stripe</li>
              <li>You authorize us to charge your payment method for the subscription fee</li>
              <li>Conversion limits reset on the first day of each billing cycle</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">4.3 Automatic Renewal</h3>
            <p className="text-gray-700 mb-4">
              Subscriptions automatically renew each month unless canceled. You will be charged at the beginning of each billing period. You can cancel at any time through your account settings or the billing portal.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">4.4 Cancellation and Refunds</h3>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>You may cancel your subscription at any time</li>
              <li>Cancellation takes effect at the end of the current billing period</li>
              <li>No refunds are provided for partial months</li>
              <li>Upon cancellation, your account will revert to the Free plan</li>
              <li>You retain access to paid features until the end of the billing period</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">4.5 Price Changes</h3>
            <p className="text-gray-700">
              We reserve the right to modify pricing with 30 days' notice. Price changes will not affect your current billing cycle but will apply to subsequent renewals. You may cancel before the new price takes effect.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Acceptable Use Policy</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">5.1 Permitted Uses</h3>
            <p className="text-gray-700 mb-4">
              You may use the Service only for lawful purposes and in accordance with these Terms. You agree to use the Service only for converting your own bank statements or statements you are authorized to process.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">5.2 Prohibited Activities</h3>
            <p className="text-gray-700 mb-4">
              You agree NOT to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Upload or process documents you do not own or are not authorized to process</li>
              <li>Use the Service for any illegal or fraudulent purpose</li>
              <li>Attempt to reverse engineer, decompile, or disassemble the Service</li>
              <li>Use automated systems (bots, scripts) to access the Service</li>
              <li>Attempt to bypass usage limits or access controls</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Upload malicious code, viruses, or harmful content</li>
              <li>Resell, redistribute, or commercialize the Service without authorization</li>
              <li>Impersonate others or misrepresent your affiliation</li>
              <li>Collect or harvest user information</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">5.3 Enforcement</h3>
            <p className="text-gray-700">
              We reserve the right to suspend or terminate accounts that violate these terms without notice or refund. We may also report illegal activities to appropriate authorities.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Processing and Privacy</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">6.1 Your Data</h3>
            <p className="text-gray-700 mb-4">
              You retain all ownership rights to your bank statements and data. By using our Service, you grant us a limited license to process your data solely for the purpose of providing the conversion service.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">6.2 Data Security</h3>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Bank statements are processed entirely in memory</li>
              <li>No statements are stored on our servers</li>
              <li>All data is automatically deleted after conversion</li>
              <li>Communications are encrypted using TLS 1.3</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">6.3 Privacy</h3>
            <p className="text-gray-700">
              Our handling of personal data is governed by our <Link href="/privacy" className="text-uk-blue-600 hover:underline">Privacy Policy</Link>, which is incorporated into these Terms by reference.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Intellectual Property Rights</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">7.1 Our Intellectual Property</h3>
            <p className="text-gray-700 mb-4">
              The Service and its original content, features, and functionality are owned by ConvertBank Statement Converter and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">7.2 Limited License</h3>
            <p className="text-gray-700 mb-4">
              We grant you a limited, non-exclusive, non-transferable, revocable license to use the Service for your personal or internal business purposes in accordance with these Terms.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">7.3 Trademarks</h3>
            <p className="text-gray-700">
              ConvertBank, the ConvertBank logo, and other marks are trademarks of ConvertBank Statement Converter. You may not use these marks without our prior written permission.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Disclaimers and Limitations of Liability</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">8.1 Service "As Is"</h3>
            <p className="text-gray-700 mb-4">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">8.2 Accuracy Disclaimer</h3>
            <p className="text-gray-700 mb-4">
              While we strive for high accuracy in our conversions, we do not guarantee 100% accuracy. You are responsible for verifying the accuracy of converted data before using it for any purpose, including accounting, tax filing, or financial reporting.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">8.3 Limitation of Liability</h3>
            <p className="text-gray-700 mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, CONVERTBANK SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Your use or inability to use the Service</li>
              <li>Any unauthorized access to or use of our servers</li>
              <li>Any interruption or cessation of transmission to or from the Service</li>
              <li>Any bugs, viruses, or other harmful code</li>
              <li>Any errors or omissions in any content</li>
              <li>Any loss or damage of any kind incurred from use of the Service</li>
            </ul>
            <p className="text-gray-700">
              IN NO EVENT SHALL OUR AGGREGATE LIABILITY EXCEED THE AMOUNT YOU PAID US IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM OR £100, WHICHEVER IS GREATER.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Indemnification</h2>
            <p className="text-gray-700">
              You agree to indemnify, defend, and hold harmless ConvertBank Statement Converter, its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses, including reasonable attorneys' fees, arising out of or in any way connected with your access to or use of the Service, your violation of these Terms, or your violation of any rights of another.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Service Availability</h2>
            <p className="text-gray-700 mb-4">
              We strive to maintain high availability but do not guarantee uninterrupted access to the Service. We may:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Perform scheduled maintenance with advance notice</li>
              <li>Conduct emergency maintenance without notice</li>
              <li>Modify or discontinue features at any time</li>
              <li>Suspend the Service for technical or legal reasons</li>
            </ul>
            <p className="text-gray-700">
              We are not liable for any downtime, service interruptions, or data loss.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Governing Law and Dispute Resolution</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">11.1 Governing Law</h3>
            <p className="text-gray-700 mb-4">
              These Terms shall be governed by and construed in accordance with the laws of England and Wales, without regard to its conflict of law provisions.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">11.2 Dispute Resolution</h3>
            <p className="text-gray-700 mb-4">
              In the event of any dispute arising from these Terms or the Service:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>You agree to first attempt to resolve the dispute informally by contacting us</li>
              <li>If informal resolution fails, disputes shall be resolved through binding arbitration in accordance with the rules of the London Court of International Arbitration</li>
              <li>The arbitration shall take place in London, England</li>
              <li>Each party shall bear its own costs</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">11.3 Jurisdiction</h3>
            <p className="text-gray-700">
              You and ConvertBank agree to submit to the exclusive jurisdiction of the courts of England and Wales for any disputes not subject to arbitration.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Changes to Terms</h2>
            <p className="text-gray-700 mb-4">
              We reserve the right to modify these Terms at any time. When we make changes:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>We will update the "Last updated" date at the top of this page</li>
              <li>We will notify you via email for material changes</li>
              <li>Continued use of the Service constitutes acceptance of the new Terms</li>
              <li>You may terminate your account if you do not agree to the changes</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Termination</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">13.1 Termination by You</h3>
            <p className="text-gray-700 mb-4">
              You may terminate your account at any time by canceling your subscription and deleting your account through the account settings.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">13.2 Termination by Us</h3>
            <p className="text-gray-700 mb-4">
              We may terminate or suspend your account immediately, without prior notice, if:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>You breach these Terms</li>
              <li>We are required to do so by law</li>
              <li>We discontinue the Service</li>
              <li>We detect fraudulent or abusive activity</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">13.3 Effect of Termination</h3>
            <p className="text-gray-700">
              Upon termination, your right to use the Service ceases immediately. All provisions of these Terms that by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">14. General Provisions</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">14.1 Entire Agreement</h3>
            <p className="text-gray-700 mb-4">
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and ConvertBank regarding the Service.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">14.2 Severability</h3>
            <p className="text-gray-700 mb-4">
              If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full force and effect.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">14.3 Waiver</h3>
            <p className="text-gray-700 mb-4">
              Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">14.4 Assignment</h3>
            <p className="text-gray-700 mb-4">
              You may not assign or transfer these Terms or your account without our prior written consent. We may assign or transfer these Terms without restriction.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">14.5 Force Majeure</h3>
            <p className="text-gray-700">
              We shall not be liable for any delay or failure to perform resulting from causes outside our reasonable control, including but not limited to acts of God, war, terrorism, riots, embargoes, acts of civil or military authorities, fire, floods, accidents, network infrastructure failures, strikes, or shortages of transportation facilities, fuel, energy, labor, or materials.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Contact Information</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about these Terms, please contact us:
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <p className="text-gray-700 mb-2">
                <strong>Email:</strong> legal@convertbank-statement.com
              </p>
              <p className="text-gray-700 mb-2">
                <strong>Support:</strong> support@convertbank-statement.com
              </p>
              <p className="text-gray-700">
                <strong>Website:</strong> <a href="https://convertbank-statement.com" className="text-uk-blue-600 hover:underline">convertbank-statement.com</a>
              </p>
            </div>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <Link href="/privacy" className="text-uk-blue-600 hover:text-uk-blue-700 hover:underline">
              Privacy Policy
            </Link>
            <span className="text-gray-300">|</span>
            <Link href="/gdpr" className="text-uk-blue-600 hover:text-uk-blue-700 hover:underline">
              GDPR Compliance
            </Link>
            <span className="text-gray-300">|</span>
            <Link href="/security" className="text-uk-blue-600 hover:text-uk-blue-700 hover:underline">
              Security
            </Link>
            <span className="text-gray-300">|</span>
            <Link href="/contact" className="text-uk-blue-600 hover:text-uk-blue-700 hover:underline">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
