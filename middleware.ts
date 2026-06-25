import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAccessToken } from './src/lib/auth';

const PUBLIC_PATHS = [
  '/',
  '/login',
  '/register',
  '/books',
  '/series',
  '/shop',
  '/search',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh',
  '/api/books',
  '/api/series',
  '/api/categories',
  '/api/payments/paystack/webhook',
  '/api/payments/stripe/webhook',
];

const ADMIN_PATHS = ['/admin', '/api/admin'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths
  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
  if (isPublic && !pathname.startsWith('/admin') && !pathname.startsWith('/api/admin')) {
    return NextResponse.next();
  }

  // Static assets and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/icons') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Get token from cookies or header
  const token =
    req.cookies.get('access_token')?.value ||
    req.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const payload = await verifyAccessToken(token);
  if (!payload) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ success: false, error: 'Invalid or expired token' }, { status: 401 });
    }
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin route protection
  const isAdminPath = ADMIN_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
  if (isAdminPath && payload.role !== 'ADMIN') {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Inject user info into request headers for downstream use
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-user-id', payload.userId);
  requestHeaders.set('x-user-email', payload.email);
  requestHeaders.set('x-user-role', payload.role);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|icons|public).*)',
  ],
};
