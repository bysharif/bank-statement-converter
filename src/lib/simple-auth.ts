import { NextRequest } from 'next/server'

export function verifyAuthToken(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value

  if (!token) {
    return null
  }

  // For development, just return true if token exists
  // In production, you'd properly verify the JWT
  return { authenticated: true }
}