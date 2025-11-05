import * as React from 'react'
import { Text, Heading } from '@react-email/components'
import { EmailLayout } from './components/EmailLayout'
import { EmailHeader } from './components/EmailHeader'
import { EmailFooter } from './components/EmailFooter'
import { EmailButton } from './components/EmailButton'

interface PasswordResetEmailProps {
  name?: string
  resetUrl?: string
}

export function PasswordResetEmail({
  name = 'there',
  resetUrl = 'https://convertbank-statement.com/reset-password',
}: PasswordResetEmailProps) {
  return (
    <EmailLayout previewText="Reset your password">
      <EmailHeader />

      <Heading style={heading}>Reset Your Password</Heading>

      <Text style={text}>Hi {name},</Text>

      <Text style={text}>
        We received a request to reset the password for your UK Bank Statement Converter account.
      </Text>

      <Text style={text}>
        Click the button below to choose a new password. This link will expire in 1 hour for security reasons.
      </Text>

      <EmailButton href={resetUrl}>
        Reset Password
      </EmailButton>

      <Text style={warningText}>
        <strong>Important:</strong> If you didn't request a password reset, please ignore this email.
        Your password will remain unchanged.
      </Text>

      <Text style={text}>
        For security reasons, this link will expire in 1 hour. If you need to reset your password after
        the link expires, you can request a new password reset email.
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

const warningText = {
  fontSize: '16px',
  color: '#374151',
  lineHeight: '1.6',
  margin: '24px 0',
  padding: '16px',
  backgroundColor: '#fef3c7',
  borderLeft: '4px solid #f59e0b',
  borderRadius: '4px',
}

const signature = {
  fontSize: '16px',
  color: '#374151',
  lineHeight: '1.6',
  margin: '32px 0 16px',
}
