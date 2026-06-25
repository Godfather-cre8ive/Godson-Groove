import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handleApiError, paginationMeta } from '@/lib/api';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim();
    const page = Number(searchParams.get('page') || 1);
    const limit = Math.min(Number(searchParams.get('limit') || 20), 50);
    const skip = (page - 1) * limit;
    const category = searchParams.get('category');
    const access = searchParams.get('access') as 'FREE' | 'PREMIUM' | null;
    const ageMin = searchParams.get('ageMin') ? Number(searchParams.get('ageMin')) : null;
    const ageMax = searchParams.get('ageMax') ? Number(searchParams.get('ageMax')) : null;

    if (!q || q.length < 1) {
      return errorResponse('Search query required', 400);
    }

    const where: Record<string, unknown> = {
      published: true,
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { author: { contains: q, mode: 'insensitive' } },
        { tags: { has: q.toLowerCase() } },
        { series: { title: { contains: q, mode: 'insensitive' } } },
      ],
    };

    if (category) {
      where.categories = { some: { category: { slug: category } } };
    }
    if (access) where.access = access;
    if (ageMin !== null) where.ageMax = { gte: ageMin };
    if (ageMax !== null) where.ageMin = { lte: ageMax };

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
        select: {
          id: true,
          title: true,
          slug: true,
          shortDescription: true,
          author: true,
          coverImage: true,
          access: true,
          bookType: true,
          price: true,
          digitalPrice: true,
          ageMin: true,
          ageMax: true,
          tags: true,
          featured: true,
          series: { select: { id: true, title: true, slug: true } },
          categories: {
            select: { category: { select: { id: true, name: true, slug: true } } },
          },
        },
      }),
      prisma.book.count({ where }),
    ]);

    return successResponse({
      query: q,
      books: books.map((b) => ({
        ...b,
        categories: b.categories.map((bc) => bc.category),
      })),
      pagination: paginationMeta(total, page, limit),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
