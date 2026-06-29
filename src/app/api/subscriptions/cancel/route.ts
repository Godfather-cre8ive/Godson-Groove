import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/withAuth';
import { successResponse, errorResponse, handleApiError } from '@/lib/api';

export const POST = withAuth(async (_req: NextRequest, { user }) => {
  try {
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: user.userId,
        status: 'ACTIVE',
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!subscription) {
      return errorResponse('No active subscription found', 404);
    }

    // If subscription was created via Paystack, cancel it there too
    if (subscription.providerRef) {
      try {
        const paystackRes = await fetch(
          `https://api.paystack.co/subscription/disable`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              code: subscription.providerRef,
              token: subscription.providerRef,
            }),
          }
        );
        const paystackData = await paystackRes.json();
        console.log('[Cancel Subscription] Paystack response:', paystackData);
      } catch (e) {
        // Log but don't block — still cancel in our DB
        console.error('[Cancel Subscription] Paystack cancel failed:', e);
      }
    }

    // Cancel in database
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
      },
    });

    // Downgrade user role back to FREE_USER
    await prisma.user.update({
      where: { id: user.userId },
      data: { role: 'FREE_USER' },
    });

    return successResponse({
      message: 'Subscription cancelled successfully. You will retain access until the end of your current billing period.',
    });
  } catch (error) {
    return handleApiError(error);
  }
});
