'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

export default function LoginForm({ redirect }: { redirect: string }) {
  const { login } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      router.push(redirect);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-dark flex-col items-center justify-center p-12 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #F5C842 0%, transparent 70%)' }}
        />
        <div className="relative z-10 text-center">
          <Image src="/images/logoyellow.png" alt="Godson Groove" width={200} height={70} className="mx-auto mb-10" />
          <h2 className="font-display text-3xl font-black text-white mb-4">
            Welcome back, reader!
          </h2>
          <p className="text-gray-400 max-w-sm">
            Continue your storytelling journey. Hundreds of adventures are waiting for you.
          </p>
          <div className="flex justify-center gap-8 mt-12">
            {[['500+', 'Stories'], ['50K+', 'Readers'], ['12+', 'Worlds']].map(([v, l]) => (
              <div key={l} className="text-center">
                <div className="font-display text-2xl font-black text-brand-yellow">{v}</div>
                <div className="text-gray-500 text-xs mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-brand-cream">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Image src="/images/logoyellow.png" alt="Godson Groove" width={160} height={56} className="mx-auto" />
          </div>

          <div className="card p-8">
            <h1 className="font-display text-2xl font-black text-brand-dark mb-1">Sign In</h1>
            <p className="text-gray-500 text-sm mb-6">
              Don't have an account?{' '}
              <Link href="/register" className="text-brand-yellow-dark font-semibold hover:text-brand-dark transition-colors">
                Create one free
              </Link>
            </p>

            {error && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm flex items-start gap-2">
                <span className="mt-0.5">⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
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
                <div className="flex items-center justify-between mb-1.5">
                  <label className="label mb-0">Password</label>
                  <Link href="/forgot-password" className="text-xs text-brand-yellow-dark hover:text-brand-dark transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    className="input pr-12"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPw ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-4 text-base mt-2 disabled:opacity-70"
              >
                {loading ? '⏳ Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400">
                By signing in, you agree to our{' '}
                <Link href="/terms" className="underline hover:text-brand-dark">Terms</Link>
                {' '}and{' '}
                <Link href="/privacy" className="underline hover:text-brand-dark">Privacy Policy</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
      }
