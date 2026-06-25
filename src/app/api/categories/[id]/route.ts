import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { withAdmin } from '@/lib/withAuth';
import { successResponse, notFoundResponse, handleApiError } from '@/lib/api';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cat = await prisma.category.findUnique({ where: { id: params.id } });
    if (!cat) return notFoundResponse('Category not found');
    return successResponse(cat);
  } catch (error) {
    return handleApiError(error);
  }
}

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  order: z.number().optional(),
});

export const PUT = withAdmin(async (req: NextRequest, { params }) => {
  try {
    const body = await req.json();
    const validated = updateSchema.parse(body);
    const updated = await prisma.category.update({
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
    await prisma.bookCategory.deleteMany({ where: { categoryId: params?.id } });
    await prisma.category.delete({ where: { id: params?.id } });
    return successResponse({ message: 'Category deleted' });
  } catch (error) {
    return handleApiError(error);
  }
});
