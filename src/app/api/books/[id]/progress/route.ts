import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/withAuth';
import { successResponse, handleApiError } from '@/lib/api';

const progressSchema = z.object({
  currentPage: z.number().min(0),
  totalPages: z.number().optional(),
  percentage: z.number().min(0).max(100).optional(),
  completed: z.boolean().optional(),
});

export const POST = withAuth(async (req: NextRequest, { params, user }) => {
  try {
    const body = await req.json();
    const validated = progressSchema.parse(body);

    const progress = await prisma.readingProgress.upsert({
      where: {
        userId_bookId: {
          userId: user.userId,
          bookId: params?.id!,
        },
      },
      update: {
        ...validated,
        lastReadAt: new Date(),
      },
      create: {
        userId: user.userId,
        bookId: params?.id!,
        ...validated,
        lastReadAt: new Date(),
      },
    });

    return successResponse(progress);
  } catch (error) {
    return handleApiError(error);
  }
});

export const GET = withAuth(async (_req: NextRequest, { params, user }) => {
  try {
    const progress = await prisma.readingProgress.findUnique({
      where: {
        userId_bookId: {
          userId: user.userId,
          bookId: params?.id!,
        },
      },
    });

    return successResponse(progress);
  } catch (error) {
    return handleApiError(error);
  }
});
