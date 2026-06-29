'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/components/AuthProvider';

interface DashboardData {
  stats: { booksRead: number; booksInProgress: number; totalBookmarks: number; totalOrders: number };
  readingProgress: Array<{
    id: string; percentage: number; lastReadAt: string; completed: boolean;
    book: { id: string; title: string; slug: string; coverImage: string; author: string };
  }>;
  bookmarks: Array<{
    id: string; page?: number; note?: string; createdAt: string;
    book: { id: string; title: string; slug: string; coverImage: string; author: string };
  }>;
  recentOrders: Array<{
    id: string; orderNumber: string; status: string; total: number; createdAt: string;
    items: Array<{ book: { title: string; coverImage: string } }>;
    payment?: { status: string };
  }>;
  activeSubscription?: {
    id: string; status: string; planName: string; currentPeriodEnd: string;
  } | null;
}

const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-purple-100 text-purple-700',
  SHIPPED: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      fetch('/api/user/dashboard')
        .then((r) => r.json())
        .then((j) => { if (j.success) setData(j.data); })
        .finally(() => setLoading(false));
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="page-container py-10">
        <div className="animate-pulse space-y-6">
          <div className="skeleton h-10 w-64 rounded-2xl" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page-container py-20 text-center">
        <p className="text-5xl mb-4">🔐</p>
        <h2 className="font-display text-2xl font-black text-brand-dark mb-4">Sign in to access your dashboard</h2>
        <Link href="/login?redirect=/dashboard" className="btn-primary">Sign In</Link>
      </div>
    );
  }

  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="page-container py-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-gray-500 text-sm">{greeting},</p>
          <h1 className="font-display text-3xl font-black text-brand-dark">
            {user.firstName} {user.lastName} 👋
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <span className={`badge ${
              user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
              user.role === 'SUBSCRIBER' ? 'badge-yellow' : 'bg-gray-100 text-gray-600'
            }`}>
              {user.role === 'ADMIN' ? '👑 Admin' : user.role === 'SUBSCRIBER' ? '⭐ Groove Pass' : '📚 Free Reader'}
            </span>
          </div>
        </div>
        <Link href="/books" className="btn-primary hidden sm:inline-flex">
          📖 Read Now
        </Link>
      </div>

      {/* Subscription banner */}
      {!data?.activeSubscription && user.role !== 'ADMIN' && (
        <div className="mb-8 bg-brand-yellow rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-brand-dark text-sm">⭐ Upgrade to Groove Pass</p>
            <p className="text-brand-dark/70 text-xs mt-0.5">Unlock all premium books for just ₦2,500/month</p>
          </div>
          <Link href="/groove-pass" className="btn-dark text-sm flex-shrink-0">
            Get Groove Pass
          </Link>
        </div>
      )}

      {data?.activeSubscription && (
        <div className="mb-8 bg-green-50 border border-green-200 rounded-3xl p-5 flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-green-800 text-sm">⭐ Groove Pass Active</p>
            <p className="text-green-600 text-xs mt-0.5">
              Renews {new Date(data.activeSubscription.currentPeriodEnd).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <Link href="/dashboard/subscription" className="text-green-700 text-xs font-semibold hover:text-green-900 transition-colors">
            Manage →
          </Link>
        </div>
      )}

      {/* Stats */}
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Books Read', value: data.stats.booksRead, icon: '✅', color: 'bg-green-50 text-green-700' },
            { label: 'In Progress', value: data.stats.booksInProgress, icon: '📖', color: 'bg-blue-50 text-blue-700' },
            { label: 'Bookmarks', value: data.stats.totalBookmarks, icon: '🔖', color: 'bg-purple-50 text-purple-700' },
            { label: 'Orders', value: data.stats.totalOrders, icon: '📦', color: 'bg-orange-50 text-orange-700' },
          ].map((stat) => (
            <div key={stat.label} className="card p-5">
              <div className={`w-10 h-10 rounded-2xl ${stat.color} flex items-center justify-center text-lg mb-3`}>
                {stat.icon}
              </div>
              <div className="font-display text-3xl font-black text-brand-dark">{stat.value}</div>
              <div className="text-gray-500 text-sm mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Continue reading */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold text-brand-dark">Continue Reading</h2>
          </div>
          {(!data?.readingProgress || data.readingProgress.length === 0) ? (
            <div className="card p-8 text-center">
              <p className="text-4xl mb-3">📚</p>
              <p className="text-gray-500 text-sm mb-4">You haven't started any books yet</p>
              <Link href="/books?access=FREE" className="btn-primary text-sm py-2.5">Start Reading</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {data.readingProgress.slice(0, 5).map((rp) => (
                <Link key={rp.id} href={`/books/${rp.book.slug}`} className="flex gap-3 p-3 bg-white rounded-2xl shadow-soft hover:shadow-soft-lg transition-all group">
                  <div className="relative w-12 h-16 rounded-xl overflow-hidden flex-shrink-0">
                    <Image src={rp.book.coverImage} alt={rp.book.title} fill className="object-cover" sizes="48px" />
                  </div>
                  <div className="flex-1 min-w-0 py-0.5">
                    <p className="font-semibold text-sm text-brand-dark truncate group-hover:text-brand-yellow-dark transition-colors">
                      {rp.book.title}
                    </p>
                    <p className="text-xs text-gray-400">{rp.book.author}</p>
                    <div className="mt-2 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-brand-yellow rounded-full transition-all"
                        style={{ width: `${Math.min(rp.percentage, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{Math.round(rp.percentage)}% complete</p>
                  </div>
                  {rp.completed && (
                    <span className="text-green-500 text-sm flex-shrink-0 self-center">✓</span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Recent orders */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold text-brand-dark">Recent Orders</h2>
            <Link href="/dashboard/orders" className="text-sm text-brand-yellow-dark font-semibold hover:text-brand-dark transition-colors">
              View all →
            </Link>
          </div>
          {(!data?.recentOrders || data.recentOrders.length === 0) ? (
            <div className="card p-8 text-center">
              <p className="text-4xl mb-3">🛒</p>
              <p className="text-gray-500 text-sm mb-4">No orders yet</p>
              <Link href="/shop" className="btn-primary text-sm py-2.5">Browse Shop</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {data.recentOrders.map((order) => (
                <div key={order.id} className="card p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="text-xs text-gray-400">Order #{order.orderNumber.slice(-8).toUpperCase()}</p>
                      <p className="font-bold text-brand-dark">₦{order.total.toLocaleString()}</p>
                    </div>
                    <span className={`badge text-xs ${ORDER_STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    {order.items.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="relative w-10 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <Image src={item.book.coverImage} alt={item.book.title} fill className="object-cover" sizes="40px" />
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="w-10 h-14 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                        +{order.items.length - 3}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(order.createdAt).toLocaleDateString('en-NG')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
