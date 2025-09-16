import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function TrustSignals() {
  const trustFeatures = [
    {
      icon: '🔒',
      title: 'GDPR Compliant',
      description: 'Full compliance with UK and EU data protection regulations',
      badge: 'Certified'
    },
    {
      icon: '🏛️',
      title: 'Bank-Grade Security',
      description: '256-bit encryption with zero-knowledge architecture',
      badge: 'Secure'
    },
    {
      icon: '🔍',
      title: 'No Data Storage',
      description: 'Files processed locally, never uploaded to servers',
      badge: 'Private'
    },
    {
      icon: '📊',
      title: 'Audit Trail',
      description: 'Complete transparency in data processing methods',
      badge: 'Transparent'
    }
  ]

  const certifications = [
    {
      name: 'ISO 27001',
      description: 'Information Security Management',
      icon: '🛡️'
    },
    {
      name: 'GDPR',
      description: 'Data Protection Regulation',
      icon: '🇪🇺'
    },
    {
      name: 'SOC 2',
      description: 'Security & Availability',
      icon: '✅'
    },
    {
      name: 'PCI DSS',
      description: 'Payment Card Industry Standard',
      icon: '💳'
    }
  ]

  const statistics = [
    {
      number: '500K+',
      label: 'Statements Processed',
      subtext: 'Successfully converted'
    },
    {
      number: '99.9%',
      label: 'Accuracy Rate',
      subtext: 'Data extraction precision'
    },
    {
      number: '<2min',
      label: 'Average Time',
      subtext: 'Processing duration'
    },
    {
      number: '0',
      label: 'Data Breaches',
      subtext: 'Since launch in 2023'
    }
  ]

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Trusted by UK Businesses & Individuals
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Your financial data deserves the highest level of security and privacy protection
            </p>
          </div>

          {/* Trust Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {trustFeatures.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-uk-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4 text-2xl">
                    {feature.icon}
                  </div>
                  <Badge variant="success" className="mb-3">
                    {feature.badge}
                  </Badge>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Statistics */}
          <div className="bg-gradient-to-r from-uk-blue-600 to-uk-blue-700 rounded-2xl p-8 mb-12 text-white">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {statistics.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl lg:text-4xl font-bold mb-1">
                    {stat.number}
                  </div>
                  <div className="text-lg font-medium mb-1">
                    {stat.label}
                  </div>
                  <div className="text-sm opacity-80">
                    {stat.subtext}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
              Security Certifications & Compliance
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {certifications.map((cert, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="p-4">
                    <div className="text-2xl mb-2">{cert.icon}</div>
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">
                      {cert.name}
                    </h4>
                    <p className="text-xs text-gray-600">
                      {cert.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Privacy Promise */}
          <Card className="bg-uk-green-50 border-uk-green-200">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-uk-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                🛡️
              </div>
              <h3 className="text-2xl font-bold text-uk-green-900 mb-4">
                Our Privacy Promise
              </h3>
              <div className="max-w-3xl mx-auto space-y-3 text-uk-green-800">
                <p className="font-medium">
                  ✓ Your files never leave your device - all processing happens locally in your browser
                </p>
                <p className="font-medium">
                  ✓ No registration, tracking, or data collection of any kind
                </p>
                <p className="font-medium">
                  ✓ Open-source code available for independent security audits
                </p>
                <p className="font-medium">
                  ✓ Full GDPR compliance with right to be forgotten built-in by design
                </p>
              </div>
              <div className="mt-6">
                <Badge variant="success" className="text-sm px-4 py-2">
                  Zero-Knowledge Architecture
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Customer Testimonial */}
          <div className="mt-12 text-center">
            <Card className="max-w-2xl mx-auto">
              <CardContent className="p-8">
                <div className="text-4xl mb-4">💬</div>
                <blockquote className="text-lg text-gray-700 italic mb-4">
                  "Finally, a bank statement converter that takes privacy seriously.
                  The local processing means I can convert sensitive financial data
                  without worrying about it being stored on someone else's servers."
                </blockquote>
                <div className="text-sm text-gray-600">
                  <strong>Sarah M.</strong> - Freelance Accountant, London
                </div>
                <div className="flex justify-center mt-3">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-lg">⭐</span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}