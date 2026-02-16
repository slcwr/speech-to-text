import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const guestOnlyPaths = ['/', '/login', '/register'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Authenticated user on guest-only pages → redirect to dashboard
  if (token && guestOnlyPaths.includes(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Unauthenticated user on protected pages → redirect to login
  if (!token && !guestOnlyPaths.includes(pathname)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
