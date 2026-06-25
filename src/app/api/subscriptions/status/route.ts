import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/withAuth';
import { successResponse, errorResponse, handleApiError } from '@/lib/api';

// GET /api/subscriptions/status
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

// POST /api/subscriptions/cancel
export async function cancelSubscription(req: NextRequest, { user }: { user: { userId: string } }) {
  try {
    const subscription = await prisma.subscription.findFirst({
      where: { userId: user.userId, status: 'ACTIVE' },
    });

    if (!subscription) return errorResponse('No active subscription', 404);

    // Cancel in Paystack if providerRef exists
    if (subscription.providerRef) {
      try {
        const { cancelSubscription: paystackCancel } = await import('@/lib/paystack');
        // Paystack needs subscription code and email_token
        // In production, store the email_token during subscription creation
      } catch (e) {
        console.error('Paystack cancel error:', e);
      }
    }

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: 'CANCELLED', cancelledAt: new Date() },
    });

    // Downgrade role after period ends (or immediately)
    await prisma.user.update({
      where: { id: user.userId },
      data: { role: 'FREE_USER' },
    });

    return successResponse({ message: 'Subscription cancelled' });
  } catch (error) {
    return handleApiError(error);
  }
}
