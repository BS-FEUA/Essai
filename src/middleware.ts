import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_ROUTES = [
  '/dashboard',
  '/members',
  '/documents',
  '/cash',
  '/messages',
  '/uniforms',
  '/admin',
];

const AUTH_ROUTES = ['/login', '/register', '/forgot-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('bs-session');
  const isAuthenticated = Boolean(sessionCookie?.value);

  // Protected routes check
  // We let client-side DashboardLayout handle authentication redirects to support localStorage fallbacks in cross-site preview iframes

  // If already authenticated and accessing login/register, redirect to /dashboard
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname === route);
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/members/:path*',
    '/documents/:path*',
    '/cash/:path*',
    '/messages/:path*',
    '/uniforms/:path*',
    '/admin/:path*',
    '/login',
    '/register',
    '/forgot-password',
  ],
};
