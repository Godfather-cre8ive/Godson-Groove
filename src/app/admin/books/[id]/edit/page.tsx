import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import BookForm from '../../BookForm';

export default async function EditBookPage({ params }: { params: { id: string } }) {
  const book = await prisma.book.findUnique({
    where: { id: params.id },
    include: { categories: { select: { categoryId: true } } },
  });
  if (!book) notFound();

  const initialData = {
    ...book,
    tags: book.tags.join(', '),
    ageMin: book.ageMin?.toString() || '',
    ageMax: book.ageMax?.toString() || '',
    pageCount: book.pageCount?.toString() || '',
    price: book.price?.toString() || '',
    digitalPrice: book.digitalPrice?.toString() || '',
    seriesId: book.seriesId || '',
    seriesOrder: book.seriesOrder?.toString() || '',
    amazonLink: book.amazonLink || '',
    selarLink: book.selarLink || '',
    okadaBooksLink: book.okadaBooksLink || '',
    categoryIds: book.categories.map((bc) => bc.categoryId),
  };

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-brand-dark mb-6">Edit: {book.title}</h2>
      <BookForm bookId={params.id} initialData={initialData as Record<string, unknown>} />
    </div>
  );
}
