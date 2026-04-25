import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('fundus-access-token')?.value
  const { pathname } = request.nextUrl
  const isAuthRoute = pathname.startsWith('/login')

  const isPublicRoute =
    pathname === '/' ||
    pathname === '/about' ||
    pathname === '/disease' ||
    pathname === '/ai' ||
    pathname === '/contact'

  if (!isAuthRoute && !isPublicRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|images|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}

