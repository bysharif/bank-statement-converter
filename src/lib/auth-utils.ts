import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

export async function getUserSession(req?: NextRequest) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return null
    }

    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'dev-secret') as any
    return {
      user: {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
      }
    }
  } catch (error) {
    return null
  }
}

export async function requireAuth(req?: NextRequest) {
  const session = await getUserSession(req)

  if (!session?.user) {
    throw new Error('Authentication required')
  }

  return {
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name || '',
    },
    session
  }
}