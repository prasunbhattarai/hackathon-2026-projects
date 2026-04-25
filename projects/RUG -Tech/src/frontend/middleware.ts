import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('fundus-access-token')?.value
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login')
  const isDashboardRoute = !isAuthRoute

  if (isDashboardRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/', request.url))
  }
}

export const config = { matcher: ['/((?!api|_next|public).*)'] }

