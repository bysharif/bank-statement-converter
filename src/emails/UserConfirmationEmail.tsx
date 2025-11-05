import * as React from 'react'
import { Text, Heading } from '@react-email/components'
import { EmailLayout } from './components/EmailLayout'
import { EmailHeader } from './components/EmailHeader'
import { EmailFooter } from './components/EmailFooter'

interface UserConfirmationEmailProps {
  userName?: string
  bankName: string
}

export function UserConfirmationEmail({
  userName,
  bankName,
}: UserConfirmationEmailProps) {
  return (
    <EmailLayout previewText="Your bank parser request has been received">
      <EmailHeader />

      <Heading style={heading}>✅ Request Received!</Heading>

      <Text style={subtitle}>We're on it</Text>

      <Text style={text}>
        Hi{userName ? ` ${userName}` : ''},
      </Text>

      <Text style={text}>
        Thank you for your request to add support for <strong>{bankName}</strong> bank statements.
        We've received your submission and our team is already on it!
      </Text>

      <div style={highlightBox}>
        <strong>⏱️ Timeline:</strong> 24-48 hours
        <br />
        <Text style={{ margin: '10px 0 0 0', fontSize: '14px' }}>
          We'll analyze your statement and build a custom parser.
          You'll receive an email as soon as {bankName} support is live.
        </Text>
      </div>

      <div style={giftBox}>
        <div style={{ fontSize: '32px', marginBottom: '10px' }}>🎁</div>
        <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '10px' }}>
          Thank You Gift
        </div>
        <Text style={{ margin: '0', fontSize: '15px' }}>
          As a thank you for helping us improve, you'll receive{' '}
          <strong style={{ color: '#d97706' }}>10 FREE conversions</strong>{' '}
          once {bankName} support is ready!
        </Text>
      </div>

      <div style={stepsBox}>
        <strong>📝 What to do next:</strong>
        <ol style={{ margin: '10px 0 0 0', paddingLeft: '20px' }}>
          <li>Keep your PDF handy - you'll need to re-upload it when ready</li>
          <li>Watch for our email notification (check spam if needed)</li>
          <li>Enjoy your 10 free conversions once we're live!</li>
        </ol>
      </div>

      <Text style={text}>
        Have questions? Just reply to this email and we'll get back to you right away.
      </Text>

      <Text style={signature}>
        Best regards,<br />
        <strong>The UK Bank Statement Converter Team</strong>
      </Text>

      <EmailFooter />
    </EmailLayout>
  )
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

const text = {
  fontSize: '16px',
  color: '#374151',
  lineHeight: '1.6',
  margin: '16px 0',
}

const highlightBox = {
  background: '#eff6ff',
  borderLeft: '4px solid #3b82f6',
  padding: '15px',
  margin: '20px 0',
  borderRadius: '4px',
  fontSize: '16px',
  color: '#374151',
}

const giftBox = {
  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
  border: '2px solid #f59e0b',
  padding: '20px',
  margin: '20px 0',
  borderRadius: '8px',
  textAlign: 'center' as const,
}

const stepsBox = {
  background: '#ffffff',
  padding: '15px',
  borderRadius: '6px',
  marginTop: '20px',
  fontSize: '16px',
  color: '#374151',
  border: '1px solid #e5e7eb',
}

const signature = {
  fontSize: '16px',
  color: '#374151',
  lineHeight: '1.6',
  marginTop: '32px',
}
