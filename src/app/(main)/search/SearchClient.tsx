'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Book {
  id: string;
  slug: string;
  title: string;
  author: string;
  coverImage: string;
  access: 'FREE' | 'PREMIUM';
  shortDescription?: string;
  ageMin?: number | null;
  ageMax?: number | null;
  tags: string[];
  bookType: string;
  price?: number | null;
  series?: { title: string; slug: string } | null;
  categories: { id: string; name: string; slug: string }[];
}

interface SearchResult {
  query: string;
  books: Book[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export default function SearchClient({
  initialQ,
  initialAccess,
}: {
  initialQ: string;
  initialAccess: string;
}) {
  const router = useRouter();

  const [query, setQuery] = useState(initialQ);
  const [inputValue, setInputValue] = useState(initialQ);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [accessFilter, setAccessFilter] = useState(initialAccess);

  const search = useCallback(async (q: string, pg = 1, access = '') => {
    if (!q.trim()) { setResults(null); return; }
    setLoading(true);
    try {
      const params = new URLSearchParams({ q, page: String(pg), limit: '20' });
      if (access) params.set('access', access);
      const res = await fetch(`/api/books/search?${params}`);
      const json = await res.json();
      if (json.success) setResults(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialQ) search(initialQ, 1, accessFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = inputValue.trim();
    if (!q) return;
    setQuery(q);
    setPage(1);
    router.push(`/search?q=${encodeURIComponent(q)}`);
    search(q, 1, accessFilter);
  };

  const handleAccessFilter = (val: string) => {
    setAccessFilter(val);
    setPage(1);
    if (query) search(query, 1, val);
  };

  const handlePage = (pg: number) => {
    setPage(pg);
    search(query, pg, accessFilter);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="page-container py-10">
      <h1 className="font-display text-3xl font-black text-brand-dark mb-6">🔍 Search Books</h1>

      {/* Search form */}
      <form onSubmit={handleSubmit} className="relative mb-8">
        <input
          type="search"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Search by title, author, series, or tag..."
          className="input pr-36 text-base py-4 text-lg shadow-soft"
          autoFocus
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary py-2.5 px-6 text-sm"
        >
          Search
        </button>
      </form>

      {/* Filters */}
      {results && (
        <div className="flex gap-2 mb-6">
          {[
            { label: 'All', value: '' },
            { label: '📖 Free', value: 'FREE' },
            { label: '⭐ Premium', value: 'PREMIUM' },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => handleAccessFilter(f.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                accessFilter === f.value
                  ? 'bg-brand-yellow text-brand-dark shadow-brand'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-brand-yellow-pale'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4 p-4 bg-white rounded-2xl animate-pulse">
              <div className="skeleton w-16 h-24 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="skeleton h-4 w-3/4 rounded" />
                <div className="skeleton h-3 w-1/3 rounded" />
                <div className="skeleton h-3 w-full rounded" />
                <div className="skeleton h-3 w-2/3 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results - LIST FORMAT */}
      {!loading && results && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              <strong>{results.pagination.total}</strong> results for{' '}
              <strong className="text-brand-dark">"{results.query}"</strong>
            </p>
          </div>

          {results.books.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">😔</div>
              <h3 className="font-display text-xl font-bold text-brand-dark mb-2">No results found</h3>
              <p className="text-gray-500 mb-6">
                Try different keywords or browse our full collection
              </p>
              <Link href="/books" className="btn-primary">Browse All Books</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {results.books.map((book) => (
                <Link
                  key={book.id}
                  href={`/books/${book.slug}`}
                  className="flex gap-4 p-4 bg-white rounded-2xl shadow-soft hover:shadow-soft-lg hover:-translate-y-0.5 transition-all group"
                >
                  {/* Cover thumbnail */}
                  <div
                    className="relative flex-shrink-0 w-16 rounded-xl overflow-hidden bg-brand-yellow-pale"
                    style={{ aspectRatio: '2/3', height: '96px', width: '64px' }}
                  >
                    <Image
                      src={book.coverImage}
                      alt={book.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                      sizes="64px"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        {book.series && (
                          <p className="text-xs text-brand-yellow-dark font-semibold mb-0.5">
                            {book.series.title}
                          </p>
                        )}
                        <h3 className="font-display font-bold text-brand-dark group-hover:text-brand-yellow-dark transition-colors leading-tight truncate">
                          {book.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-0.5">by {book.author}</p>
                      </div>
                      <div className="flex-shrink-0">
                        {book.access === 'FREE' ? (
                          <span className="badge-free">Free</span>
                        ) : (
                          <span className="badge-premium">⭐ Premium</span>
                        )}
                      </div>
                    </div>

                    {book.shortDescription && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2 leading-relaxed">
                        {book.shortDescription}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {book.ageMin !== null && book.ageMin !== undefined && (
                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                          Ages {book.ageMin}{book.ageMax ? `–${book.ageMax}` : '+'}
                        </span>
                      )}
                      {book.categories.slice(0, 2).map((cat) => (
                        <span
                          key={cat.id}
                          className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full"
                        >
                          {cat.name}
                        </span>
                      ))}
                      {book.price && (
                        <span className="text-xs font-bold text-brand-dark ml-auto">
                          ₦{book.price.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {results.pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {results.pagination.hasPrev && (
                <button
                  onClick={() => handlePage(page - 1)}
                  className="px-5 py-2.5 rounded-2xl bg-white border border-gray-200 text-sm font-medium hover:bg-brand-yellow-pale transition-colors"
                >
                  ← Previous
                </button>
              )}
              <span className="px-5 py-2.5 rounded-2xl bg-brand-yellow text-brand-dark text-sm font-bold">
                {page} / {results.pagination.totalPages}
              </span>
              {results.pagination.hasNext && (
                <button
                  onClick={() => handlePage(page + 1)}
                  className="px-5 py-2.5 rounded-2xl bg-white border border-gray-200 text-sm font-medium hover:bg-brand-yellow-pale transition-colors"
                >
                  Next →
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* Empty state - no query yet */}
      {!loading && !results && (
        <div className="text-center py-20">
          <div className="text-6xl mb-6">🔍</div>
          <h3 className="font-display text-xl font-bold text-brand-dark mb-2">
            Start searching
          </h3>
          <p className="text-gray-500 mb-8">
            Search by book title, author name, story world, or topic
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {['Adventure', 'Animals', 'Family', 'Fantasy', 'Africa'].map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  setInputValue(tag);
                  setQuery(tag);
                  search(tag, 1, accessFilter);
                  router.push(`/search?q=${encodeURIComponent(tag)}`);
                }}
                className="px-4 py-2 rounded-full bg-brand-yellow-pale text-brand-dark text-sm font-medium hover:bg-brand-yellow transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
                            }
