import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Successfully confirmed email and logged in
      const userMetadata = data.user.user_metadata || {}
      const userName = userMetadata.first_name ||
                      userMetadata.full_name ||
                      data.user.email?.split('@')[0]

      // Send welcome email to user (fire and forget)
      try {
        await fetch(`${origin}/api/email/auth/welcome`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: data.user.email,
            name: userName,
          }),
        })
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError)
        // Don't block redirect if email fails
      }

      // Note: Admin notification is now sent at signup time (before confirmation)
      // This callback only handles the welcome email after user confirms

      // Note: Pending subscription linking is now handled on dashboard load
      // This ensures the user is fully authenticated before checking

      // Redirect to dashboard
      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  // If there was an error or no code, redirect to login
  return NextResponse.redirect(`${origin}/auth/login?error=confirmation_failed`)
}
