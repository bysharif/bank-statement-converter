import * as React from 'react'
import { Section, Text, Link } from '@react-email/components'

export function EmailFooter() {
  return (
    <Section style={footer}>
      <div style={divider} />
      <Text style={footerText}>
        © {new Date().getFullYear()} UK Bank Statement Converter. All rights reserved.
      </Text>
      <Text style={footerText}>
        Transform your bank statements instantly
      </Text>
      <Text style={footerLinks}>
        <Link href="https://convertbank-statement.com" style={link}>
          Website
        </Link>
        {' · '}
        <Link href="https://convertbank-statement.com/privacy" style={link}>
          Privacy Policy
        </Link>
        {' · '}
        <Link href="https://convertbank-statement.com/terms" style={link}>
          Terms of Service
        </Link>
      </Text>
      <Text style={footerAddress}>
        UK Bank Statement Converter<br />
        London, United Kingdom
      </Text>
    </Section>
  )
}

const footer = {
  marginTop: '48px',
}

const divider = {
  borderBottom: '1px solid #e5e7eb',
  marginBottom: '24px',
}

const footerText = {
  fontSize: '12px',
  color: '#6b7280',
  lineHeight: '1.5',
  textAlign: 'center' as const,
  margin: '8px 0',
}

const footerLinks = {
  fontSize: '12px',
  color: '#6b7280',
  lineHeight: '1.5',
  textAlign: 'center' as const,
  margin: '16px 0',
}

const link = {
  color: '#1e40af',
  textDecoration: 'underline',
}

const footerAddress = {
  fontSize: '11px',
  color: '#9ca3af',
  lineHeight: '1.5',
  textAlign: 'center' as const,
  margin: '16px 0 0',
}
