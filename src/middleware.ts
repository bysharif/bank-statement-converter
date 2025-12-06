import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Update session for all requests
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { pathname } = request.nextUrl

  // Try to get user session with error handling for corrupted cookies
  let user = null
  try {
    const { data, error } = await supabase.auth.getUser()
    
    if (error) {
      // Auth error (expired token, invalid session, etc.)
      console.error('Middleware auth error:', error.message)
      
      // If accessing protected route with auth error, clear cookies and redirect to login
      if (pathname.startsWith('/dashboard')) {
        const response = NextResponse.redirect(new URL('/auth/login', request.url))
        // Clear potentially corrupted auth cookies
        response.cookies.delete('sb-access-token')
        response.cookies.delete('sb-refresh-token')
        // Clear all Supabase auth cookies (they start with sb-)
        request.cookies.getAll().forEach(cookie => {
          if (cookie.name.startsWith('sb-')) {
            response.cookies.delete(cookie.name)
          }
        })
        return response
      }
    } else {
      user = data.user
    }
  } catch (e) {
    // Handle cookie parsing errors or other unexpected errors
    console.error('Middleware exception:', e)
    
    // If on protected route, redirect to login with cleared cookies
    if (pathname.startsWith('/dashboard')) {
      const response = NextResponse.redirect(new URL('/auth/login', request.url))
      // Clear all Supabase auth cookies
      request.cookies.getAll().forEach(cookie => {
        if (cookie.name.startsWith('sb-')) {
          response.cookies.delete(cookie.name)
        }
      })
      return response
    }
  }

  // Protect dashboard routes
  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      // Redirect to login if not authenticated
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/auth/login'
      redirectUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Redirect to dashboard if already logged in and trying to access auth pages
  if (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/signup')) {
    if (user) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return supabaseResponse
}

// Specify which routes this middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
