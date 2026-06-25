import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/withAuth';
import { successResponse, handleApiError } from '@/lib/api';

export const GET = withAuth(async (req: NextRequest, { user }) => {
  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatarUrl: true,
        phone: true,
        emailVerified: true,
        createdAt: true,
        subscriptions: {
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            status: true,
            planName: true,
            currentPeriodEnd: true,
          },
        },
      },
    });

    if (!dbUser) {
      const { unauthorizedResponse } = await import('@/lib/api');
      return unauthorizedResponse('User not found');
    }

    return successResponse({
      ...dbUser,
      activeSubscription: dbUser.subscriptions[0] || null,
    });
  } catch (error) {
    return handleApiError(error);
  }
});
