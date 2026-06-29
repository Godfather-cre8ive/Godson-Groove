import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { withAdmin } from '@/lib/withAuth';
import { successResponse, notFoundResponse, handleApiError } from '@/lib/api';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const s = await prisma.series.findFirst({
      where: { OR: [{ id: params.id }, { slug: params.id }] },
      include: {
        books: {
          where: { published: true },
          orderBy: { seriesOrder: 'asc' },
          select: { id: true, title: true, slug: true, coverImage: true, access: true, seriesOrder: true },
        },
        _count: { select: { books: true } },
      },
    });
    if (!s) return notFoundResponse('Series not found');
    return successResponse(s);
  } catch (error) {
    return handleApiError(error);
  }
}

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  coverImage: z.string().url().optional().or(z.literal('')),
  order: z.number().optional(),
  published: z.boolean().optional(),
});

export const PUT = withAdmin(async (req: NextRequest, { params }) => {
  try {
    const body = await req.json();
    const validated = updateSchema.parse(body);
    const updated = await prisma.series.update({
      where: { id: params?.id },
      data: validated,
    });
    return successResponse(updated);
  } catch (error) {
    return handleApiError(error);
  }
});

export const DELETE = withAdmin(async (_req: NextRequest, { params }) => {
  try {
    // Unlink books from series
    await prisma.book.updateMany({
      where: { seriesId: params?.id },
      data: { seriesId: null, seriesOrder: null },
    });
    await prisma.series.delete({ where: { id: params?.id } });
    return successResponse({ message: 'Series deleted' });
  } catch (error) {
    return handleApiError(error);
  }
});
