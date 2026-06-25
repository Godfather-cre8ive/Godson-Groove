import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { withAdmin, withAuth } from '@/lib/withAuth';
import { successResponse, notFoundResponse, handleApiError } from '@/lib/api';

// GET /api/books/[id] - public (but file access restricted)
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const book = await prisma.book.findFirst({
      where: {
        OR: [{ id: params.id }, { slug: params.id }],
        published: true,
      },
      include: {
        series: { select: { id: true, title: true, slug: true } },
        categories: { include: { category: true } },
        files: {
          where: { isPreview: true }, // Only previews for unauthenticated
          select: {
            id: true,
            fileType: true,
            fileName: true,
            isPreview: true,
            duration: true,
            pageCount: true,
          },
        },
        physicalProduct: {
          select: {
            id: true,
            price: true,
            stockCount: true,
            isAvailable: true,
            weight: true,
          },
        },
      },
    });

    if (!book) return notFoundResponse('Book not found');

    // Check if authenticated to include full file list
    const token =
      req.cookies.get('access_token')?.value ||
      req.headers.get('authorization')?.replace('Bearer ', '');

    if (token) {
      const { verifyAccessToken } = await import('@/lib/auth');
      const user = await verifyAccessToken(token);
      if (user) {
        // Get all files (not just preview)
        const allFiles = await prisma.bookFile.findMany({
          where: { bookId: book.id },
          select: {
            id: true,
            fileType: true,
            fileName: true,
            isPreview: true,
            duration: true,
            pageCount: true,
            // Don't expose fileUrl directly - use presigned URLs
          },
        });
        return successResponse({
          ...book,
          categories: book.categories.map((bc) => bc.category),
          files: allFiles,
        });
      }
    }

    return successResponse({
      ...book,
      categories: book.categories.map((bc) => bc.category),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

const updateBookSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  author: z.string().optional(),
  illustrator: z.string().optional(),
  coverImage: z.string().url().optional(),
  isbn: z.string().optional(),
  ageMin: z.number().optional(),
  ageMax: z.number().optional(),
  pageCount: z.number().optional(),
  tags: z.array(z.string()).optional(),
  bookType: z.enum(['DIGITAL', 'PHYSICAL', 'BOTH']).optional(),
  access: z.enum(['FREE', 'PREMIUM']).optional(),
  price: z.number().optional(),
  digitalPrice: z.number().optional(),
  seriesId: z.string().optional().nullable(),
  seriesOrder: z.number().optional(),
  featured: z.boolean().optional(),
  newRelease: z.boolean().optional(),
  popular: z.boolean().optional(),
  published: z.boolean().optional(),
  amazonLink: z.string().optional().nullable(),
  selarLink: z.string().optional().nullable(),
  okadaBooksLink: z.string().optional().nullable(),
  categoryIds: z.array(z.string()).optional(),
});

// PUT /api/books/[id] - admin only
export const PUT = withAdmin(async (req: NextRequest, { params }) => {
  try {
    const body = await req.json();
    const validated = updateBookSchema.parse(body);
    const { categoryIds, ...bookData } = validated;

    const existing = await prisma.book.findUnique({ where: { id: params?.id } });
    if (!existing) return notFoundResponse('Book not found');

    const book = await prisma.book.update({
      where: { id: params?.id },
      data: {
        ...bookData,
        ...(categoryIds && {
          categories: {
            deleteMany: {},
            create: categoryIds.map((id) => ({ categoryId: id })),
          },
        }),
      },
      include: {
        categories: { include: { category: true } },
        series: true,
      },
    });

    return successResponse(book);
  } catch (error) {
    return handleApiError(error);
  }
});

// DELETE /api/books/[id] - admin only
export const DELETE = withAdmin(async (_req: NextRequest, { params }) => {
  try {
    const existing = await prisma.book.findUnique({ where: { id: params?.id } });
    if (!existing) return notFoundResponse('Book not found');

    await prisma.book.delete({ where: { id: params?.id } });
    return successResponse({ message: 'Book deleted' });
  } catch (error) {
    return handleApiError(error);
  }
});
