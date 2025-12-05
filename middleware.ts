import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from './lib/auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get token from cookie
  const token = request.cookies.get('session')?.value

  // Protected routes
  const protectedRoutes = ['/dashboard', '/transfer']
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  // Public routes (redirect to dashboard if logged in)
  const publicRoutes = ['/login', '/register']
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  // Verify token
  const user = token ? await verifyToken(token) : null

  // Redirect logic
  if (isProtectedRoute && !user) {
    // Not authenticated, redirect to login
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isPublicRoute && user) {
    // Already authenticated, redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
