import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { withAdmin } from '@/lib/withAuth';
import { successResponse, notFoundResponse, handleApiError, paginationMeta } from '@/lib/api';

export const GET = withAdmin(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page') || 1);
    const limit = Number(searchParams.get('limit') || 20);
    const skip = (page - 1) * limit;
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
          items: {
            include: {
              book: { select: { id: true, title: true, coverImage: true } },
            },
          },
          payment: { select: { status: true, provider: true, amount: true } },
          address: true,
        },
      }),
      prisma.order.count({ where }),
    ]);

    return successResponse({ orders, pagination: paginationMeta(total, page, limit) });
  } catch (error) {
    return handleApiError(error);
  }
});

const updateOrderSchema = z.object({
  status: z.enum(['PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED','REFUNDED']).optional(),
  trackingNumber: z.string().optional(),
  notes: z.string().optional(),
});

export const PATCH = withAdmin(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');
    if (!orderId) {
      const { errorResponse } = await import('@/lib/api');
      return errorResponse('orderId required', 400);
    }

    const body = await req.json();
    const validated = updateOrderSchema.parse(body);

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return notFoundResponse('Order not found');

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        ...validated,
        ...(validated.status === 'SHIPPED' && { shippedAt: new Date() }),
        ...(validated.status === 'DELIVERED' && { deliveredAt: new Date() }),
      },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        items: { include: { book: { select: { title: true } } } },
        address: true,
      },
    });

    return successResponse(updated);
  } catch (error) {
    return handleApiError(error);
  }
});
