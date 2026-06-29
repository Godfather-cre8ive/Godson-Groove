'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';

export default function GroovePassPage() {
  const { user, isSubscriber } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async () => {
    if (!user) {
      router.push('/login?redirect=/groove-pass');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Initialize Paystack payment
      const initRes = await fetch('/api/payments/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'subscription' }),
      });
      const initJson = await initRes.json();
      if (!initRes.ok) throw new Error(initJson.error || 'Failed to initialize payment');

      // Redirect to Paystack
      window.location.href = initJson.data.authorization_url;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: '📚', title: 'Unlimited Premium Books', desc: 'Access our entire library of premium stories — hundreds of books, all included.' },
    { icon: '🆕', title: 'New Stories Every Month', desc: 'Fresh titles added regularly to keep young readers excited.' },
    { icon: '📱', title: 'Read on Any Device', desc: 'Seamlessly switch between phone, tablet, and desktop.' },
    { icon: '🔖', title: 'Bookmarks & Progress', desc: 'Save your place and track reading milestones across all books.' },
    { icon: '🌍', title: 'All Story Worlds', desc: 'Explore every series and universe in full — no restrictions.' },
    { icon: '❌', title: 'Cancel Anytime', desc: 'No lock-in. Manage your subscription from your dashboard.' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-brand-dark py-20 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 70% 40%, #F5C842 0%, transparent 60%)' }}
        />
        <div className="page-container relative z-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-brand-yellow/15 border border-brand-yellow/30 text-brand-yellow text-sm font-semibold px-5 py-2 rounded-full mb-6">
            ⭐ Groove Pass
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-black text-white mb-5">
            Unlimited Stories.<br />
            <span className="gradient-text">One Simple Plan.</span>
          </h1>
          <p className="text-gray-400 text-lg mb-10">
            Subscribe to Groove Pass and unlock every premium book, story world, and new release
            on Godson Groove — for the whole family.
          </p>

          {isSubscriber ? (
            <div className="inline-flex flex-col items-center gap-3">
              <div className="bg-green-500/20 border border-green-500/30 text-green-400 px-6 py-3 rounded-2xl font-semibold">
                ✓ You have an active Groove Pass!
              </div>
              <Link href="/books?access=PREMIUM" className="btn-primary px-10 py-4 text-lg">
                Browse Premium Books →
              </Link>
            </div>
          ) : (
            <div>
              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 text-red-400 rounded-2xl text-sm">
                  {error}
                </div>
              )}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 inline-block mb-6">
                <div className="flex items-end justify-center gap-2 mb-2">
                  <span className="font-display text-5xl font-black text-white">₦2,500</span>
                  <span className="text-gray-400 pb-2">/month</span>
                </div>
                <p className="text-gray-500 text-sm">Billed monthly · Cancel anytime</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleSubscribe}
                  disabled={loading}
                  className="btn-primary text-xl px-12 py-5 disabled:opacity-70"
                >
                  {loading ? '⏳ Redirecting...' : '⭐ Start Groove Pass'}
                </button>
                {!user && (
                  <Link href="/books?access=FREE" className="btn-secondary text-xl px-12 py-5 border-brand-yellow/40 text-gray-400 hover:text-brand-dark">
                    Try Free Books First
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features grid */}
      <section className="page-container py-16">
        <h2 className="section-title text-center mb-10">Everything Included</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="card p-6 hover:shadow-soft-lg transition-shadow">
              <span className="text-3xl mb-4 block">{f.icon}</span>
              <h3 className="font-display font-bold text-brand-dark text-lg mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="page-container pb-16 max-w-3xl mx-auto">
        <h2 className="section-title text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            {
              q: 'What is Groove Pass?',
              a: 'Groove Pass is a monthly subscription that gives you unlimited access to all premium books on Godson Groove. For ₦2,500/month, your whole family can read every story in our library.',
            },
            {
              q: 'Can I cancel anytime?',
              a: 'Yes! You can cancel your Groove Pass at any time from your dashboard. Your access continues until the end of your billing period.',
            },
            {
              q: 'How do I pay?',
              a: 'We use Paystack for secure payments in Nigeria. You can pay with your debit card, bank transfer, USSD, or mobile money.',
            },
            {
              q: 'Does Groove Pass cover physical books?',
              a: 'No — Groove Pass covers digital reading only. Physical books are available for purchase separately in our Shop.',
            },
            {
              q: 'How many children can use one account?',
              a: 'One Groove Pass account can be used by the whole family on any number of devices. Reading progress is tracked per logged-in account.',
            },
          ].map((faq) => (
            <details
              key={faq.q}
              className="group bg-white rounded-2xl shadow-soft overflow-hidden"
            >
              <summary className="flex items-center justify-between p-5 cursor-pointer font-semibold text-brand-dark hover:bg-brand-yellow-pale transition-colors select-none">
                {faq.q}
                <svg
                  className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-5 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* CTA bottom */}
      {!isSubscriber && (
        <section className="bg-brand-yellow py-16">
          <div className="page-container text-center">
            <h2 className="font-display text-3xl font-black text-brand-dark mb-4">
              Ready to start the adventure?
            </h2>
            <p className="text-brand-dark/70 mb-8 text-lg">
              Join thousands of young readers on Godson Groove today.
            </p>
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="btn-dark text-xl px-12 py-5 disabled:opacity-70"
            >
              {loading ? '⏳ Please wait...' : '⭐ Get Groove Pass – ₦2,500/mo'}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
