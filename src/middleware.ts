import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path is an admin route
  if (pathname.startsWith('/admin')) {
    // Skip login page and root admin page (which handles its own redirects)
    if (pathname === '/admin/login' || pathname === '/admin') {
      return NextResponse.next();
    }

    // Check for admin session cookie
    const adminSession = request.cookies.get('admin-session');
    
    if (!adminSession) {
      // Redirect to login page if no admin session
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // TODO: In a production environment, you should validate the Firebase token
    // This would require server-side Firebase Admin SDK validation
    // For now, we'll just check if the token exists
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
  ],
};
