import Link from 'next/link'
import { ArrowLeft, Shield, FileText, Users, Lock, CheckCircle, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function GDPRCompliancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Back Button */}
        <Link href="/" className="inline-block mb-8">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-uk-blue-100 rounded-full mb-6">
            <Shield className="h-8 w-8 text-uk-blue-600" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            GDPR Compliance
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            How ConvertBank Statement Converter complies with UK GDPR and protects your data rights
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Last updated: November 8, 2025
          </p>
        </div>

        {/* Introduction */}
        <section className="mb-16">
          <div className="bg-gradient-to-br from-uk-blue-50 to-uk-green-50 rounded-2xl p-8 border border-uk-blue-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Commitment to Data Protection</h2>
            <p className="text-gray-700 mb-4">
              ConvertBank Statement Converter is fully compliant with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018. As a UK-based service processing financial data, we take data protection extremely seriously.
            </p>
            <p className="text-gray-700">
              This page explains how we comply with GDPR principles and how you can exercise your data rights.
            </p>
          </div>
        </section>

        {/* GDPR Principles */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">GDPR Principles We Follow</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-uk-blue-100 rounded-full p-2">
                  <CheckCircle className="h-5 w-5 text-uk-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Lawfulness, Fairness & Transparency</h3>
              </div>
              <p className="text-gray-700">
                We process your data lawfully based on your consent and our legitimate interests. We are transparent about what data we collect and how we use it.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-uk-blue-100 rounded-full p-2">
                  <CheckCircle className="h-5 w-5 text-uk-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Purpose Limitation</h3>
              </div>
              <p className="text-gray-700">
                We collect data solely for bank statement conversion and service provision. We do not use your data for any other purposes.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-uk-blue-100 rounded-full p-2">
                  <CheckCircle className="h-5 w-5 text-uk-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Data Minimization</h3>
              </div>
              <p className="text-gray-700">
                We only collect the minimum data necessary: email address for account creation. Bank statements are never stored after processing.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-uk-blue-100 rounded-full p-2">
                  <CheckCircle className="h-5 w-5 text-uk-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Accuracy</h3>
              </div>
              <p className="text-gray-700">
                You can update your account information at any time. We ensure your personal data is accurate and up-to-date.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-uk-blue-100 rounded-full p-2">
                  <CheckCircle className="h-5 w-5 text-uk-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Storage Limitation</h3>
              </div>
              <p className="text-gray-700">
                Bank statements are never stored. Account data is retained only as long as your account is active. You can request deletion at any time.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-uk-blue-100 rounded-full p-2">
                  <CheckCircle className="h-5 w-5 text-uk-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Integrity & Confidentiality</h3>
              </div>
              <p className="text-gray-700">
                We use encryption, secure servers, and strict access controls to protect your data from unauthorized access, loss, or damage.
              </p>
            </div>
          </div>
        </section>

        {/* Your GDPR Rights */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Your Data Rights Under UK GDPR</h2>
          <div className="space-y-6">
            {/* Right to Access */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="bg-uk-blue-100 rounded-full p-3 flex-shrink-0">
                  <FileText className="h-6 w-6 text-uk-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Right to Access (Article 15)</h3>
                  <p className="text-gray-700 mb-3">
                    You have the right to request a copy of all personal data we hold about you. This includes:
                  </p>
                  <ul className="space-y-2 text-gray-700 ml-4">
                    <li className="flex items-start gap-2">
                      <span className="text-uk-blue-600 font-bold">•</span>
                      <span>Account information (email, name)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-uk-blue-600 font-bold">•</span>
                      <span>Subscription details and payment history</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-uk-blue-600 font-bold">•</span>
                      <span>Usage statistics (number of conversions, timestamps)</span>
                    </li>
                  </ul>
                  <p className="text-gray-700 mt-3">
                    <strong>Note:</strong> Bank statements are not included because we do not store them.
                  </p>
                  <p className="text-sm text-gray-600 mt-3">
                    <strong>How to exercise:</strong> Email privacy@convertbank-statement.com with "Subject Access Request" in the subject line. We will respond within 30 days.
                  </p>
                </div>
              </div>
            </div>

            {/* Right to Rectification */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="bg-uk-green-100 rounded-full p-3 flex-shrink-0">
                  <Users className="h-6 w-6 text-uk-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Right to Rectification (Article 16)</h3>
                  <p className="text-gray-700 mb-3">
                    You have the right to correct any inaccurate or incomplete personal data. You can:
                  </p>
                  <ul className="space-y-2 text-gray-700 ml-4">
                    <li className="flex items-start gap-2">
                      <span className="text-uk-green-600 font-bold">•</span>
                      <span>Update your email address and name through account settings</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-uk-green-600 font-bold">•</span>
                      <span>Request corrections by contacting us</span>
                    </li>
                  </ul>
                  <p className="text-sm text-gray-600 mt-3">
                    <strong>How to exercise:</strong> Log into your account and update information, or email privacy@convertbank-statement.com
                  </p>
                </div>
              </div>
            </div>

            {/* Right to Erasure */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="bg-purple-100 rounded-full p-3 flex-shrink-0">
                  <Lock className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Right to Erasure - "Right to be Forgotten" (Article 17)</h3>
                  <p className="text-gray-700 mb-3">
                    You have the right to request deletion of your personal data. Upon your request, we will permanently delete:
                  </p>
                  <ul className="space-y-2 text-gray-700 ml-4">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 font-bold">•</span>
                      <span>Your account information</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 font-bold">•</span>
                      <span>Usage history and metadata</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 font-bold">•</span>
                      <span>All personal identifiable information</span>
                    </li>
                  </ul>
                  <p className="text-gray-700 mt-3">
                    <strong>Exceptions:</strong> We may retain payment records for 7 years for tax compliance as required by UK law.
                  </p>
                  <p className="text-sm text-gray-600 mt-3">
                    <strong>How to exercise:</strong> Email privacy@convertbank-statement.com with "Account Deletion Request". Deletion is typically completed within 48 hours.
                  </p>
                </div>
              </div>
            </div>

            {/* Right to Restriction */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="bg-orange-100 rounded-full p-3 flex-shrink-0">
                  <Shield className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Right to Restriction of Processing (Article 18)</h3>
                  <p className="text-gray-700 mb-3">
                    You have the right to request that we limit how we process your data in certain circumstances:
                  </p>
                  <ul className="space-y-2 text-gray-700 ml-4">
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600 font-bold">•</span>
                      <span>If you contest the accuracy of your data</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600 font-bold">•</span>
                      <span>If processing is unlawful but you don't want erasure</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600 font-bold">•</span>
                      <span>If we no longer need the data but you need it for legal claims</span>
                    </li>
                  </ul>
                  <p className="text-sm text-gray-600 mt-3">
                    <strong>How to exercise:</strong> Email privacy@convertbank-statement.com with details of your restriction request
                  </p>
                </div>
              </div>
            </div>

            {/* Right to Data Portability */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="bg-red-100 rounded-full p-3 flex-shrink-0">
                  <FileText className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Right to Data Portability (Article 20)</h3>
                  <p className="text-gray-700 mb-3">
                    You have the right to receive your personal data in a structured, machine-readable format (JSON or CSV) and transfer it to another service.
                  </p>
                  <p className="text-sm text-gray-600 mt-3">
                    <strong>How to exercise:</strong> Email privacy@convertbank-statement.com requesting a data export. We will provide your data within 30 days.
                  </p>
                </div>
              </div>
            </div>

            {/* Right to Object */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="bg-yellow-100 rounded-full p-3 flex-shrink-0">
                  <Shield className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Right to Object (Article 21)</h3>
                  <p className="text-gray-700 mb-3">
                    You have the right to object to processing of your personal data based on legitimate interests or for direct marketing purposes.
                  </p>
                  <p className="text-gray-700">
                    <strong>Note:</strong> We do not use your data for direct marketing. You can object to essential processing by closing your account.
                  </p>
                  <p className="text-sm text-gray-600 mt-3">
                    <strong>How to exercise:</strong> Email privacy@convertbank-statement.com with your objection
                  </p>
                </div>
              </div>
            </div>

            {/* Right to Withdraw Consent */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="bg-indigo-100 rounded-full p-3 flex-shrink-0">
                  <Users className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Right to Withdraw Consent (Article 7)</h3>
                  <p className="text-gray-700 mb-3">
                    Where processing is based on consent, you have the right to withdraw that consent at any time. This includes:
                  </p>
                  <ul className="space-y-2 text-gray-700 ml-4">
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span>Marketing communications (if any)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span>Optional data collection</span>
                    </li>
                  </ul>
                  <p className="text-sm text-gray-600 mt-3">
                    <strong>How to exercise:</strong> Update preferences in account settings or email privacy@convertbank-statement.com
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Data We Process */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">What Data We Process</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-uk-blue-600">Personal Data We Store</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-uk-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Email address</strong> - for account authentication</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-uk-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Name</strong> (optional) - for personalization</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-uk-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Subscription details</strong> - tier, status, limits</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-uk-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Usage metadata</strong> - conversion count, timestamps</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-uk-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Stripe customer ID</strong> - for payment processing</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-red-600">Data We Never Store</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold text-xl">✗</span>
                  <span><strong>Bank statements</strong> - deleted immediately after processing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold text-xl">✗</span>
                  <span><strong>Transaction details</strong> - never logged or stored</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold text-xl">✗</span>
                  <span><strong>Account numbers</strong> - processed in memory only</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold text-xl">✗</span>
                  <span><strong>Card details</strong> - handled entirely by Stripe</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold text-xl">✗</span>
                  <span><strong>Browsing history</strong> - no tracking cookies</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Lawful Basis */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Lawful Basis for Processing</h2>
          <div className="bg-white rounded-xl p-8 border border-gray-200">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Contract Performance (Article 6(1)(b))</h3>
                <p className="text-gray-700">
                  We process your account data and usage information to fulfill our contract with you - providing bank statement conversion services.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Legitimate Interests (Article 6(1)(f))</h3>
                <p className="text-gray-700">
                  We process usage metadata for fraud prevention, service improvement, and system security - balanced against your privacy rights.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Legal Obligation (Article 6(1)(c))</h3>
                <p className="text-gray-700">
                  We retain payment records for 7 years to comply with UK tax law and financial regulations.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Consent (Article 6(1)(a))</h3>
                <p className="text-gray-700">
                  We obtain your explicit consent for optional communications and data collection beyond essential service provision.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* International Transfers */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">International Data Transfers</h2>
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <p className="text-gray-700 mb-4">
              Some of our service providers may process data outside the UK. We ensure appropriate safeguards are in place:
            </p>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-uk-green-600 flex-shrink-0 mt-0.5" />
                <span><strong>Standard Contractual Clauses (SCCs):</strong> Approved by the UK ICO for transfers to countries without adequacy decisions</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-uk-green-600 flex-shrink-0 mt-0.5" />
                <span><strong>Adequacy Decisions:</strong> We prefer providers in countries recognized as having adequate data protection</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-uk-green-600 flex-shrink-0 mt-0.5" />
                <span><strong>Encryption in Transit:</strong> All international data transfers use TLS 1.3 encryption</span>
              </li>
            </ul>
            <p className="text-gray-700 mt-4">
              <strong>Note:</strong> Bank statements are never transferred internationally because they are never stored.
            </p>
          </div>
        </section>

        {/* Supervisory Authority */}
        <section className="mb-16">
          <div className="bg-uk-blue-50 border border-uk-blue-200 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Right to Lodge a Complaint</h2>
            <p className="text-gray-700 mb-6 text-center">
              You have the right to lodge a complaint with the UK supervisory authority if you believe we have not complied with GDPR:
            </p>
            <div className="bg-white rounded-lg p-6 max-w-2xl mx-auto">
              <h3 className="font-semibold text-gray-900 mb-3">Information Commissioner's Office (ICO)</h3>
              <div className="space-y-2 text-gray-700">
                <p><strong>Website:</strong> <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="text-uk-blue-600 hover:underline">ico.org.uk</a></p>
                <p><strong>Telephone:</strong> 0303 123 1113</p>
                <p><strong>Address:</strong> Information Commissioner's Office, Wycliffe House, Water Lane, Wilmslow, Cheshire, SK9 5AF</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm text-center mt-6">
              However, we encourage you to contact us first so we can address your concerns directly.
            </p>
          </div>
        </section>

        {/* Contact DPO */}
        <section className="text-center">
          <div className="bg-white rounded-2xl p-8 border border-gray-200">
            <Mail className="h-12 w-12 text-uk-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Contact Our Data Protection Officer</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              For any questions about GDPR compliance, data protection, or to exercise your rights, please contact our Data Protection Officer:
            </p>
            <div className="space-y-2 text-gray-700 mb-6">
              <p><strong>Email:</strong> <a href="mailto:dpo@convertbank-statement.com" className="text-uk-blue-600 hover:underline">dpo@convertbank-statement.com</a></p>
              <p><strong>Privacy Team:</strong> <a href="mailto:privacy@convertbank-statement.com" className="text-uk-blue-600 hover:underline">privacy@convertbank-statement.com</a></p>
            </div>
            <p className="text-sm text-gray-600">
              We aim to respond to all GDPR requests within 30 days as required by law.
            </p>
          </div>
        </section>

        {/* Footer Navigation */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <Link href="/privacy" className="text-uk-blue-600 hover:text-uk-blue-700 hover:underline">
              Privacy Policy
            </Link>
            <span className="text-gray-300">|</span>
            <Link href="/security" className="text-uk-blue-600 hover:text-uk-blue-700 hover:underline">
              Security
            </Link>
            <span className="text-gray-300">|</span>
            <Link href="/terms" className="text-uk-blue-600 hover:text-uk-blue-700 hover:underline">
              Terms of Service
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
