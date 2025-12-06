import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { render } from '@react-email/render'
import { NewSignupNotificationEmail } from '@/emails/NewSignupNotificationEmail'

// Admin email to receive notifications
const ADMIN_EMAIL = 'sharif@taxformed.com'

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
      console.warn('RESEND_API_KEY not configured - skipping admin notification email')
      return NextResponse.json(
        { success: false, error: 'Email service not configured' },
        { status: 503 }
      )
    }

    const { email, name, userType } = await request.json()

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    const resend = getResendClient()

    // Format timestamp in UK timezone
    const signupTimestamp = new Date().toLocaleString('en-GB', {
      timeZone: 'Europe/London',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

    // Render the admin notification email
    const emailHtml = await render(
      NewSignupNotificationEmail({
        userEmail: email,
        userName: name,
        userType: userType,
        signupTimestamp: signupTimestamp,
      })
    )

    // Send the notification to admin
    await resend.emails.send({
      from: 'Bank Statement Converter <notifications@convertbank-statement.com>',
      to: ADMIN_EMAIL,
      subject: `🎉 New Signup: ${email}`,
      html: emailHtml,
    })

    console.log(`✅ Admin notification sent for new signup: ${email}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending admin notification email:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}

