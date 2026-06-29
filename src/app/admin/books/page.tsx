import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import AdminBookActions from './AdminBookActions';

export const dynamic = 'force-dynamic';

interface SearchParams { page?: string; search?: string; access?: string; }

async function getBooks(params: SearchParams) {
  const page = Number(params.page || 1);
  const limit = 20;
  const skip = (page - 1) * limit;
  const where: Record<string, unknown> = {};
  if (params.access) where.access = params.access;
  if (params.search) {
    where.OR = [
      { title: { contains: params.search, mode: 'insensitive' } },
      { author: { contains: params.search, mode: 'insensitive' } },
    ];
  }
  const [books, total] = await Promise.all([
    prisma.book.findMany({
      where, skip, take: limit, orderBy: { createdAt: 'desc' },
      include: { series: { select: { title: true } }, _count: { select: { files: true } } },
    }),
    prisma.book.count({ where }),
  ]);
  return { books, total, page, totalPages: Math.ceil(total / limit) };
}

export default async function AdminBooksPage({ searchParams }: { searchParams: SearchParams }) {
  const { books, total, page, totalPages } = await getBooks(searchParams);

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <form method="GET">
            <input
              name="search"
              defaultValue={searchParams.search}
              placeholder="Search books..."
              className="input w-64 py-2 text-sm"
            />
          </form>
          <div className="flex gap-1">
            {[{ label: 'All', value: '' }, { label: 'Free', value: 'FREE' }, { label: 'Premium', value: 'PREMIUM' }].map((f) => (
              <Link
                key={f.value}
                href={`/admin/books?access=${f.value}`}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  (searchParams.access || '') === f.value
                    ? 'bg-brand-yellow text-brand-dark'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {f.label}
              </Link>
            ))}
          </div>
        </div>
        <Link href="/admin/books/create" className="btn-primary text-sm py-2.5 flex-shrink-0">
          + Add Book
        </Link>
      </div>

      <p className="text-sm text-gray-500">{total} books total</p>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Book', 'Author', 'Access', 'Type', 'Series', 'Files', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {books.map((book) => (
                <tr key={book.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <Image src={book.coverImage} alt={book.title} fill className="object-cover" sizes="40px" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-brand-dark text-sm truncate max-w-[180px]">{book.title}</p>
                        <p className="text-xs text-gray-400 font-mono">{book.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{book.author}</td>
                  <td className="px-4 py-3">
                    <span className={book.access === 'FREE' ? 'badge-free' : 'badge-premium'}>
                      {book.access}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{book.bookType}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                    {book.series?.title || '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs text-center">
                    {book._count.files}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge text-xs ${book.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {book.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <AdminBookActions bookId={book.id} bookSlug={book.slug} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex gap-2 justify-center">
          {page > 1 && (
            <Link href={`/admin/books?page=${page - 1}`} className="px-4 py-2 text-sm bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
              ← Prev
            </Link>
          )}
          <span className="px-4 py-2 text-sm bg-brand-yellow text-brand-dark rounded-xl font-bold">
            {page} / {totalPages}
          </span>
          {page < totalPages && (
            <Link href={`/admin/books?page=${page + 1}`} className="px-4 py-2 text-sm bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
