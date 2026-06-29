import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import AddToCartButton from './AddToCartButton';

export const metadata = { title: 'Shop – Physical Books' };

async function getShopBooks() {
  return prisma.book.findMany({
    where: {
      published: true,
      bookType: { in: ['PHYSICAL', 'BOTH'] },
      physicalProduct: { isAvailable: true },
    },
    orderBy: { createdAt: 'desc' },
    include: {
      physicalProduct: { select: { id: true, price: true, stockCount: true, isAvailable: true } },
      categories: { include: { category: { select: { name: true, slug: true } } } },
      series: { select: { title: true, slug: true } },
    },
  });
}

export default async function ShopPage() {
  const books = await getShopBooks();

  return (
    <div className="page-container py-10">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-display text-4xl font-black text-brand-dark mb-2">📦 Shop</h1>
        <p className="text-gray-500 text-lg">Physical books and activity books, delivered across Nigeria.</p>
      </div>

      {/* Shipping banner */}
      <div className="bg-brand-yellow/10 border border-brand-yellow/30 rounded-3xl p-5 mb-10 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-3 flex-1">
          <span className="text-3xl">🚚</span>
          <div>
            <p className="font-semibold text-brand-dark">Nigeria-wide Delivery</p>
            <p className="text-sm text-gray-600">Flat ₦1,500 shipping fee · 3–7 business days</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-3xl">🔒</span>
          <div>
            <p className="font-semibold text-brand-dark">Secure Payments</p>
            <p className="text-sm text-gray-600">Paystack · Card · Bank Transfer · USSD</p>
          </div>
        </div>
      </div>

      {books.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-5xl mb-4">📦</p>
          <h3 className="font-display text-xl font-bold text-brand-dark mb-2">Shop coming soon!</h3>
          <p className="text-gray-500 mb-6">Physical books will be available here shortly.</p>
          <Link href="/books" className="btn-primary">Browse Digital Books</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {books.map((book) => (
            <div key={book.id} className="card group flex flex-col">
              {/* Cover */}
              <Link href={`/books/${book.slug}`} className="block">
                <div className="relative bg-brand-yellow-pale overflow-hidden" style={{ aspectRatio: '3/4' }}>
                  <Image
                    src={book.coverImage}
                    alt={book.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  {book.physicalProduct && book.physicalProduct.stockCount <= 5 && book.physicalProduct.stockCount > 0 && (
                    <div className="absolute top-3 right-3 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                      Only {book.physicalProduct.stockCount} left!
                    </div>
                  )}
                </div>
              </Link>

              {/* Info */}
              <div className="p-5 flex-1 flex flex-col">
                {book.series && (
                  <Link href={`/series/${book.series.slug}`} className="text-xs text-brand-yellow-dark font-semibold mb-1 hover:text-brand-dark transition-colors truncate block">
                    {book.series.title}
                  </Link>
                )}
                <Link href={`/books/${book.slug}`}>
                  <h3 className="font-display font-bold text-brand-dark text-lg leading-tight mb-1 group-hover:text-brand-yellow-dark transition-colors">
                    {book.title}
                  </h3>
                </Link>
                <p className="text-sm text-gray-500 mb-3">by {book.author}</p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {book.categories.slice(0, 2).map((bc) => (
                    <span key={bc.category.slug} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                      {bc.category.name}
                    </span>
                  ))}
                </div>

                <div className="mt-auto">
                  {book.physicalProduct && (
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-black text-brand-dark text-2xl">
                        ₦{book.physicalProduct.price.toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-400">{book.physicalProduct.stockCount} in stock</span>
                    </div>
                  )}
                  <AddToCartButton
                    book={{
                      id: book.id,
                      slug: book.slug,
                      title: book.title,
                      author: book.author,
                      coverImage: book.coverImage,
                      price: book.physicalProduct?.price || 0,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
