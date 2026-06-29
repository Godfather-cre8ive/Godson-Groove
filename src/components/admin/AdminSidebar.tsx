'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: '📊', exact: true },
  { href: '/admin/books', label: 'Books', icon: '📚' },
  { href: '/admin/series', label: 'Story Worlds', icon: '🌍' },
  { href: '/admin/categories', label: 'Categories', icon: '🏷️' },
  { href: '/admin/orders', label: 'Orders', icon: '📦' },
  { href: '/admin/users', label: 'Users', icon: '👥' },
  { href: '/admin/subscriptions', label: 'Subscriptions', icon: '⭐' },
  { href: '/admin/banners', label: 'Banners', icon: '🖼️' },
  { href: '/admin/analytics', label: 'Analytics', icon: '📈' },
  { href: '/admin/campaigns', label: 'Campaigns', icon: '🎯' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <aside
      className={`${collapsed ? 'w-16' : 'w-64'} bg-brand-dark flex flex-col transition-all duration-200 flex-shrink-0 hidden md:flex`}
    >
      {/* Logo */}
      <div className={`p-4 border-b border-white/10 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && (
          <Link href="/admin">
            <Image src="/images/logowhite.png" alt="Godson Groove" width={120} height={42} className="h-8 w-auto" />
          </Link>
        )}
        {collapsed && (
          <Link href="/admin">
            <Image src="/images/faviconwhite.png" alt="GG" width={32} height={32} className="h-8 w-8" />
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            title={collapsed ? item.label : undefined}
            className={`admin-nav-item ${isActive(item.href, item.exact) ? 'active' : 'text-gray-400 hover:text-white hover:bg-white/10'} ${collapsed ? 'justify-center px-2' : ''}`}
          >
            <span className="text-lg flex-shrink-0">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className={`p-3 border-t border-white/10`}>
        <Link
          href="/"
          className={`admin-nav-item text-gray-400 hover:text-white hover:bg-white/10 ${collapsed ? 'justify-center px-2' : ''}`}
          title={collapsed ? 'View Site' : undefined}
        >
          <span>🌐</span>
          {!collapsed && <span>View Site</span>}
        </Link>
      </div>
    </aside>
  );
}
