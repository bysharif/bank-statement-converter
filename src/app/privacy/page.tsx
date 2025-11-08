import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PrivacyPolicyPage() {
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
            Privacy Policy
          </h1>
          <p className="text-lg text-gray-600">
            Last updated: November 8, 2025
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700 mb-4">
              ConvertBank Statement Converter ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our bank statement conversion service at convertbank-statement.com.
            </p>
            <p className="text-gray-700">
              By using our service, you agree to the collection and use of information in accordance with this policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">2.1 Personal Information</h3>
            <p className="text-gray-700 mb-4">
              When you register for an account, we collect:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Email address</li>
              <li>Name (optional)</li>
              <li>Payment information (processed securely through Stripe)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">2.2 Bank Statement Data</h3>
            <p className="text-gray-700 mb-4">
              When you upload bank statements for conversion, we temporarily process:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>PDF files containing bank statements</li>
              <li>Transaction data extracted from statements</li>
              <li>Account numbers and financial information (automatically redacted)</li>
            </ul>
            <p className="text-gray-700 mb-4">
              <strong>Important:</strong> We do not store your bank statements or transaction data after conversion. All files are processed in memory and immediately deleted after conversion is complete.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">2.3 Usage Information</h3>
            <p className="text-gray-700 mb-4">
              We automatically collect:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Number of conversions performed</li>
              <li>Conversion timestamps</li>
              <li>Browser type and version</li>
              <li>Device information</li>
              <li>IP address</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-700 mb-4">We use your information to:</p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Provide and maintain our bank statement conversion service</li>
              <li>Process your payments and manage subscriptions</li>
              <li>Send you service-related communications</li>
              <li>Monitor usage limits based on your subscription tier</li>
              <li>Improve our service and develop new features</li>
              <li>Detect and prevent fraud or abuse</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Storage and Security</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">4.1 Bank Statement Processing</h3>
            <p className="text-gray-700 mb-4">
              Your bank statements are:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Processed entirely in memory on secure servers</li>
              <li>Never stored on our servers or databases</li>
              <li>Automatically deleted immediately after conversion</li>
              <li>Transmitted using industry-standard encryption (TLS 1.3)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">4.2 Account Data</h3>
            <p className="text-gray-700 mb-4">
              Your account information is:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Stored in encrypted databases (Supabase with PostgreSQL)</li>
              <li>Protected with industry-standard security measures</li>
              <li>Accessible only to authorized personnel</li>
              <li>Regularly backed up for disaster recovery</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">4.3 Payment Information</h3>
            <p className="text-gray-700 mb-4">
              Payment processing is handled entirely by Stripe, our PCI-DSS compliant payment processor. We do not store your credit card information on our servers.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Sharing and Disclosure</h2>
            <p className="text-gray-700 mb-4">
              We do not sell, trade, or rent your personal information. We may share your information only in the following circumstances:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li><strong>Service Providers:</strong> Stripe (payment processing), Supabase (database hosting), Vercel (web hosting)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Your Rights (GDPR & UK GDPR)</h2>
            <p className="text-gray-700 mb-4">
              As a UK-based service, we comply with the UK General Data Protection Regulation (UK GDPR). You have the right to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Rectification:</strong> Correct inaccurate personal data</li>
              <li><strong>Erasure:</strong> Request deletion of your personal data ("right to be forgotten")</li>
              <li><strong>Restriction:</strong> Restrict processing of your personal data</li>
              <li><strong>Portability:</strong> Receive your data in a machine-readable format</li>
              <li><strong>Objection:</strong> Object to processing of your personal data</li>
              <li><strong>Withdraw Consent:</strong> Withdraw consent at any time</li>
            </ul>
            <p className="text-gray-700">
              To exercise these rights, please contact us at privacy@convertbank-statement.com
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Data Retention</h2>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li><strong>Bank Statements:</strong> Never stored (deleted immediately after conversion)</li>
              <li><strong>Account Data:</strong> Retained while your account is active</li>
              <li><strong>Usage Logs:</strong> Retained for 12 months for fraud prevention</li>
              <li><strong>Payment Records:</strong> Retained for 7 years for tax compliance</li>
            </ul>
            <p className="text-gray-700">
              You can request account deletion at any time, which will remove all personal data except records required for legal compliance.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Cookies and Tracking</h2>
            <p className="text-gray-700 mb-4">
              We use essential cookies to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Maintain your session while logged in</li>
              <li>Remember your preferences</li>
              <li>Analyze website usage (anonymized)</li>
            </ul>
            <p className="text-gray-700">
              You can control cookies through your browser settings. Disabling essential cookies may affect service functionality.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Third-Party Services</h2>
            <p className="text-gray-700 mb-4">
              Our service integrates with:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li><strong>Stripe:</strong> Payment processing (Stripe Privacy Policy)</li>
              <li><strong>Supabase:</strong> Database hosting (Supabase Privacy Policy)</li>
              <li><strong>Vercel:</strong> Web hosting (Vercel Privacy Policy)</li>
            </ul>
            <p className="text-gray-700">
              These services have their own privacy policies and we recommend reviewing them.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. International Data Transfers</h2>
            <p className="text-gray-700 mb-4">
              Your data may be transferred to and processed in countries outside the UK. We ensure appropriate safeguards are in place, including:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Standard Contractual Clauses (SCCs) approved by the UK ICO</li>
              <li>Adequacy decisions recognized by UK law</li>
              <li>Binding Corporate Rules where applicable</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Children's Privacy</h2>
            <p className="text-gray-700">
              Our service is not intended for individuals under 18 years of age. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Changes to This Privacy Policy</h2>
            <p className="text-gray-700 mb-4">
              We may update this Privacy Policy from time to time. We will notify you of significant changes by:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Posting the new Privacy Policy on this page</li>
              <li>Updating the "Last updated" date</li>
              <li>Sending an email notification for material changes</li>
            </ul>
            <p className="text-gray-700">
              Your continued use of the service after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have questions about this Privacy Policy or wish to exercise your rights, please contact us:
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <p className="text-gray-700 mb-2">
                <strong>Email:</strong> privacy@convertbank-statement.com
              </p>
              <p className="text-gray-700 mb-2">
                <strong>Data Protection Officer:</strong> dpo@convertbank-statement.com
              </p>
              <p className="text-gray-700">
                <strong>Supervisory Authority:</strong> You have the right to lodge a complaint with the UK Information Commissioner's Office (ICO) at <a href="https://ico.org.uk" className="text-uk-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">ico.org.uk</a>
              </p>
            </div>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <Link href="/terms" className="text-uk-blue-600 hover:text-uk-blue-700 hover:underline">
              Terms of Service
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
