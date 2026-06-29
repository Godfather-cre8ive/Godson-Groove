'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { useCart } from '@/components/CartProvider';

interface BookActionsProps {
  book: {
    id: string;
    slug: string;
    title: string;
    coverImage: string;
    author: string;
    access: 'FREE' | 'PREMIUM';
    hasDigital: boolean;
    hasPhysical: boolean;
    price?: number | null;
    digitalPrice?: number | null;
    physicalAvailable: boolean;
    physicalStock: number;
  };
}

export default function BookActions({ book }: BookActionsProps) {
  const { user, isSubscriber } = useAuth();
  const { addItem, isInCart } = useCart();
  const [addedToCart, setAddedToCart] = useState(false);

  const canRead =
    book.access === 'FREE' ||
    isSubscriber ||
    (user && book.digitalPrice === null);

  const inCart = isInCart(book.id);

  const handleAddToCart = () => {
    if (!book.price) return;
    addItem({
      bookId: book.id,
      title: book.title,
      coverImage: book.coverImage,
      author: book.author,
      price: book.price,
      slug: book.slug,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  return (
    <div className="space-y-4">
      {/* Digital read */}
      {book.hasDigital && (
        <div>
          {canRead ? (
            <Link
              href={`/books/${book.slug}/read`}
              className="btn-primary w-full text-center block text-base py-4"
            >
              📖 Read Now
            </Link>
          ) : (
            <div className="space-y-3">
              <div className="p-4 bg-brand-yellow/10 border border-brand-yellow/30 rounded-2xl text-center">
                <p className="text-sm font-semibold text-brand-dark mb-1">
                  ⭐ Premium Book
                </p>
                <p className="text-xs text-gray-600">
                  {user
                    ? 'Subscribe to Groove Pass to access this book'
                    : 'Sign in and subscribe to read this book'}
                </p>
              </div>
              {user ? (
                <Link
                  href="/groove-pass"
                  className="btn-primary w-full text-center block text-base py-4"
                >
                  ⭐ Get Groove Pass – ₦2,500/mo
                </Link>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href={`/login?redirect=/books/${book.slug}`}
                    className="btn-secondary text-center text-sm py-3"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="btn-primary text-center text-sm py-3"
                  >
                    Sign Up Free
                  </Link>
                </div>
              )}
              {book.digitalPrice && (
                <p className="text-xs text-center text-gray-400">
                  or buy digital access for ₦{book.digitalPrice.toLocaleString()}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Physical buy */}
      {book.hasPhysical && book.physicalAvailable && book.price && (
        <div className="pt-2">
          <div className="flex items-center gap-3">
            <div className="flex-1 p-3 bg-white rounded-2xl border border-gray-200">
              <p className="text-xs text-gray-500">Physical Book</p>
              <p className="text-lg font-black text-brand-dark">₦{book.price.toLocaleString()}</p>
              <p className="text-xs text-gray-400">{book.physicalStock} in stock</p>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={inCart}
              className={`flex-1 py-4 rounded-2xl font-semibold text-sm transition-all ${
                inCart || addedToCart
                  ? 'bg-green-500 text-white cursor-default'
                  : 'btn-dark'
              }`}
            >
              {addedToCart ? '✓ Added!' : inCart ? '✓ In Cart' : '🛒 Add to Cart'}
            </button>
          </div>
          <Link
            href="/cart"
            className="block text-center text-xs text-brand-yellow-dark hover:text-brand-dark transition-colors mt-2 font-medium"
          >
            View Cart →
          </Link>
        </div>
      )}

      {book.hasPhysical && !book.physicalAvailable && (
        <div className="p-3 bg-gray-50 rounded-2xl text-center text-sm text-gray-500 border border-gray-200">
          Physical copy currently out of stock
        </div>
      )}
    </div>
  );
}
