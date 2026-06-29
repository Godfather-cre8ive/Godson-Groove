import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const metadata = { title: 'Story Worlds' };

async function getSeries() {
  return prisma.series.findMany({
    where: { published: true },
    orderBy: { order: 'asc' },
    include: {
      books: {
        where: { published: true },
        orderBy: { seriesOrder: 'asc' },
        take: 4,
        select: { id: true, title: true, slug: true, coverImage: true, access: true },
      },
      _count: { select: { books: true } },
    },
  });
}

export default async function SeriesPage() {
  const series = await getSeries();

  return (
    <div className="page-container py-10">
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <h1 className="font-display text-4xl font-black text-brand-dark mb-3">🌍 Story Worlds</h1>
        <p className="text-gray-500 text-lg">
          Immersive universes where characters grow across multiple books. Follow a world, follow the journey.
        </p>
      </div>

      {series.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">📚</p>
          <p>Story Worlds coming soon!</p>
        </div>
      ) : (
        <div className="space-y-12">
          {series.map((s) => (
            <section key={s.id} className="bg-white rounded-4xl p-6 md:p-8 shadow-soft">
              <div className="flex flex-col md:flex-row md:items-center gap-6 mb-6">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 rounded-2xl bg-brand-yellow-pale overflow-hidden relative">
                    {s.books[0]?.coverImage ? (
                      <Image
                        src={s.books[0].coverImage}
                        alt={s.title}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">📚</div>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <Link href={`/series/${s.slug}`} className="group">
                    <h2 className="font-display text-2xl font-black text-brand-dark group-hover:text-brand-yellow-dark transition-colors">
                      {s.title}
                    </h2>
                  </Link>
                  <p className="text-gray-500 text-sm mt-1 leading-relaxed">{s.description}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="text-xs font-semibold text-brand-yellow-dark">
                      {s._count.books} {s._count.books === 1 ? 'book' : 'books'}
                    </span>
                    <Link
                      href={`/series/${s.slug}`}
                      className="text-xs font-semibold text-brand-dark hover:text-brand-yellow-dark transition-colors underline underline-offset-2"
                    >
                      View all →
                    </Link>
                  </div>
                </div>
              </div>

              {/* Preview books */}
              {s.books.length > 0 && (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {s.books.map((book) => (
                    <Link
                      key={book.id}
                      href={`/books/${book.slug}`}
                      className="flex-shrink-0 w-28 group"
                    >
                      <div
                        className="relative rounded-xl overflow-hidden shadow-soft"
                        style={{ aspectRatio: '2/3' }}
                      >
                        <Image
                          src={book.coverImage}
                          alt={book.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="112px"
                        />
                        <div className="absolute top-1.5 left-1.5">
                          {book.access === 'FREE' ? (
                            <span className="badge-free" style={{ fontSize: '10px', padding: '2px 6px' }}>Free</span>
                          ) : (
                            <span className="badge-premium" style={{ fontSize: '10px', padding: '2px 6px' }}>⭐</span>
                          )}
                        </div>
                      </div>
                      <p className="text-xs font-medium text-brand-dark mt-2 line-clamp-2 leading-tight group-hover:text-brand-yellow-dark transition-colors">
                        {book.title}
                      </p>
                    </Link>
                  ))}
                  {s._count.books > 4 && (
                    <Link
                      href={`/series/${s.slug}`}
                      className="flex-shrink-0 w-28 flex flex-col items-center justify-center bg-brand-yellow-pale hover:bg-brand-yellow rounded-xl transition-colors"
                      style={{ aspectRatio: '2/3', minHeight: '168px' }}
                    >
                      <span className="text-2xl font-black text-brand-dark">+{s._count.books - 4}</span>
                      <span className="text-xs text-brand-dark/70 font-medium mt-1">more</span>
                    </Link>
                  )}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
