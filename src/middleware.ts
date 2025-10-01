import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyAuthToken } from "@/lib/simple-auth"

export function middleware(req: NextRequest) {
  const token = verifyAuthToken(req)

  // Allow access to auth pages and API routes without authentication
  if (req.nextUrl.pathname.startsWith('/auth/') ||
      req.nextUrl.pathname.startsWith('/api/auth/') ||
      req.nextUrl.pathname.startsWith('/api/simple-auth') ||
      req.nextUrl.pathname.startsWith('/api/test-auth') ||
      req.nextUrl.pathname.startsWith('/api/health') ||
      req.nextUrl.pathname === '/' ||
      req.nextUrl.pathname.startsWith('/convert') ||
      req.nextUrl.pathname.startsWith('/_next/') ||
      req.nextUrl.pathname.startsWith('/favicon')) {
    return NextResponse.next()
  }

  // If user is not authenticated and trying to access protected routes
  if (!token && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/auth/signin', req.url))
  }

  // If user is authenticated and trying to access auth pages, redirect to dashboard
  if (token && req.nextUrl.pathname.startsWith('/auth/')) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Require authentication for dashboard and protected API routes
  if (req.nextUrl.pathname.startsWith('/dashboard') ||
      (req.nextUrl.pathname.startsWith('/api/') &&
       !req.nextUrl.pathname.startsWith('/api/auth/') &&
       !req.nextUrl.pathname.startsWith('/api/simple-auth') &&
       !req.nextUrl.pathname.startsWith('/api/test-auth') &&
       !req.nextUrl.pathname.startsWith('/api/health'))) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/convert/:path*',
    '/api/jobs/:path*',
    '/auth/:path*'
  ]
}