import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import BookActions from './BookActions';

async function getBook(slug: string) {
  return prisma.book.findFirst({
    where: { OR: [{ slug }, { id: slug }], published: true },
    include: {
      series: {
        include: {
          books: {
            where: { published: true },
            orderBy: { seriesOrder: 'asc' },
            select: { id: true, title: true, slug: true, coverImage: true, seriesOrder: true },
          },
        },
      },
      categories: { include: { category: true } },
      files: {
        where: { isPreview: true },
        select: { id: true, fileType: true, fileName: true, isPreview: true },
      },
      physicalProduct: true,
    },
  });
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const book = await getBook(params.slug);
  if (!book) return { title: 'Book Not Found' };
  return {
    title: book.title,
    description: book.shortDescription || book.description.slice(0, 160),
    openGraph: {
      images: [{ url: book.coverImage }],
    },
  };
}

export default async function BookPage({ params }: { params: { slug: string } }) {
  const book = await getBook(params.slug);
  if (!book) notFound();

  const categories = book.categories.map((bc) => bc.category);
  const hasPhysical = book.bookType === 'PHYSICAL' || book.bookType === 'BOTH';
  const hasDigital = book.bookType === 'DIGITAL' || book.bookType === 'BOTH';

  return (
    <div className="page-container py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-brand-dark transition-colors">Home</Link>
        <span>/</span>
        <Link href="/books" className="hover:text-brand-dark transition-colors">Books</Link>
        {book.series && (
          <>
            <span>/</span>
            <Link href={`/series/${book.series.slug}`} className="hover:text-brand-dark transition-colors">
              {book.series.title}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-brand-dark font-medium truncate max-w-[200px]">{book.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Cover */}
        <div className="lg:col-span-2">
          <div className="sticky top-24">
            <div className="relative rounded-3xl overflow-hidden shadow-soft-lg mx-auto max-w-xs lg:max-w-full">
              <div className="relative" style={{ aspectRatio: '2/3' }}>
                <Image
                  src={book.coverImage}
                  alt={book.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 320px, 40vw"
                />
              </div>
              <div className="absolute top-3 left-3">
                {book.access === 'FREE' ? (
                  <span className="badge-free">Free to Read</span>
                ) : (
                  <span className="badge-premium">⭐ Premium</span>
                )}
              </div>
            </div>

            {/* External links */}
            {(book.amazonLink || book.selarLink || book.okadaBooksLink) && (
              <div className="mt-6 p-4 bg-white rounded-2xl shadow-soft">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Also available on
                </p>
                <div className="flex flex-col gap-2">
                  {book.amazonLink && (
                    <a
                      href={book.amazonLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#FF9900]/10 hover:bg-[#FF9900]/20 text-[#FF6600] text-sm font-medium transition-colors"
                    >
                      <span>📦</span> Buy on Amazon
                    </a>
                  )}
                  {book.selarLink && (
                    <a
                      href={book.selarLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-brand-yellow/10 hover:bg-brand-yellow/20 text-brand-yellow-dark text-sm font-medium transition-colors"
                    >
                      <span>🛒</span> Buy on Selar
                    </a>
                  )}
                  {book.okadaBooksLink && (
                    <a
                      href={book.okadaBooksLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-green-50 hover:bg-green-100 text-green-700 text-sm font-medium transition-colors"
                    >
                      <span>📗</span> Buy on OkadaBooks
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-3">
          {book.series && (
            <Link
              href={`/series/${book.series.slug}`}
              className="inline-flex items-center gap-1.5 text-brand-yellow-dark text-sm font-semibold mb-3 hover:text-brand-dark transition-colors"
            >
              📚 {book.series.title}
              {book.seriesOrder && <span className="text-gray-400 font-normal">· Book {book.seriesOrder}</span>}
            </Link>
          )}

          <h1 className="font-display text-3xl md:text-4xl font-black text-brand-dark leading-tight mb-3">
            {book.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 mb-5">
            <span className="text-gray-600 text-sm">by <strong>{book.author}</strong></span>
            {book.illustrator && (
              <span className="text-gray-400 text-sm">· Illustrated by {book.illustrator}</span>
            )}
            {book.ageMin !== null && (
              <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                Ages {book.ageMin}{book.ageMax ? `–${book.ageMax}` : '+'}
              </span>
            )}
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/books?category=${cat.slug}`}
                  className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-brand-yellow-pale hover:text-brand-dark transition-colors font-medium"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}

          {/* Description */}
          <div className="prose prose-sm max-w-none text-gray-700 mb-8 leading-relaxed">
            <p>{book.description}</p>
          </div>

          {/* Book meta */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-white rounded-2xl shadow-soft mb-8">
            {[
              { label: 'Pages', value: book.pageCount ? `${book.pageCount} pages` : 'N/A' },
              { label: 'Language', value: book.language.toUpperCase() },
              { label: 'ISBN', value: book.isbn || 'N/A' },
              { label: 'Published', value: book.publishedAt ? new Date(book.publishedAt).getFullYear().toString() : 'N/A' },
            ].map((m) => (
              <div key={m.label}>
                <p className="text-xs text-gray-400 font-medium">{m.label}</p>
                <p className="text-sm font-semibold text-brand-dark mt-0.5">{m.value}</p>
              </div>
            ))}
          </div>

          {/* Action buttons (client component for auth-awareness) */}
          <BookActions
            book={{
              id: book.id,
              slug: book.slug,
              title: book.title,
              coverImage: book.coverImage,
              author: book.author,
              access: book.access,
              hasDigital,
              hasPhysical,
              price: book.physicalProduct?.price || book.price,
              digitalPrice: book.digitalPrice,
              physicalAvailable: book.physicalProduct?.isAvailable ?? false,
              physicalStock: book.physicalProduct?.stockCount ?? 0,
            }}
          />

          {/* Tags */}
          {book.tags.length > 0 && (
            <div className="mt-8">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">Tags</p>
              <div className="flex flex-wrap gap-2">
                {book.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/search?q=${encodeURIComponent(tag)}`}
                    className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-500 hover:bg-brand-yellow-pale hover:text-brand-dark transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Series books */}
      {book.series && book.series.books.length > 1 && (
        <section className="mt-16 pt-10 border-t border-gray-200">
          <h2 className="section-title mb-6">More in {book.series.title}</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {book.series.books
              .filter((b) => b.id !== book.id)
              .map((b) => (
                <Link key={b.id} href={`/books/${b.slug}`} className="flex-shrink-0 w-32 group">
                  <div className="relative rounded-xl overflow-hidden shadow-soft" style={{ aspectRatio: '2/3' }}>
                    <Image
                      src={b.coverImage}
                      alt={b.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                      sizes="128px"
                    />
                  </div>
                  <p className="text-xs font-medium text-brand-dark mt-2 line-clamp-2 group-hover:text-brand-yellow-dark transition-colors">
                    {b.title}
                  </p>
                </Link>
              ))}
          </div>
        </section>
      )}
    </div>
  );
}
