import Link from 'next/link'
import { ArrowLeft, Shield, Lock, Eye, Server, FileCheck, AlertTriangle, CheckCircle, Key } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function SecurityPage() {
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
            Security & Data Protection
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your financial data security is our top priority. Learn about our comprehensive security measures.
          </p>
        </div>

        {/* Security Promise */}
        <section className="mb-16">
          <div className="bg-gradient-to-br from-uk-blue-600 to-uk-blue-700 rounded-2xl p-8 lg:p-12 text-white">
            <h2 className="text-3xl font-bold mb-6 text-center">Our Security Promise</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <FileCheck className="h-12 w-12 mx-auto mb-3" />
                <h3 className="font-semibold text-lg mb-2">Never Stored</h3>
                <p className="text-sm opacity-90">
                  Your bank statements are never saved to our servers
                </p>
              </div>
              <div className="text-center">
                <Lock className="h-12 w-12 mx-auto mb-3" />
                <h3 className="font-semibold text-lg mb-2">Always Encrypted</h3>
                <p className="text-sm opacity-90">
                  All data transmitted with TLS 1.3 encryption
                </p>
              </div>
              <div className="text-center">
                <Eye className="h-12 w-12 mx-auto mb-3" />
                <h3 className="font-semibold text-lg mb-2">No Human Access</h3>
                <p className="text-sm opacity-90">
                  Automated processing - staff never see your data
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Data Processing Security */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How We Protect Your Data</h2>

          <div className="space-y-6">
            {/* In-Memory Processing */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="bg-uk-blue-100 rounded-full p-3 flex-shrink-0">
                  <Server className="h-6 w-6 text-uk-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">In-Memory Processing Only</h3>
                  <p className="text-gray-700 mb-4">
                    When you upload a bank statement, it is processed entirely in the server's memory (RAM). We never write your statements to disk, databases, or any persistent storage. This means:
                  </p>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-uk-green-600 flex-shrink-0 mt-0.5" />
                      <span>No traces of your statement remain on our servers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-uk-green-600 flex-shrink-0 mt-0.5" />
                      <span>Data is automatically purged when processing completes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-uk-green-600 flex-shrink-0 mt-0.5" />
                      <span>Memory is cleared immediately after conversion</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-uk-green-600 flex-shrink-0 mt-0.5" />
                      <span>Even in case of server failure, your data is not recoverable</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Encryption */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="bg-purple-100 rounded-full p-3 flex-shrink-0">
                  <Lock className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">End-to-End Encryption</h3>
                  <p className="text-gray-700 mb-4">
                    All data transmitted between your browser and our servers is protected with industry-standard encryption:
                  </p>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-uk-green-600 flex-shrink-0 mt-0.5" />
                      <span><strong>TLS 1.3:</strong> The latest transport layer security protocol</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-uk-green-600 flex-shrink-0 mt-0.5" />
                      <span><strong>256-bit AES encryption:</strong> Military-grade encryption standard</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-uk-green-600 flex-shrink-0 mt-0.5" />
                      <span><strong>HTTPS-only:</strong> No unencrypted connections allowed</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-uk-green-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Perfect Forward Secrecy:</strong> Past communications cannot be decrypted even if keys are compromised</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Automated Processing */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="bg-orange-100 rounded-full p-3 flex-shrink-0">
                  <Eye className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Zero Human Access</h3>
                  <p className="text-gray-700 mb-4">
                    Your bank statements are processed by automated systems only:
                  </p>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-uk-green-600 flex-shrink-0 mt-0.5" />
                      <span>No staff members have access to your uploaded files</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-uk-green-600 flex-shrink-0 mt-0.5" />
                      <span>AI-powered parsing runs automatically without human intervention</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-uk-green-600 flex-shrink-0 mt-0.5" />
                      <span>No logging of transaction details or account numbers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-uk-green-600 flex-shrink-0 mt-0.5" />
                      <span>Only metadata (file size, conversion time) is tracked for system monitoring</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Access Control */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="bg-uk-green-100 rounded-full p-3 flex-shrink-0">
                  <Key className="h-6 w-6 text-uk-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Strict Access Controls</h3>
                  <p className="text-gray-700 mb-4">
                    We implement multiple layers of access control and authentication:
                  </p>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-uk-green-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Account Authentication:</strong> Secure login with email verification</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-uk-green-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Session Management:</strong> Automatic timeout after inactivity</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-uk-green-600 flex-shrink-0 mt-0.5" />
                      <span><strong>API Security:</strong> Rate limiting and request validation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-uk-green-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Infrastructure Access:</strong> Multi-factor authentication for all staff accounts</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Infrastructure Security */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Infrastructure & Compliance</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Hosting & Infrastructure</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-uk-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Vercel:</strong> Enterprise-grade hosting with global CDN</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-uk-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Supabase:</strong> PostgreSQL database with encryption at rest</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-uk-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>DDoS Protection:</strong> Automatic mitigation of attacks</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-uk-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Redundancy:</strong> Multiple availability zones for high uptime</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Standards</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-uk-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>UK GDPR:</strong> Full compliance with UK data protection law</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-uk-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>PCI DSS:</strong> Payment processing via Stripe (Level 1 PCI certified)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-uk-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Data Protection Act 2018:</strong> UK data protection compliance</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-uk-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>ISO 27001:</strong> Information security management</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Security</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-uk-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Stripe Payment Gateway:</strong> Industry-leading payment processor</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-uk-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>PCI DSS Level 1:</strong> Highest level of payment security certification</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-uk-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>No Card Storage:</strong> We never see or store your card details</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-uk-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>3D Secure:</strong> Additional authentication layer for card payments</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Monitoring & Response</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-uk-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>24/7 Monitoring:</strong> Continuous system health and security monitoring</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-uk-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Intrusion Detection:</strong> Automated threat detection and response</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-uk-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Incident Response:</strong> Documented procedures for security events</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-uk-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Regular Audits:</strong> Security reviews and vulnerability assessments</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* What We Don't Do */}
        <section className="mb-16">
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <h2 className="text-2xl font-bold text-gray-900">What We Never Do</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <span className="text-red-600 font-bold text-xl">✗</span>
                <span className="text-gray-700">Store your bank statements on our servers</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-600 font-bold text-xl">✗</span>
                <span className="text-gray-700">Share your data with third parties</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-600 font-bold text-xl">✗</span>
                <span className="text-gray-700">Sell or monetize your financial information</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-600 font-bold text-xl">✗</span>
                <span className="text-gray-700">Use your data for marketing purposes</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-600 font-bold text-xl">✗</span>
                <span className="text-gray-700">Keep logs of account numbers or transactions</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-600 font-bold text-xl">✗</span>
                <span className="text-gray-700">Allow staff access to your uploaded documents</span>
              </div>
            </div>
          </div>
        </section>

        {/* Security Best Practices */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Your Security Responsibilities</h2>
          <div className="bg-white rounded-xl p-8 border border-gray-200">
            <p className="text-gray-700 mb-6">
              While we implement robust security measures, you also play a crucial role in protecting your account:
            </p>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-uk-blue-600 flex-shrink-0 mt-0.5" />
                <span><strong>Use a strong password:</strong> At least 12 characters with mixed case, numbers, and symbols</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-uk-blue-600 flex-shrink-0 mt-0.5" />
                <span><strong>Never share your password:</strong> Keep your login credentials confidential</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-uk-blue-600 flex-shrink-0 mt-0.5" />
                <span><strong>Log out on shared devices:</strong> Always log out when using public computers</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-uk-blue-600 flex-shrink-0 mt-0.5" />
                <span><strong>Keep your device secure:</strong> Use up-to-date antivirus software</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-uk-blue-600 flex-shrink-0 mt-0.5" />
                <span><strong>Verify our website:</strong> Always check the URL is convertbank-statement.com</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-uk-blue-600 flex-shrink-0 mt-0.5" />
                <span><strong>Report suspicious activity:</strong> Contact us immediately if you notice anything unusual</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Security Contact */}
        <section className="text-center">
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border border-gray-200">
            <Shield className="h-12 w-12 text-uk-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Security Questions or Concerns?</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              If you have security questions, discovered a vulnerability, or have concerns about your data, please contact our security team immediately.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="mailto:security@convertbank-statement.com">
                <Button size="lg" className="bg-uk-blue-600 hover:bg-uk-blue-700">
                  Contact Security Team
                </Button>
              </a>
              <Link href="/privacy">
                <Button size="lg" variant="outline">
                  Read Privacy Policy
                </Button>
              </Link>
            </div>
          </div>
        </section>

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
