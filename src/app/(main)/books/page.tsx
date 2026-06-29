import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';

interface SearchParams {
  category?: string;
  access?: string;
  new?: string;
  popular?: string;
  featured?: string;
  page?: string;
}

async function getBooks(params: SearchParams) {
  const page = Number(params.page || 1);
  const limit = 24;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { published: true };
  if (params.category) where.categories = { some: { category: { slug: params.category } } };
  if (params.access) where.access = params.access.toUpperCase();
  if (params.new === 'true') where.newRelease = true;
  if (params.popular === 'true') where.popular = true;
  if (params.featured === 'true') where.featured = true;

  const [books, total, categories] = await Promise.all([
    prisma.book.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
      include: {
        series: { select: { title: true, slug: true } },
        categories: { include: { category: { select: { name: true, slug: true } } } },
      },
    }),
    prisma.book.count({ where }),
    prisma.category.findMany({ orderBy: { order: 'asc' } }),
  ]);

  return {
    books: books.map((b) => ({ ...b, categories: b.categories.map((bc) => bc.category) })),
    total,
    categories,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export default async function BooksPage({ searchParams }: { searchParams: SearchParams }) {
  const { books, total, categories, page, totalPages } = await getBooks(searchParams);

  const activeCategory = searchParams.category;
  const activeAccess = searchParams.access;

  return (
    <div className="page-container py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl font-black text-brand-dark mb-2">
          {searchParams.new === 'true'
            ? '🆕 New Releases'
            : searchParams.popular === 'true'
            ? '🔥 Popular Stories'
            : searchParams.access === 'FREE'
            ? '📖 Free Books'
            : searchParams.access === 'PREMIUM'
            ? '⭐ Premium Books'
            : 'All Books'}
        </h1>
        <p className="text-gray-500">{total} books available</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        {/* Access filter */}
        <div className="flex gap-2">
          {[
            { label: 'All', value: '' },
            { label: '📖 Free', value: 'FREE' },
            { label: '⭐ Premium', value: 'PREMIUM' },
          ].map((f) => (
            <Link
              key={f.value}
              href={`/books?${new URLSearchParams({ ...searchParams, access: f.value, page: '1' }).toString()}`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                (activeAccess || '') === f.value
                  ? 'bg-brand-yellow text-brand-dark shadow-brand'
                  : 'bg-white text-gray-600 hover:bg-brand-yellow-pale border border-gray-200'
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <Link
            href={`/books?${new URLSearchParams({ ...searchParams, category: '', page: '1' }).toString()}`}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              !activeCategory
                ? 'bg-brand-dark text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            All Categories
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/books?${new URLSearchParams({ ...searchParams, category: cat.slug, page: '1' }).toString()}`}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat.slug
                  ? 'bg-brand-dark text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {cat.icon && <span className="mr-1">{cat.icon}</span>}
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Books Grid */}
      {books.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="font-display text-xl font-bold text-brand-dark mb-2">No books found</h3>
          <p className="text-gray-500 mb-6">Try adjusting your filters</p>
          <Link href="/books" className="btn-primary">Browse All Books</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          {books.map((book) => (
            <Link key={book.id} href={`/books/${book.slug}`} className="book-card group">
              <div className="book-card-cover rounded-2xl">
                <Image
                  src={book.coverImage}
                  alt={book.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 45vw, (max-width: 768px) 30vw, (max-width: 1024px) 22vw, 16vw"
                />
                <div className="absolute top-2 left-2">
                  <span className={book.access === 'FREE' ? 'badge-free text-xs' : 'badge-premium text-xs'}>
                    {book.access === 'FREE' ? 'Free' : '⭐'}
                  </span>
                </div>
              </div>
              <div className="p-3">
                {book.series && (
                  <p className="text-xs text-brand-yellow-dark font-semibold truncate mb-0.5">
                    {book.series.title}
                  </p>
                )}
                <h3 className="font-display font-semibold text-sm text-brand-dark line-clamp-2 leading-tight group-hover:text-brand-yellow-dark transition-colors">
                  {book.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1 truncate">{book.author}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-12">
          {page > 1 && (
            <Link
              href={`/books?${new URLSearchParams({ ...searchParams, page: String(page - 1) }).toString()}`}
              className="px-5 py-2.5 rounded-2xl bg-white border border-gray-200 text-sm font-medium hover:bg-brand-yellow-pale transition-colors"
            >
              ← Previous
            </Link>
          )}
          <span className="px-5 py-2.5 rounded-2xl bg-brand-yellow text-brand-dark text-sm font-bold">
            {page} / {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/books?${new URLSearchParams({ ...searchParams, page: String(page + 1) }).toString()}`}
              className="px-5 py-2.5 rounded-2xl bg-white border border-gray-200 text-sm font-medium hover:bg-brand-yellow-pale transition-colors"
            >
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
