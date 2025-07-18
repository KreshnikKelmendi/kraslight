import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // Check if the path starts with /admin
  if (path.startsWith('/admin')) {
    // Get the auth token from cookies
    const authToken = request.cookies.get('auth_token')?.value;
    const isAuthenticated = authToken === 'true';

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
  matcher: [
    '/admin/:path*',
    '/signin',
  ],
}; 