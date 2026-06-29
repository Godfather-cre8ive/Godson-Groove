import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import BookCarousel from '@/components/books/BookCarousel';

async function getHomepageData() {
  const [freeBooks, premiumBooks, newReleases, popularBooks, series, categories, banners] =
    await Promise.all([
      prisma.book.findMany({
        where: { published: true, access: 'FREE' },
        take: 12,
        orderBy: { createdAt: 'desc' },
        include: { series: { select: { title: true, slug: true } } },
      }),
      prisma.book.findMany({
        where: { published: true, access: 'PREMIUM' },
        take: 12,
        orderBy: { createdAt: 'desc' },
        include: { series: { select: { title: true, slug: true } } },
      }),
      prisma.book.findMany({
        where: { published: true, newRelease: true },
        take: 12,
        orderBy: { createdAt: 'desc' },
        include: { series: { select: { title: true, slug: true } } },
      }),
      prisma.book.findMany({
        where: { published: true, popular: true },
        take: 12,
        orderBy: { createdAt: 'desc' },
        include: { series: { select: { title: true, slug: true } } },
      }),
      prisma.series.findMany({
        where: { published: true },
        take: 6,
        orderBy: { order: 'asc' },
        include: {
          books: {
            where: { published: true },
            take: 1,
            select: { coverImage: true },
          },
          _count: { select: { books: true } },
        },
      }),
      prisma.category.findMany({
        orderBy: { order: 'asc' },
        include: { _count: { select: { books: true } } },
      }),
      prisma.homepageBanner.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
        take: 3,
      }),
    ]);

  return { freeBooks, premiumBooks, newReleases, popularBooks, series, categories, banners };
}

export default async function HomePage() {
  const { freeBooks, premiumBooks, newReleases, popularBooks, series, categories } =
    await getHomepageData();

  return (
    <div className="min-h-screen">
      {/* ── Hero ── */}
      <section className="relative bg-brand-dark overflow-hidden">
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 50%, #F5C842 0%, transparent 50%), 
                              radial-gradient(circle at 75% 20%, #F5C842 0%, transparent 40%)`,
          }}
        />

        <div className="page-container py-16 md:py-24 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Text */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-brand-yellow/15 border border-brand-yellow/30 text-brand-yellow text-xs font-semibold px-4 py-2 rounded-full mb-6">
                <span>✨</span> Oiling imaginations through storytelling
              </div>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
                Where Stories{' '}
                <span className="gradient-text">Come Alive</span>
              </h1>
              <p className="text-gray-400 text-lg leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
                Dive into magical story worlds that spark creativity, build vocabulary, and turn
                children into lifelong readers. Hundreds of books, one subscription.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link href="/books?access=FREE" className="btn-primary text-base px-8 py-4">
                  📚 Start Reading Free
                </Link>
                <Link href="/groove-pass" className="btn-secondary text-base px-8 py-4 border-brand-yellow/40 text-gray-300 hover:text-brand-dark">
                  ⭐ Get Groove Pass
                </Link>
              </div>
              <div className="flex items-center gap-6 mt-10 justify-center lg:justify-start">
                <Stat value="500+" label="Stories" />
                <div className="w-px h-10 bg-white/10" />
                <Stat value="50K+" label="Young Readers" />
                <div className="w-px h-10 bg-white/10" />
                <Stat value="12+" label="Story Worlds" />
              </div>
            </div>

            {/* Hero visual */}
            <div className="flex-shrink-0 relative">
              <div className="relative w-72 h-72 md:w-96 md:h-96">
                {/* Glow */}
                <div className="absolute inset-0 bg-brand-yellow/20 rounded-full blur-3xl" />
                <Image
                  src="/images/faviconyellow.png"
                  alt="Godson Groove"
                  fill
                  className="object-contain relative z-10 drop-shadow-2xl"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Category Pills ── */}
      {categories.length > 0 && (
        <section className="py-8 bg-white border-b border-gray-100">
          <div className="page-container">
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              <Link
                href="/books"
                className="flex-shrink-0 px-5 py-2.5 rounded-full bg-brand-yellow text-brand-dark text-sm font-semibold transition-all hover:shadow-brand"
              >
                All Books
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/books?category=${cat.slug}`}
                  className="flex-shrink-0 px-5 py-2.5 rounded-full bg-gray-100 text-gray-700 text-sm font-medium hover:bg-brand-yellow-pale hover:text-brand-dark transition-all"
                >
                  {cat.icon && <span className="mr-1.5">{cat.icon}</span>}
                  {cat.name}
                  <span className="ml-1.5 text-xs text-gray-400">({cat._count.books})</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Main content ── */}
      <div className="page-container py-12 space-y-16">
        {/* Free Books */}
        {freeBooks.length > 0 && (
          <BookCarousel
            title="📖 Free to Read"
            books={freeBooks}
            viewAllHref="/books?access=FREE"
          />
        )}

        {/* Groove Pass CTA */}
        <section className="relative bg-brand-yellow rounded-4xl overflow-hidden p-8 md:p-12">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-black text-brand-dark mb-3">
                Unlock All Premium Stories
              </h2>
              <p className="text-brand-dark/70 text-lg max-w-lg">
                Get unlimited access to our entire library of premium books with Groove Pass —
                just ₦2,500/month.
              </p>
              <ul className="mt-4 space-y-2">
                {['All premium books included', 'New stories every month', 'Read on any device', 'Cancel anytime'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-brand-dark/80 text-sm font-medium">
                    <span className="text-brand-dark">✓</span> {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-center flex-shrink-0">
              <div className="text-5xl font-black text-brand-dark">₦2,500</div>
              <div className="text-brand-dark/70 text-sm mb-4">per month</div>
              <Link href="/groove-pass" className="btn-dark text-base px-10 py-4 block text-center">
                Get Groove Pass ⭐
              </Link>
            </div>
          </div>
        </section>

        {/* New Releases */}
        {newReleases.length > 0 && (
          <BookCarousel
            title="🆕 New Releases"
            books={newReleases}
            viewAllHref="/books?new=true"
          />
        )}

        {/* Story Worlds (Series) */}
        {series.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="section-title">🌍 Story Worlds</h2>
              <Link
                href="/series"
                className="text-sm font-semibold text-brand-yellow-dark hover:text-brand-dark transition-colors flex items-center gap-1"
              >
                View all
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {series.map((s) => (
                <Link
                  key={s.id}
                  href={`/series/${s.slug}`}
                  className="group card-hover p-4 text-center"
                >
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-yellow-pale flex items-center justify-center mb-3 group-hover:bg-brand-yellow transition-colors overflow-hidden relative">
                    {s.books[0]?.coverImage ? (
                      <Image
                        src={s.books[0].coverImage}
                        alt={s.title}
                        fill
                        className="object-cover rounded-2xl"
                      />
                    ) : (
                      <span className="text-2xl">📚</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-xs text-brand-dark line-clamp-2 leading-tight">
                    {s.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">{s._count.books} books</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Popular Books */}
        {popularBooks.length > 0 && (
          <BookCarousel
            title="🔥 Popular Stories"
            books={popularBooks}
            viewAllHref="/books?popular=true"
          />
        )}

        {/* Premium Books */}
        {premiumBooks.length > 0 && (
          <BookCarousel
            title="⭐ Premium Collection"
            books={premiumBooks}
            viewAllHref="/books?access=PREMIUM"
          />
        )}

        {/* Values section */}
        <section className="bg-brand-dark rounded-4xl p-10 md:p-16">
          <h2 className="font-display text-3xl font-black text-white text-center mb-3">
            Why Godson Groove?
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Every story is crafted to spark imagination and build real skills.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '🎨', title: 'Sparks Creativity', desc: 'Rich illustrations and immersive worlds ignite imagination in every child.' },
              { icon: '🧠', title: 'Builds Focus', desc: 'Engaging narratives develop attention spans and deep reading habits.' },
              { icon: '🔍', title: 'Detail Oriented', desc: 'Stories that reward careful reading and teach observation skills.' },
              { icon: '📝', title: 'Grows Vocabulary', desc: 'Age-appropriate language that naturally expands grammar and word power.' },
            ].map((v) => (
              <div key={v.title} className="bg-white/5 rounded-3xl p-6 text-center hover:bg-brand-yellow/10 transition-colors">
                <div className="text-4xl mb-4">{v.icon}</div>
                <h3 className="font-display font-bold text-white text-lg mb-2">{v.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="font-display text-2xl font-black text-brand-yellow">{value}</div>
      <div className="text-gray-500 text-xs mt-0.5">{label}</div>
    </div>
  );
}
