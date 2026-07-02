import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // Check if the path starts with /admin
  if (path.startsWith('/admin')) {
    if (path === '/admin' || path === '/admin/') {
      return NextResponse.redirect(new URL('/admin/products/list', request.url));
    }

    // Get the auth token from cookies
    const authToken = request.cookies.get('auth_token')?.value;
    const authExpiry = request.cookies.get('auth_expiry')?.value;
    const expiryTime = authExpiry ? parseInt(authExpiry, 10) : 0;
    const isAuthenticated =
      authToken === 'true' &&
      !Number.isNaN(expiryTime) &&
      Date.now() < expiryTime;

    // If not authenticated and not on the signin page, redirect to signin
    if (!isAuthenticated && path !== '/signin') {
      const url = new URL('/signin', request.url);
      url.searchParams.set('from', path);
      return NextResponse.redirect(url);
    }

    // If authenticated and on signin page, redirect to admin dashboard
    if (isAuthenticated && path === '/signin') {
      return NextResponse.redirect(new URL('/admin/products/list', request.url));
    }
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: ['/admin', '/admin/:path*', '/signin'],
}; 