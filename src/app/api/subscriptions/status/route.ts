import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/withAuth';
import { successResponse, errorResponse, handleApiError } from '@/lib/api';

export const GET = withAuth(async (_req: NextRequest, { user }) => {
  try {
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: user.userId,
        status: 'ACTIVE',
        currentPeriodEnd: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse({
      isActive: !!subscription,
      subscription: subscription || null,
    });
  } catch (error) {
    return handleApiError(error);
  }
});
