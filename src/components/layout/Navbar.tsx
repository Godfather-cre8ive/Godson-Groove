'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { useCart } from '@/components/CartProvider';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout, loading } = useAuth();
  const { totalItems } = useCart();
  const pathname = usePathname();

  const navLinks = [
    { href: '/books', label: 'Books' },
    { href: '/series', label: 'Story Worlds' },
    { href: '/shop', label: 'Shop' },
    { href: '/search', label: 'Search' },
  ];

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-brand-yellow/20 shadow-sm">
      <nav className="page-container">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <Image
              src="/images/logoyellow.png"
              alt="Godson Groove"
              width={140}
              height={48}
              className="h-10 w-auto"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive(link.href)
                    ? 'bg-brand-yellow text-brand-dark'
                    : 'text-gray-600 hover:bg-brand-yellow-pale hover:text-brand-dark'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 rounded-xl hover:bg-brand-yellow-pale transition-colors"
              aria-label="Cart"
            >
              <CartIcon />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-yellow text-brand-dark text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>

            {/* Auth */}
            {!loading && (
              <>
                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-brand-yellow-pale transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-brand-yellow flex items-center justify-center text-brand-dark font-bold text-sm">
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      <span className="hidden sm:block text-sm font-medium text-brand-charcoal">
                        {user.firstName}
                      </span>
                      <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                    </button>

                    {userMenuOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setUserMenuOpen(false)}
                        />
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-soft-lg border border-gray-100 py-2 z-20">
                          <div className="px-4 py-3 border-b border-gray-100">
                            <p className="text-sm font-semibold text-brand-dark">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                            <span className="badge-yellow mt-1.5">
                              {user.role === 'ADMIN' ? '👑 Admin' : user.role === 'SUBSCRIBER' ? '⭐ Groove Pass' : '📚 Free Reader'}
                            </span>
                          </div>
                          <Link
                            href="/dashboard"
                            className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-brand-yellow-pale transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            My Dashboard
                          </Link>
                          <Link
                            href="/dashboard/orders"
                            className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-brand-yellow-pale transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            My Orders
                          </Link>
                          {user.role === 'ADMIN' && (
                            <Link
                              href="/admin"
                              className="block px-4 py-2.5 text-sm text-brand-yellow-dark font-semibold hover:bg-brand-yellow-pale transition-colors"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              Admin Dashboard
                            </Link>
                          )}
                          <div className="border-t border-gray-100 mt-1 pt-1">
                            <button
                              onClick={() => { setUserMenuOpen(false); logout(); }}
                              className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                              Sign Out
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="hidden sm:flex items-center gap-2">
                    <Link href="/login" className="btn-ghost text-sm py-2">
                      Sign In
                    </Link>
                    <Link href="/register" className="btn-primary text-sm py-2.5 px-5">
                      Get Started
                    </Link>
                  </div>
                )}
              </>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-brand-yellow-pale transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <XIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 space-y-1 animate-fade-in">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive(link.href)
                    ? 'bg-brand-yellow text-brand-dark'
                    : 'text-gray-600 hover:bg-brand-yellow-pale'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {!user && (
              <div className="pt-2 flex gap-2 px-1">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 btn-secondary text-center text-sm py-2.5"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 btn-primary text-center text-sm py-2.5"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}

function CartIcon() {
  return (
    <svg className="w-6 h-6 text-brand-charcoal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg className="w-6 h-6 text-brand-charcoal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="w-6 h-6 text-brand-charcoal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}
