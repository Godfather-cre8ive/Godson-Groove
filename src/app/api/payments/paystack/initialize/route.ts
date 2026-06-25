import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/withAuth';
import { initializePayment } from '@/lib/paystack';
import { successResponse, errorResponse, handleApiError } from '@/lib/api';
import { v4 as uuidv4 } from 'uuid';

const initSchema = z.object({
  orderId: z.string().optional(),
  type: z.enum(['order', 'subscription']),
});

export const POST = withAuth(async (req: NextRequest, { user }) => {
  try {
    const body = await req.json();
    const validated = initSchema.parse(body);

    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { email: true, firstName: true },
    });
    if (!dbUser) return errorResponse('User not found', 404);

    let amount = 0;
    let metadata: Record<string, unknown> = {};
    const reference = `gg-${uuidv4()}`;

    if (validated.type === 'order' && validated.orderId) {
      const order = await prisma.order.findFirst({
        where: { id: validated.orderId, userId: user.userId },
      });
      if (!order) return errorResponse('Order not found', 404);
      if (order.total <= 0) return errorResponse('Invalid order amount', 400);

      amount = order.total;
      metadata = { orderId: order.id, type: 'order', userId: user.userId };
    } else if (validated.type === 'subscription') {
      amount = Number(process.env.GROOVE_PASS_PRICE_NGN || 2500);
      metadata = { type: 'subscription', userId: user.userId };
    }

    const result = await initializePayment({
      email: dbUser.email,
      amount,
      reference,
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/paystack/verify?ref=${reference}`,
      metadata,
    });

    return successResponse({
      ...result,
      reference,
    });
  } catch (error) {
    return handleApiError(error);
  }
});
