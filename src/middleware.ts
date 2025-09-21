// middleware.ts (in root directory)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  
  // If trying to access dashboard without token, redirect to login
  if (request.nextUrl.pathname.startsWith('/dashboard') && !token) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }
  
  // If logged in and trying to access auth page, redirect to dashboard
  if (token && request.nextUrl.pathname === '/auth') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth']
};