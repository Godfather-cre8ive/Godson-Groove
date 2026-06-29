import Link from 'next/link';
import Image from 'next/image';

interface BookCardProps {
  book: {
    id: string;
    slug: string;
    title: string;
    author: string;
    coverImage: string;
    access: 'FREE' | 'PREMIUM';
    bookType?: string;
    price?: number | null;
    ageMin?: number | null;
    ageMax?: number | null;
    series?: { title: string; slug: string } | null;
  };
  size?: 'sm' | 'md' | 'lg';
  showPrice?: boolean;
}

export default function BookCard({ book, size = 'md', showPrice = false }: BookCardProps) {
  const widthMap = { sm: 'w-36', md: 'w-44', lg: 'w-56' };
  const width = widthMap[size];

  return (
    <Link href={`/books/${book.slug}`} className={`book-card ${width} group`}>
      {/* Cover */}
      <div className="book-card-cover rounded-2xl overflow-hidden relative">
        <Image
          src={book.coverImage}
          alt={book.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes={size === 'sm' ? '144px' : size === 'md' ? '176px' : '224px'}
        />
        {/* Access badge */}
        <div className="absolute top-2 left-2">
          {book.access === 'FREE' ? (
            <span className="badge-free text-xs">Free</span>
          ) : (
            <span className="badge-premium text-xs">⭐ Premium</span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-3 flex-1 flex flex-col gap-1">
        {book.series && (
          <p className="text-xs text-brand-yellow-dark font-semibold truncate">
            {book.series.title}
          </p>
        )}
        <h3 className="font-display font-semibold text-sm text-brand-dark leading-tight line-clamp-2 group-hover:text-brand-yellow-dark transition-colors">
          {book.title}
        </h3>
        <p className="text-xs text-gray-500 truncate">{book.author}</p>
        {book.ageMin !== undefined && book.ageMin !== null && (
          <p className="text-xs text-gray-400">
            Ages {book.ageMin}{book.ageMax ? `–${book.ageMax}` : '+'}
          </p>
        )}
        {showPrice && book.price && (
          <p className="text-sm font-bold text-brand-dark mt-auto pt-1">
            ₦{book.price.toLocaleString()}
          </p>
        )}
      </div>
    </Link>
  );
}
