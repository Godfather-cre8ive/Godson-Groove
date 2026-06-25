import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { clearAuthCookies, verifyRefreshToken, signAccessToken, signRefreshToken, setAuthCookies } from '@/lib/auth';
import { successResponse, errorResponse, handleApiError } from '@/lib/api';

// POST /api/auth/logout
export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get('refresh_token')?.value;

    if (refreshToken) {
      // Invalidate refresh token in DB
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken },
      });
    }

    clearAuthCookies();
    return successResponse({ message: 'Logged out successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}
