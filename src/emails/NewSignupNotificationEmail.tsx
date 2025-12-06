import * as React from 'react'
import { Text, Heading } from '@react-email/components'
import { EmailLayout } from './components/EmailLayout'
import { EmailHeader } from './components/EmailHeader'
import { EmailFooter } from './components/EmailFooter'
import { EmailButton } from './components/EmailButton'

interface NewSignupNotificationEmailProps {
  userEmail: string
  userName?: string
  userType?: string
  signupTimestamp: string
}

export function NewSignupNotificationEmail({
  userEmail,
  userName,
  userType,
  signupTimestamp,
}: NewSignupNotificationEmailProps) {
  return (
    <EmailLayout previewText={`New signup: ${userEmail}`}>
      <EmailHeader />

      <Heading style={heading}>🎉 New User Signup!</Heading>

      <Text style={subtitle}>Someone just signed up for Bank Statement Converter</Text>

      <div style={infoBox}>
        <div style={label}>Email</div>
        <div style={valueHighlight}>{userEmail}</div>
      </div>

      {userName && (
        <div style={infoBox}>
          <div style={label}>Name</div>
          <div style={value}>{userName}</div>
        </div>
      )}

      {userType && (
        <div style={infoBox}>
          <div style={label}>User Type</div>
          <div style={value}>{formatUserType(userType)}</div>
        </div>
      )}

      <div style={infoBox}>
        <div style={label}>Signup Time</div>
        <div style={value}>{signupTimestamp}</div>
      </div>

      <div style={infoBox}>
        <div style={label}>Product</div>
        <div style={value}>UK Bank Statement Converter</div>
      </div>

      <EmailButton href="https://convertbank-statement.com/dashboard">
        View Dashboard
      </EmailButton>

      <Text style={footerNote}>
        This is an automated notification. The user has confirmed their email.
      </Text>

      <EmailFooter />
    </EmailLayout>
  )
}

// Helper function to format user type
function formatUserType(type: string): string {
  const typeMap: Record<string, string> = {
    freelancer: '👨‍💻 Freelancer',
    accountant: '📊 Accountant',
    business_owner: '🏢 Business Owner',
    bookkeeper: '📚 Bookkeeper',
    tax_advisor: '💼 Tax Advisor',
    finance_manager: '💰 Finance Manager',
  }
  return typeMap[type] || type
}

const heading = {
  fontSize: '28px',
  fontWeight: 'bold',
  color: '#111827',
  margin: '32px 0 8px',
  textAlign: 'center' as const,
}

const subtitle = {
  fontSize: '16px',
  color: '#6b7280',
  margin: '0 0 24px',
  textAlign: 'center' as const,
}

const infoBox = {
  margin: '12px 0',
  padding: '12px 16px',
  background: '#f9fafb',
  borderRadius: '8px',
  borderLeft: '4px solid #1e40af',
}

const label = {
  fontWeight: '600',
  color: '#6b7280',
  marginBottom: '4px',
  fontSize: '12px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
}

const value = {
  color: '#111827',
  fontSize: '16px',
}

const valueHighlight = {
  color: '#1e40af',
  fontSize: '18px',
  fontWeight: '600',
}

const footerNote = {
  fontSize: '13px',
  color: '#9ca3af',
  marginTop: '32px',
  textAlign: 'center' as const,
}

