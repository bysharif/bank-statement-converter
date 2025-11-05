import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { render } from '@react-email/render'
import { WelcomeEmail } from '@/emails/WelcomeEmail'

// Lazy initialization of Resend client
let resendClient: Resend | null = null

function getResendClient(): Resend {
  if (!resendClient && process.env.RESEND_API_KEY) {
    resendClient = new Resend(process.env.RESEND_API_KEY)
  }
  return resendClient || new Resend('dummy_key_for_build')
}

export async function POST(request: NextRequest) {
  try {
    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured - skipping welcome email')
      return NextResponse.json(
        { success: false, error: 'Email service not configured' },
        { status: 503 }
      )
    }

    const { email, name } = await request.json()

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    const resend = getResendClient()

    // Render the welcome email
    const emailHtml = await render(
      WelcomeEmail({
        name: name || email.split('@')[0],
        dashboardUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://convert-bankstatement.com'}/dashboard`,
      })
    )

    // Send the email
    await resend.emails.send({
      from: 'UK Bank Statement Converter <support@convert-bankstatement.com>',
      to: email,
      subject: 'Welcome to UK Bank Statement Converter',
      html: emailHtml,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending welcome email:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send email' },
      { status: 500 }
    )
  }
}
