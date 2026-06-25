import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/withAuth';
import { successResponse, errorResponse, handleApiError, paginationMeta } from '@/lib/api';

const createOrderSchema = z.object({
  items: z.array(
    z.object({
      bookId: z.string(),
      quantity: z.number().min(1).default(1),
    })
  ).min(1),
  addressId: z.string().optional(),
  promoCode: z.string().optional(),
});

export const POST = withAuth(async (req: NextRequest, { user }) => {
  try {
    const body = await req.json();
    const validated = createOrderSchema.parse(body);

    // Verify all books exist and get pricing
    const books = await prisma.book.findMany({
      where: { id: { in: validated.items.map((i) => i.bookId) }, published: true },
      include: { physicalProduct: true },
    });

    if (books.length !== validated.items.length) {
      return errorResponse('One or more books not found', 400);
    }

    let subtotal = 0;
    const orderItems = validated.items.map((item) => {
      const book = books.find((b) => b.id === item.bookId)!;
      const unitPrice = book.physicalProduct?.price || book.price || 0;
      const totalPrice = unitPrice * item.quantity;
      subtotal += totalPrice;

      return {
        bookId: item.bookId,
        physicalProductId: book.physicalProduct?.id,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
      };
    });

    // Apply promo code if provided
    let discount = 0;
    if (validated.promoCode) {
      const promo = await prisma.promotion.findFirst({
        where: {
          code: validated.promoCode.toUpperCase(),
          isActive: true,
          OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
          OR: [{ maxUses: null }, { usedCount: { lt: prisma.promotion.fields.maxUses } }],
        },
      });

      if (promo) {
        if (promo.discountType === 'percentage') {
          discount = (subtotal * promo.discountValue) / 100;
        } else {
          discount = Math.min(promo.discountValue, subtotal);
        }
      }
    }

    const shippingFee = subtotal > 0 ? 1500 : 0; // NGN 1500 flat shipping
    const total = subtotal - discount + shippingFee;

    const order = await prisma.order.create({
      data: {
        userId: user.userId,
        addressId: validated.addressId,
        subtotal,
        shippingFee,
        discount,
        total,
        items: { create: orderItems },
      },
      include: {
        items: { include: { book: true } },
        address: true,
      },
    });

    return successResponse(order, 201);
  } catch (error) {
    return handleApiError(error);
  }
});

export const GET = withAuth(async (req: NextRequest, { user }) => {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page') || 1);
    const limit = Number(searchParams.get('limit') || 10);
    const skip = (page - 1) * limit;

    const where = user.role === 'ADMIN'
      ? {}
      : { userId: user.userId };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: { include: { book: { select: { title: true, coverImage: true } } } },
          payment: { select: { status: true, provider: true } },
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
