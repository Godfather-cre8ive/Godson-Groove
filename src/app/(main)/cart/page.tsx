'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/components/CartProvider';
import { useAuth } from '@/components/AuthProvider';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { items, totalItems, totalPrice, removeItem, updateQuantity, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheckout = async () => {
    if (!user) { router.push('/login?redirect=/cart'); return; }
    if (items.length === 0) return;
    setLoading(true);
    setError('');

    try {
      // Create order
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: items.map((i) => ({ bookId: i.bookId, quantity: i.quantity })) }),
      });
      const orderJson = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderJson.error || 'Failed to create order');

      const orderId = orderJson.data.id;

      // Initialize payment
      const payRes = await fetch('/api/payments/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'order', orderId }),
      });
      const payJson = await payRes.json();
      if (!payRes.ok) throw new Error(payJson.error || 'Failed to initialize payment');

      clearCart();
      window.location.href = payJson.data.authorization_url;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  if (totalItems === 0) {
    return (
      <div className="page-container py-20 text-center">
        <p className="text-6xl mb-6">🛒</p>
        <h1 className="font-display text-3xl font-black text-brand-dark mb-3">Your cart is empty</h1>
        <p className="text-gray-500 mb-8">Add some books to your cart to get started</p>
        <Link href="/shop" className="btn-primary text-base px-10 py-4">Browse Books</Link>
      </div>
    );
  }

  const shipping = 1500;
  const grandTotal = totalPrice + shipping;

  return (
    <div className="page-container py-10">
      <h1 className="font-display text-3xl font-black text-brand-dark mb-8">
        🛒 Your Cart <span className="text-gray-400 font-normal text-xl">({totalItems} item{totalItems !== 1 ? 's' : ''})</span>
      </h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm">
          ⚠️ {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.bookId} className="card p-4 flex gap-4">
              <div className="relative w-20 rounded-xl overflow-hidden flex-shrink-0 bg-brand-yellow-pale" style={{ aspectRatio: '2/3' }}>
                <Image src={item.coverImage} alt={item.title} fill className="object-cover" sizes="80px" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-bold text-brand-dark text-sm leading-tight">{item.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5 mb-3">{item.author}</p>
                <div className="flex items-center gap-3">
                  {/* Quantity */}
                  <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                    <button
                      onClick={() => updateQuantity(item.bookId, item.quantity - 1)}
                      className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center text-brand-dark font-bold hover:bg-brand-yellow transition-colors text-sm"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.bookId, item.quantity + 1)}
                      className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center text-brand-dark font-bold hover:bg-brand-yellow transition-colors text-sm"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.bookId)}
                    className="text-xs text-red-400 hover:text-red-600 transition-colors font-medium"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-brand-dark">₦{(item.price * item.quantity).toLocaleString()}</p>
                {item.quantity > 1 && (
                  <p className="text-xs text-gray-400">₦{item.price.toLocaleString()} each</p>
                )}
              </div>
            </div>
          ))}

          <button onClick={clearCart} className="text-sm text-red-400 hover:text-red-600 transition-colors font-medium">
            Clear cart
          </button>
        </div>

        {/* Summary */}
        <div>
          <div className="card p-6 sticky top-24">
            <h2 className="font-display text-xl font-bold text-brand-dark mb-5">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">₦{totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-semibold">₦{shipping.toLocaleString()}</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between">
                <span className="font-bold text-brand-dark">Total</span>
                <span className="font-black text-brand-dark text-lg">₦{grandTotal.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="btn-primary w-full mt-6 py-4 text-base disabled:opacity-70"
            >
              {loading ? '⏳ Processing...' : user ? '💳 Proceed to Payment' : '🔐 Sign In to Checkout'}
            </button>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-400">🔒 Secured by Paystack</p>
            </div>

            <Link href="/shop" className="block text-center text-sm text-brand-yellow-dark hover:text-brand-dark transition-colors mt-4 font-medium">
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
