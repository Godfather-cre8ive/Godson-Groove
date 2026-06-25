import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/withAuth';
import { successResponse, handleApiError } from '@/lib/api';

const bookmarkSchema = z.object({
  page: z.number().optional(),
  note: z.string().optional(),
});

export const POST = withAuth(async (req: NextRequest, { params, user }) => {
  try {
    const body = await req.json();
    const validated = bookmarkSchema.parse(body);

    const bookmark = await prisma.bookmark.create({
      data: {
        userId: user.userId,
        bookId: params?.id!,
        ...validated,
      },
    });

    return successResponse(bookmark, 201);
  } catch (error) {
    return handleApiError(error);
  }
});

export const GET = withAuth(async (_req: NextRequest, { params, user }) => {
  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: user.userId, bookId: params?.id! },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(bookmarks);
  } catch (error) {
    return handleApiError(error);
  }
});

export const DELETE = withAuth(async (req: NextRequest, { params, user }) => {
  try {
    const { searchParams } = new URL(req.url);
    const bookmarkId = searchParams.get('bookmarkId');

    if (bookmarkId) {
      await prisma.bookmark.deleteMany({
        where: { id: bookmarkId, userId: user.userId },
      });
    } else {
      await prisma.bookmark.deleteMany({
        where: { bookId: params?.id!, userId: user.userId },
      });
    }

    return successResponse({ message: 'Bookmark removed' });
  } catch (error) {
    return handleApiError(error);
  }
});
