import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdmin } from '@/lib/withAuth';
import { successResponse, handleApiError } from '@/lib/api';

export const GET = withAdmin(async (_req: NextRequest) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);

    const [
      totalUsers,
      newUsersThisMonth,
      activeSubscriptions,
      totalBooks,
      totalOrders,
      pendingOrders,
      revenueThisMonth,
      recentOrders,
      topBooks,
      userGrowth,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      prisma.book.count({ where: { published: true } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.payment.aggregate({
        where: {
          status: 'SUCCESS',
          paidAt: { gte: thirtyDaysAgo },
        },
        _sum: { amount: true },
      }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
          items: { select: { quantity: true } },
          payment: { select: { status: true } },
        },
      }),
      prisma.readingProgress.groupBy({
        by: ['bookId'],
        _count: { bookId: true },
        orderBy: { _count: { bookId: 'desc' } },
        take: 5,
      }),
      prisma.user.groupBy({
        by: ['createdAt'],
        where: { createdAt: { gte: thirtyDaysAgo } },
        _count: true,
      }),
    ]);

    // Get top book details
    const topBookIds = topBooks.map((b) => b.bookId);
    const topBookDetails = await prisma.book.findMany({
      where: { id: { in: topBookIds } },
      select: { id: true, title: true, coverImage: true, author: true },
    });

    const topBooksWithDetails = topBooks.map((b) => ({
      ...b,
      book: topBookDetails.find((bd) => bd.id === b.bookId),
      readCount: b._count.bookId,
    }));

    return successResponse({
      overview: {
        totalUsers,
        newUsersThisMonth,
        activeSubscriptions,
        totalBooks,
        totalOrders,
        pendingOrders,
        revenueThisMonth: revenueThisMonth._sum.amount || 0,
      },
      recentOrders,
      topBooks: topBooksWithDetails,
      userGrowth,
    });
  } catch (error) {
    return handleApiError(error);
  }
});
