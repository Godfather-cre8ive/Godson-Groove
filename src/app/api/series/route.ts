import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { withAdmin } from '@/lib/withAuth';
import { successResponse, handleApiError } from '@/lib/api';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const withBooks = searchParams.get('withBooks') === 'true';

    const series = await prisma.series.findMany({
      where: { published: true },
      orderBy: { order: 'asc' },
      include: withBooks
        ? {
            books: {
              where: { published: true },
              orderBy: { seriesOrder: 'asc' },
              select: {
                id: true,
                title: true,
                slug: true,
                coverImage: true,
                access: true,
                seriesOrder: true,
              },
            },
          }
        : undefined,
    });

    return successResponse(series);
  } catch (error) {
    return handleApiError(error);
  }
}

const createSeriesSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string(),
  coverImage: z.string().url().optional(),
  order: z.number().default(0),
  published: z.boolean().default(true),
});

export const POST = withAdmin(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const validated = createSeriesSchema.parse(body);
    const series = await prisma.series.create({ data: validated });
    return successResponse(series, 201);
  } catch (error) {
    return handleApiError(error);
  }
});
