import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { withAdmin } from '@/lib/withAuth';
import { successResponse, handleApiError } from '@/lib/api';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: { select: { books: true } },
      },
    });

    return successResponse(
      categories.map((c) => ({ ...c, bookCount: c._count.books }))
    );
  } catch (error) {
    return handleApiError(error);
  }
}

const createCategorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  order: z.number().default(0),
});

export const POST = withAdmin(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const validated = createCategorySchema.parse(body);
    const category = await prisma.category.create({ data: validated });
    return successResponse(category, 201);
  } catch (error) {
    return handleApiError(error);
  }
});
