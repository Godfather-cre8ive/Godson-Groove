'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/components/CartProvider';

interface Book {
  id: string; slug: string; title: string; author: string; coverImage: string; price: number;
}

export default function AddToCartButton({ book }: { book: Book }) {
  const { addItem, isInCart } = useCart();
  const [added, setAdded] = useState(false);
  const inCart = isInCart(book.id);

  const handleAdd = () => {
    addItem({
      bookId: book.id, slug: book.slug, title: book.title,
      author: book.author, coverImage: book.coverImage, price: book.price,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  if (inCart) {
    return (
      <Link href="/cart" className="btn-dark w-full text-center block text-sm py-3">
        🛒 View Cart
      </Link>
    );
  }

  return (
    <button
      onClick={handleAdd}
      className={`w-full py-3 rounded-2xl font-semibold text-sm transition-all ${
        added ? 'bg-green-500 text-white' : 'btn-primary'
      }`}
    >
      {added ? '✓ Added to Cart!' : '🛒 Add to Cart'}
    </button>
  );
}
