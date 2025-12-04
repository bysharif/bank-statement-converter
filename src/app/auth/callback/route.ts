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

      // Send welcome email (fire and forget)
      try {
        const userName = data.user.user_metadata?.first_name ||
                        data.user.user_metadata?.full_name ||
                        data.user.email?.split('@')[0]

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

      // Note: Pending subscription linking is now handled on dashboard load
      // This ensures the user is fully authenticated before checking

      // Redirect to dashboard
      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  // If there was an error or no code, redirect to login
  return NextResponse.redirect(`${origin}/auth/login?error=confirmation_failed`)
}
