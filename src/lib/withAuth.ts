import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, JWTPayload } from './auth';
import { unauthorizedResponse, forbiddenResponse } from './api';

type Role = 'ADMIN' | 'SUBSCRIBER' | 'FREE_USER';

type Handler = (
  req: NextRequest,
  context: { params?: Record<string, string>; user: JWTPayload }
) => Promise<NextResponse>;

export function withAuth(handler: Handler, requiredRoles?: Role[]) {
  return async (
    req: NextRequest,
    context: { params?: Record<string, string> }
  ): Promise<NextResponse> => {
    // Try header first, then cookie
    const token =
      req.headers.get('x-user-id')
        ? null // already injected by middleware
        : req.cookies.get('access_token')?.value ||
          req.headers.get('authorization')?.replace('Bearer ', '');

    let user: JWTPayload | null = null;

    // Check middleware-injected headers
    const userId = req.headers.get('x-user-id');
    const email = req.headers.get('x-user-email');
    const role = req.headers.get('x-user-role');

    if (userId && email && role) {
      user = { userId, email, role };
    } else if (token) {
      user = await verifyAccessToken(token);
    }

    if (!user) return unauthorizedResponse();

    if (requiredRoles && !requiredRoles.includes(user.role as Role)) {
      return forbiddenResponse();
    }

    return handler(req, { ...context, user });
  };
}

export function withAdmin(handler: Handler) {
  return withAuth(handler, ['ADMIN']);
}

export function withSubscriber(handler: Handler) {
  return withAuth(handler, ['ADMIN', 'SUBSCRIBER']);
}
