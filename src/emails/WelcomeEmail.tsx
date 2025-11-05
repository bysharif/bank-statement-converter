import * as React from 'react'
import { Text, Heading } from '@react-email/components'
import { EmailLayout } from './components/EmailLayout'
import { EmailHeader } from './components/EmailHeader'
import { EmailFooter } from './components/EmailFooter'
import { EmailButton } from './components/EmailButton'

interface WelcomeEmailProps {
  name?: string
  dashboardUrl?: string
}

export function WelcomeEmail({
  name = 'there',
  dashboardUrl = 'https://convertbank-statement.com/dashboard',
}: WelcomeEmailProps) {
  return (
    <EmailLayout previewText="Welcome to UK Bank Statement Converter">
      <EmailHeader />

      <Heading style={heading}>Welcome to UK Bank Statement Converter!</Heading>

      <Text style={text}>Hi {name},</Text>

      <Text style={text}>
        Thank you for signing up! We're excited to help you convert your UK bank statements
        to Excel format quickly and securely.
      </Text>

      <Text style={text}>
        With our service, you can:
      </Text>

      <ul style={list}>
        <li style={listItem}>Convert statements from all major UK banks</li>
        <li style={listItem}>Export to Excel or CSV format</li>
        <li style={listItem}>Process statements securely and privately</li>
        <li style={listItem}>Access your conversion history anytime</li>
      </ul>

      <EmailButton href={dashboardUrl}>
        Go to Dashboard
      </EmailButton>

      <Text style={text}>
        If you have any questions or need assistance, please don't hesitate to reach out
        to our support team at support@convertbank-statement.com
      </Text>

      <Text style={signature}>
        Best regards,<br />
        The UK Bank Statement Converter Team
      </Text>

      <EmailFooter />
    </EmailLayout>
  )
}

const heading = {
  fontSize: '28px',
  fontWeight: 'bold',
  color: '#111827',
  margin: '32px 0 24px',
  textAlign: 'center' as const,
}

const text = {
  fontSize: '16px',
  color: '#374151',
  lineHeight: '1.6',
  margin: '16px 0',
}

const list = {
  fontSize: '16px',
  color: '#374151',
  lineHeight: '1.8',
  margin: '16px 0',
  paddingLeft: '24px',
}

const listItem = {
  margin: '8px 0',
}

const signature = {
  fontSize: '16px',
  color: '#374151',
  lineHeight: '1.6',
  margin: '32px 0 16px',
}
