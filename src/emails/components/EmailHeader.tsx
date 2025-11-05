import * as React from 'react'
import { Section, Img, Heading } from '@react-email/components'

export function EmailHeader() {
  return (
    <Section style={header}>
      <div style={logoContainer}>
        <Heading style={heading}>UK Bank Statement Converter</Heading>
      </div>
      <div style={divider} />
    </Section>
  )
}

const header = {
  padding: '20px 0',
}

const logoContainer = {
  textAlign: 'center' as const,
  marginBottom: '24px',
}

const heading = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#1e40af', // UK Blue
  margin: '0',
  textAlign: 'center' as const,
}

const divider = {
  borderBottom: '1px solid #e5e7eb',
  marginTop: '24px',
}
