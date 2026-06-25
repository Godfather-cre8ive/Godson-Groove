import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPayment } from '@/lib/paystack';
import { successResponse, errorResponse, handleApiError } from '@/lib/api';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get('ref') || searchParams.get('reference');

    if (!reference) return errorResponse('Reference required', 400);

    const result = await verifyPayment(reference);

    if (result.status !== 'success') {
      return errorResponse('Payment not successful', 400);
    }

    const metadata = result.metadata as Record<string, string>;
    const type = metadata?.type;
    const userId = metadata?.userId;

    // Check if already processed
    const existing = await prisma.payment.findUnique({
      where: { providerRef: reference },
    });
    if (existing && existing.status === 'SUCCESS') {
      return successResponse({ message: 'Payment already processed', payment: existing });
    }

    const amountNGN = result.amount / 100;

    if (type === 'order') {
      const orderId = metadata?.orderId;
      const order = await prisma.order.findUnique({ where: { id: orderId } });
      if (!order) return errorResponse('Order not found', 404);

      await prisma.$transaction([
        prisma.payment.upsert({
          where: { providerRef: reference },
          update: { status: 'SUCCESS', paidAt: new Date() },
          create: {
            orderId,
            userId: userId || order.userId,
            provider: 'PAYSTACK',
            providerRef: reference,
            amount: amountNGN,
            currency: result.currency,
            status: 'SUCCESS',
            paidAt: new Date(),
            metadata: metadata as Record<string, unknown>,
          },
        }),
        prisma.order.update({
          where: { id: orderId },
          data: { status: 'CONFIRMED' },
        }),
      ]);
    } else if (type === 'subscription') {
      const start = new Date();
      const end = new Date();
      end.setMonth(end.getMonth() + 1);

      const subscription = await prisma.subscription.create({
        data: {
          userId: userId!,
          status: 'ACTIVE',
          amount: amountNGN,
          currency: result.currency,
          currentPeriodStart: start,
          currentPeriodEnd: end,
        },
      });

      await prisma.payment.upsert({
        where: { providerRef: reference },
        update: { status: 'SUCCESS', paidAt: new Date() },
        create: {
          subscriptionId: subscription.id,
          userId: userId!,
          provider: 'PAYSTACK',
          providerRef: reference,
          amount: amountNGN,
          currency: result.currency,
          status: 'SUCCESS',
          paidAt: new Date(),
          metadata: metadata as Record<string, unknown>,
        },
      });

      // Upgrade user role
      await prisma.user.update({
        where: { id: userId },
        data: { role: 'SUBSCRIBER' },
      });
    }

    return successResponse({ message: 'Payment verified', status: result.status });
  } catch (error) {
    return handleApiError(error);
  }
}
