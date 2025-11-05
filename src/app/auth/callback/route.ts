import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Successfully confirmed email and logged in
      // Redirect to dashboard
      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  // If there was an error or no code, redirect to login
  return NextResponse.redirect(`${origin}/auth/login?error=confirmation_failed`)
}
