import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/withAuth';
import { successResponse, errorResponse, notFoundResponse, handleApiError } from '@/lib/api';
import { getPresignedUrl } from '@/lib/storage';

export const GET = withAuth(async (req: NextRequest, { params, user }) => {
  try {
    const book = await prisma.book.findFirst({
      where: {
        OR: [{ id: params?.id }, { slug: params?.id }],
        published: true,
      },
      include: {
        files: true,
      },
    });

    if (!book) return notFoundResponse('Book not found');

    // Check access
    if (book.access === 'PREMIUM') {
      const hasAccess =
        user.role === 'ADMIN' ||
        (await prisma.subscription.findFirst({
          where: {
            userId: user.userId,
            status: 'ACTIVE',
            currentPeriodEnd: { gte: new Date() },
          },
        }));

      if (!hasAccess) {
        return errorResponse('Premium subscription required', 403);
      }
    }

    // Generate presigned URLs for files
    const filesWithUrls = await Promise.all(
      book.files.map(async (file) => ({
        id: file.id,
        fileType: file.fileType,
        fileName: file.fileName,
        isPreview: file.isPreview,
        duration: file.duration,
        pageCount: file.pageCount,
        url: await getPresignedUrl(
          // Extract key from full URL
          file.fileUrl.includes('amazonaws.com')
            ? file.fileUrl.split('.amazonaws.com/')[1]
            : file.fileUrl,
          3600 // 1 hour
        ),
      }))
    );

    return successResponse({ files: filesWithUrls, book: { id: book.id, title: book.title } });
  } catch (error) {
    return handleApiError(error);
  }
});
