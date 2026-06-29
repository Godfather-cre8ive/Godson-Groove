import Link from 'next/link';
import BookCard from './BookCard';

interface Book {
  id: string;
  slug: string;
  title: string;
  author: string;
  coverImage: string;
  access: 'FREE' | 'PREMIUM';
  price?: number | null;
  ageMin?: number | null;
  ageMax?: number | null;
  series?: { title: string; slug: string } | null;
}

interface BookCarouselProps {
  title: string;
  books: Book[];
  viewAllHref?: string;
  showPrice?: boolean;
  size?: 'sm' | 'md' | 'lg';
  emptyMessage?: string;
}

export default function BookCarousel({
  title,
  books,
  viewAllHref,
  showPrice = false,
  size = 'md',
  emptyMessage = 'No books available',
}: BookCarouselProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <h2 className="section-title">{title}</h2>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="text-sm font-semibold text-brand-yellow-dark hover:text-brand-dark transition-colors flex items-center gap-1"
          >
            View all
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>

      {books.length === 0 ? (
        <div className="flex items-center justify-center h-40 rounded-3xl bg-white/60 text-gray-400 text-sm">
          {emptyMessage}
        </div>
      ) : (
        <div className="scroll-snap-x -mx-4 px-4">
          {books.map((book) => (
            <BookCard key={book.id} book={book} size={size} showPrice={showPrice} />
          ))}
        </div>
      )}
    </section>
  );
}
