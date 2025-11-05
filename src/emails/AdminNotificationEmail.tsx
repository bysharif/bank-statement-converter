import * as React from 'react'
import { Text, Heading, Link } from '@react-email/components'
import { EmailLayout } from './components/EmailLayout'
import { EmailHeader } from './components/EmailHeader'
import { EmailFooter } from './components/EmailFooter'
import { EmailButton } from './components/EmailButton'

interface AdminNotificationEmailProps {
  userEmail: string
  userName?: string
  bankName: string
  urgency?: string
  notes?: string
  pdfUrl: string
  requestId: string
}

export function AdminNotificationEmail({
  userEmail,
  userName,
  bankName,
  urgency = 'medium',
  notes,
  pdfUrl,
  requestId,
}: AdminNotificationEmailProps) {
  return (
    <EmailLayout previewText={`New bank parser request: ${bankName}`}>
      <EmailHeader />

      <Heading style={heading}>🏦 New Bank Parser Request</Heading>

      <Text style={subtitle}>Action Required</Text>

      <Text style={text}>
        A user needs support for a bank statement that we don't currently parse.
      </Text>

      <div style={{...infoBox, ...(urgency === 'high' ? urgentBox : {})}}>
        <div style={label}>Bank Name</div>
        <div style={{...value, fontSize: '18px', fontWeight: '600'}}>{bankName}</div>
      </div>

      <div style={infoBox}>
        <div style={label}>User Email</div>
        <div style={value}>{userEmail}</div>
      </div>

      {userName && (
        <div style={infoBox}>
          <div style={label}>User Name</div>
          <div style={value}>{userName}</div>
        </div>
      )}

      {urgency && (
        <div style={{...infoBox, ...(urgency === 'high' ? urgentBox : {})}}>
          <div style={label}>Urgency</div>
          <div style={value}>
            {urgency === 'high' ? '🔴 High' : urgency === 'medium' ? '🟡 Medium' : '🟢 Low'}
          </div>
        </div>
      )}

      {notes && (
        <div style={infoBox}>
          <div style={label}>User Notes</div>
          <div style={value}>{notes}</div>
        </div>
      )}

      <div style={infoBox}>
        <div style={label}>Request ID</div>
        <div style={value}><code>{requestId}</code></div>
      </div>

      <EmailButton href={pdfUrl}>
        📄 Download Statement PDF
      </EmailButton>

      <div style={nextStepsBox}>
        <strong>📋 Next Steps:</strong>
        <ol style={{ margin: '10px 0 0 0', paddingLeft: '20px' }}>
          <li>Download and analyze the PDF</li>
          <li>Create parser for {bankName}</li>
          <li>Test with sample statement</li>
          <li>Deploy to production</li>
          <li>Notify user (they'll get 10 free conversions!)</li>
        </ol>
      </div>

      <Text style={footerNote}>
        Request received: {new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' })}
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

const infoBox = {
  margin: '15px 0',
  padding: '12px',
  background: '#ffffff',
  borderRadius: '6px',
  borderLeft: '3px solid #1e40af',
}

const urgentBox = {
  background: '#fef2f2',
  borderLeftColor: '#ef4444',
}

const label = {
  fontWeight: '600',
  color: '#4b5563',
  marginBottom: '4px',
  fontSize: '14px',
}

const value = {
  color: '#111827',
  fontSize: '16px',
}

const nextStepsBox = {
  background: '#eff6ff',
  padding: '15px',
  borderRadius: '6px',
  marginTop: '20px',
  fontSize: '16px',
  color: '#374151',
}

const footerNote = {
  fontSize: '14px',
  color: '#6b7280',
  marginTop: '24px',
  textAlign: 'center' as const,
}
