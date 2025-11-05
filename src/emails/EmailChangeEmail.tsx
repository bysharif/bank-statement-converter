import * as React from 'react'
import { Text, Heading } from '@react-email/components'
import { EmailLayout } from './components/EmailLayout'
import { EmailHeader } from './components/EmailHeader'
import { EmailFooter } from './components/EmailFooter'
import { EmailButton } from './components/EmailButton'

interface EmailChangeEmailProps {
  name?: string
  confirmUrl?: string
  newEmail?: string
}

export function EmailChangeEmail({
  name = 'there',
  confirmUrl = 'https://convertbank-statement.com/confirm-email',
  newEmail = 'your new email',
}: EmailChangeEmailProps) {
  return (
    <EmailLayout previewText="Confirm your email change">
      <EmailHeader />

      <Heading style={heading}>Confirm Your Email Change</Heading>

      <Text style={text}>Hi {name},</Text>

      <Text style={text}>
        You recently requested to change your email address for your UK Bank Statement Converter account
        to <strong>{newEmail}</strong>.
      </Text>

      <Text style={text}>
        Please click the button below to confirm this change. This link will expire in 24 hours.
      </Text>

      <EmailButton href={confirmUrl}>
        Confirm Email Change
      </EmailButton>

      <Text style={warningText}>
        <strong>Important:</strong> If you didn't request this email change, please contact our support team
        immediately at support@convertbank-statement.com to secure your account.
      </Text>

      <Text style={text}>
        After confirming, you'll need to use your new email address to sign in to your account.
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
  backgroundColor: '#fee2e2',
  borderLeft: '4px solid #ef4444',
  borderRadius: '4px',
}

const signature = {
  fontSize: '16px',
  color: '#374151',
  lineHeight: '1.6',
  margin: '32px 0 16px',
}
