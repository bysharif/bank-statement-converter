import * as React from 'react'
import {
  Html,
  Head,
  Body,
  Container,
  Section,
} from '@react-email/components'

interface EmailLayoutProps {
  children: React.ReactNode
  previewText?: string
}

export function EmailLayout({ children, previewText }: EmailLayoutProps) {
  return (
    <Html>
      <Head>
        <title>{previewText || 'UK Bank Statement Converter'}</title>
      </Head>
      <Body style={main}>
        <Container style={container}>
          <Section style={content}>
            {children}
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
}

const content = {
  padding: '0 48px',
}
