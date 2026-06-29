import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdmin } from '@/lib/withAuth';
import { uploadFile, getFileFolder } from '@/lib/storage';
import { successResponse, errorResponse, handleApiError } from '@/lib/api';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export const POST = withAdmin(async (req: NextRequest, { user }) => {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const bookId = formData.get('bookId') as string;
    const fileType = formData.get('fileType') as string;
    const isPreview = formData.get('isPreview') === 'true';

    if (!file) return errorResponse('No file provided', 400);
    if (file.size > MAX_FILE_SIZE) return errorResponse('File too large (max 100MB)', 400);

    const buffer = Buffer.from(await file.arrayBuffer());
    const folder = getFileFolder(file.type);
    const result = await uploadFile(buffer, file.name, file.type, folder);

    // If bookId provided, create BookFile record
    if (bookId) {
      const bookFile = await prisma.bookFile.create({
        data: {
          bookId,
          fileType: (fileType || mapMimeToFileType(file.type)) as 'PDF' | 'EPUB' | 'AUDIO' | 'IMAGE',
          fileUrl: result.url,
          fileName: file.name,
          fileSize: result.size,
          isPreview,
        },
      });

      // Also log as media asset
      await prisma.mediaAsset.create({
        data: {
          name: file.name,
          url: result.url,
          fileType: file.type,
          fileSize: result.size,
          mimeType: file.type,
          uploadedBy: user.userId,
          usedIn: `book:${bookId}`,
        },
      });

      return successResponse({ ...result, bookFile }, 201);
    }

    // Generic upload
    const asset = await prisma.mediaAsset.create({
      data: {
        name: file.name,
        url: result.url,
        fileType: file.type,
        fileSize: result.size,
        mimeType: file.type,
        uploadedBy: user.userId,
      },
    });

    return successResponse({ ...result, asset }, 201);
  } catch (error) {
    return handleApiError(error);
  }
});

function mapMimeToFileType(mime: string): string {
  if (mime === 'application/pdf') return 'PDF';
  if (mime === 'application/epub+zip') return 'EPUB';
  if (mime.startsWith('audio/')) return 'AUDIO';
  if (mime.startsWith('image/')) return 'IMAGE';
  return 'PDF';
}
