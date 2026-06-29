import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { withAdmin } from '@/lib/withAuth';
import { successResponse, handleApiError, paginationMeta } from '@/lib/api';

export const GET = withAdmin(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page') || 1);
    const limit = Number(searchParams.get('limit') || 20);
    const skip = (page - 1) * limit;
    const role = searchParams.get('role');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          phone: true,
          emailVerified: true,
          createdAt: true,
          _count: {
            select: { orders: true, subscriptions: true, readingProgress: true },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return successResponse({ users, pagination: paginationMeta(total, page, limit) });
  } catch (error) {
    return handleApiError(error);
  }
});

const updateUserSchema = z.object({
  role: z.enum(['ADMIN', 'SUBSCRIBER', 'FREE_USER']).optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  emailVerified: z.boolean().optional(),
});

export const PATCH = withAdmin(async (req: NextRequest, { params, user: admin }) => {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      const { errorResponse } = await import('@/lib/api');
      return errorResponse('userId required', 400);
    }

    const body = await req.json();
    const validated = updateUserSchema.parse(body);

    const updated = await prisma.user.update({
      where: { id: userId },
      data: validated,
      select: { id: true, email: true, role: true, firstName: true, lastName: true },
    });

    await prisma.adminAction.create({
      data: {
        adminId: admin.userId,
        targetUserId: userId,
        actionType: 'UPDATE',
        entityType: 'user',
        entityId: userId,
        description: `Updated user: ${JSON.stringify(validated)}`,
      },
    });

    return successResponse(updated);
  } catch (error) {
    return handleApiError(error);
  }
});
