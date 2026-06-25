'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-yellow flex-col items-center justify-center p-12">
        <Image src="/images/logowhite.png" alt="Godson Groove" width={200} height={70} className="mx-auto mb-10" />
        <h2 className="font-display text-3xl font-black text-brand-dark text-center mb-4">
          Join the Story Universe
        </h2>
        <p className="text-brand-dark/70 text-center max-w-sm">
          Create a free account and start reading today. Hundreds of stories, zero cost to begin.
        </p>
        <div className="mt-10 grid grid-cols-2 gap-4 w-full max-w-sm">
          {[
            { icon: '📖', text: 'Free books, no card needed' },
            { icon: '🌍', text: 'Explore Story Worlds' },
            { icon: '🔖', text: 'Save bookmarks & progress' },
            { icon: '⭐', text: 'Upgrade to Groove Pass anytime' },
          ].map((item) => (
            <div key={item.text} className="bg-brand-dark/10 rounded-2xl p-4 text-sm font-medium text-brand-dark">
              <span className="text-xl block mb-1">{item.icon}</span>
              {item.text}
            </div>
          ))}
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-brand-cream overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <div className="lg:hidden text-center mb-8">
            <Image src="/images/logoyellow.png" alt="Godson Groove" width={160} height={56} className="mx-auto" />
          </div>

          <div className="card p-8">
            <h1 className="font-display text-2xl font-black text-brand-dark mb-1">Create Account</h1>
            <p className="text-gray-500 text-sm mb-6">
              Already have an account?{' '}
              <Link href="/login" className="text-brand-yellow-dark font-semibold hover:text-brand-dark transition-colors">
                Sign in
              </Link>
            </p>

            {error && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">First Name</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Ade"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="label">Last Name</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Bello"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Email address</label>
                <input
                  type="email"
                  className="input"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="label">Phone (optional)</label>
                <input
                  type="tel"
                  className="input"
                  placeholder="+234 800 000 0000"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    className="input pr-12"
                    placeholder="Min. 8 characters"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPw ? '🙈' : '👁️'}
                  </button>
                </div>
                {form.password && (
                  <div className="mt-1.5 flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          form.password.length >= i * 3
                            ? i <= 1 ? 'bg-red-400' : i <= 2 ? 'bg-orange-400' : i <= 3 ? 'bg-yellow-400' : 'bg-green-400'
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-4 text-base mt-2 disabled:opacity-70"
              >
                {loading ? '⏳ Creating account...' : '🚀 Create Free Account'}
              </button>
            </form>

            <p className="mt-5 text-xs text-gray-400 text-center">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="underline hover:text-brand-dark">Terms</Link>
              {' '}and{' '}
              <Link href="/privacy" className="underline hover:text-brand-dark">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
