import * as React from 'react'
import { Text, Heading } from '@react-email/components'
import { EmailLayout } from './components/EmailLayout'
import { EmailHeader } from './components/EmailHeader'
import { EmailFooter } from './components/EmailFooter'
import { EmailButton } from './components/EmailButton'

interface MagicLinkEmailProps {
  name?: string
  magicUrl?: string
}

export function MagicLinkEmail({
  name = 'there',
  magicUrl = 'https://convert-bankstatement.com/auth/verify',
}: MagicLinkEmailProps) {
  return (
    <EmailLayout previewText="Your secure sign-in link">
      <EmailHeader />

      <Heading style={heading}>Sign In to Your Account</Heading>

      <Text style={text}>Hi {name},</Text>

      <Text style={text}>
        Click the button below to securely sign in to your UK Bank Statement Converter account.
        No password needed!
      </Text>

      <EmailButton href={magicUrl}>
        Sign In Securely
      </EmailButton>

      <Text style={warningText}>
        <strong>Security Notice:</strong> This link will expire in 15 minutes and can only be used once.
      </Text>

      <Text style={text}>
        If you didn't request this sign-in link, you can safely ignore this email. Your account
        remains secure and no action is needed.
      </Text>

      <Text style={infoText}>
        <strong>Why did I receive this?</strong><br />
        Someone (hopefully you) requested a passwordless sign-in link for this email address.
        If you didn't make this request, please ignore this email.
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

const infoText = {
  fontSize: '14px',
  color: '#6b7280',
  lineHeight: '1.6',
  margin: '24px 0',
  padding: '16px',
  backgroundColor: '#f3f4f6',
  borderRadius: '4px',
}

const signature = {
  fontSize: '16px',
  color: '#374151',
  lineHeight: '1.6',
  margin: '32px 0 16px',
}
