'use client';

import { useAuth } from '@/components/AuthProvider';
import { usePathname } from 'next/navigation';

const TITLES: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/books': 'Books',
  '/admin/series': 'Story Worlds',
  '/admin/categories': 'Categories',
  '/admin/orders': 'Orders',
  '/admin/users': 'Users',
  '/admin/subscriptions': 'Subscriptions',
  '/admin/banners': 'Homepage Banners',
  '/admin/analytics': 'Analytics',
  '/admin/campaigns': 'Campaigns',
};

export default function AdminHeader() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const title = Object.entries(TITLES)
    .filter(([k]) => pathname.startsWith(k))
    .sort((a, b) => b[0].length - a[0].length)[0]?.[1] || 'Admin';

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="font-display text-xl font-bold text-brand-dark">{title}</h1>
        <p className="text-xs text-gray-400 mt-0.5">Godson Groove Admin</p>
      </div>
      {user && (
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-brand-dark">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-brand-yellow-dark font-medium">👑 Administrator</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-brand-yellow flex items-center justify-center font-black text-brand-dark text-sm">
            {user.firstName[0]}{user.lastName[0]}
          </div>
          <button
            onClick={logout}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors font-medium"
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
}
