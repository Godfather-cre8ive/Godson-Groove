import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { withAdmin } from '@/lib/withAuth';
import { successResponse, handleApiError, paginationMeta } from '@/lib/api';

// GET /api/books - public, with filters
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page') || 1);
    const limit = Math.min(Number(searchParams.get('limit') || 20), 50);
    const skip = (page - 1) * limit;
    const category = searchParams.get('category');
    const seriesId = searchParams.get('series');
    const access = searchParams.get('access') as 'FREE' | 'PREMIUM' | null;
    const featured = searchParams.get('featured') === 'true';
    const newRelease = searchParams.get('new') === 'true';
    const popular = searchParams.get('popular') === 'true';
    const bookType = searchParams.get('type') as 'DIGITAL' | 'PHYSICAL' | 'BOTH' | null;

    const where: Record<string, unknown> = { published: true };

    if (category) {
      where.categories = { some: { category: { slug: category } } };
    }
    if (seriesId) where.seriesId = seriesId;
    if (access) where.access = access;
    if (featured) where.featured = true;
    if (newRelease) where.newRelease = true;
    if (popular) where.popular = true;
    if (bookType) where.bookType = bookType;

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
          featured: true,
          newRelease: true,
          popular: true,
          ageMin: true,
          ageMax: true,
          tags: true,
          amazonLink: true,
          selarLink: true,
          okadaBooksLink: true,
          series: { select: { id: true, title: true, slug: true } },
          categories: {
            select: { category: { select: { id: true, name: true, slug: true } } },
          },
        },
      }),
      prisma.book.count({ where }),
    ]);

    return successResponse({
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

const createBookSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  shortDescription: z.string().optional(),
  author: z.string().min(1),
  illustrator: z.string().optional(),
  coverImage: z.string().url(),
  isbn: z.string().optional(),
  publishedAt: z.string().optional(),
  ageMin: z.number().optional(),
  ageMax: z.number().optional(),
  pageCount: z.number().optional(),
  language: z.string().default('en'),
  tags: z.array(z.string()).default([]),
  bookType: z.enum(['DIGITAL', 'PHYSICAL', 'BOTH']).default('BOTH'),
  access: z.enum(['FREE', 'PREMIUM']).default('FREE'),
  price: z.number().optional(),
  digitalPrice: z.number().optional(),
  seriesId: z.string().optional(),
  seriesOrder: z.number().optional(),
  featured: z.boolean().default(false),
  newRelease: z.boolean().default(false),
  popular: z.boolean().default(false),
  published: z.boolean().default(true),
  amazonLink: z.string().url().optional().or(z.literal('')),
  selarLink: z.string().url().optional().or(z.literal('')),
  okadaBooksLink: z.string().url().optional().or(z.literal('')),
  categoryIds: z.array(z.string()).default([]),
});

// POST /api/books - admin only
export const POST = withAdmin(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const validated = createBookSchema.parse(body);
    const { categoryIds, ...bookData } = validated;

    const book = await prisma.book.create({
      data: {
        ...bookData,
        categories: {
          create: categoryIds.map((id) => ({ categoryId: id })),
        },
      },
      include: {
        categories: { include: { category: true } },
        series: true,
      },
    });

    return successResponse(book, 201);
  } catch (error) {
    return handleApiError(error);
  }
});
