import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyRefreshToken, signAccessToken, signRefreshToken, setAuthCookies } from '@/lib/auth';
import { successResponse, errorResponse, handleApiError } from '@/lib/api';

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get('refresh_token')?.value;
    if (!refreshToken) return errorResponse('No refresh token', 401);

    const payload = await verifyRefreshToken(refreshToken);
    if (!payload) return errorResponse('Invalid refresh token', 401);

    // Check DB
    const stored = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!stored || stored.expiresAt < new Date()) {
      return errorResponse('Refresh token expired', 401);
    }

    const tokenPayload = {
      userId: stored.user.id,
      email: stored.user.email,
      role: stored.user.role,
    };

    const [newAccessToken, newRefreshToken] = await Promise.all([
      signAccessToken(tokenPayload),
      signRefreshToken(tokenPayload),
    ]);

    // Rotate refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    await prisma.refreshToken.update({
      where: { token: refreshToken },
      data: { token: newRefreshToken, expiresAt },
    });

    setAuthCookies(newAccessToken, newRefreshToken);

    return successResponse({ accessToken: newAccessToken });
  } catch (error) {
    return handleApiError(error);
  }
}
