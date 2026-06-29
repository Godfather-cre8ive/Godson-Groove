import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/withAuth';
import { successResponse, handleApiError } from '@/lib/api';

export const GET = withAuth(async (_req: NextRequest, { user }) => {
  try {
    const [
      readingProgress,
      bookmarks,
      recentOrders,
      activeSubscription,
    ] = await Promise.all([
      prisma.readingProgress.findMany({
        where: { userId: user.userId },
        orderBy: { lastReadAt: 'desc' },
        take: 10,
        include: {
          book: {
            select: {
              id: true, title: true, slug: true, coverImage: true,
              author: true, access: true,
            },
          },
        },
      }),
      prisma.bookmark.findMany({
        where: { userId: user.userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          book: {
            select: {
              id: true, title: true, slug: true, coverImage: true, author: true,
            },
          },
        },
      }),
      prisma.order.findMany({
        where: { userId: user.userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          items: {
            include: { book: { select: { title: true, coverImage: true } } },
          },
          payment: { select: { status: true } },
        },
      }),
      prisma.subscription.findFirst({
        where: {
          userId: user.userId,
          status: 'ACTIVE',
          currentPeriodEnd: { gte: new Date() },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const stats = {
      booksRead: await prisma.readingProgress.count({
        where: { userId: user.userId, completed: true },
      }),
      booksInProgress: await prisma.readingProgress.count({
        where: { userId: user.userId, completed: false },
      }),
      totalBookmarks: await prisma.bookmark.count({
        where: { userId: user.userId },
      }),
      totalOrders: await prisma.order.count({
        where: { userId: user.userId },
      }),
    };

    return successResponse({
      stats,
      readingProgress,
      bookmarks,
      recentOrders,
      activeSubscription,
    });
  } catch (error) {
    return handleApiError(error);
  }
});
