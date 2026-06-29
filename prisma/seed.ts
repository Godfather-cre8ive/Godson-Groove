import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123456', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@godsongroove.com' },
    update: {},
    create: {
      email: 'admin@godsongroove.com',
      firstName: 'Admin',
      lastName: 'User',
      passwordHash: adminPassword,
      role: 'ADMIN',
      emailVerified: true,
    },
  });
  console.log('✅ Admin user:', admin.email);

  // Test reader user
  const readerPassword = await bcrypt.hash('reader123456', 12);
  const reader = await prisma.user.upsert({
    where: { email: 'reader@godsongroove.com' },
    update: {},
    create: {
      email: 'reader@godsongroove.com',
      firstName: 'Amara',
      lastName: 'Obi',
      passwordHash: readerPassword,
      role: 'FREE_USER',
      emailVerified: true,
    },
  });
  console.log('✅ Reader user:', reader.email);

  // Categories
  const categoryData = [
    { name: 'Adventure', slug: 'adventure', icon: '🗺️', color: '#F5C842', order: 1 },
    { name: 'Animals', slug: 'animals', icon: '🦁', color: '#10B981', order: 2 },
    { name: 'Family', slug: 'family', icon: '👨‍👩‍👧', color: '#6366F1', order: 3 },
    { name: 'Fantasy', slug: 'fantasy', icon: '🧙', color: '#8B5CF6', order: 4 },
    { name: 'African Stories', slug: 'african-stories', icon: '🌍', color: '#EF4444', order: 5 },
    { name: 'Activity Books', slug: 'activity-books', icon: '✏️', color: '#F59E0B', order: 6 },
    { name: 'Early Readers', slug: 'early-readers', icon: '📖', color: '#06B6D4', order: 7 },
    { name: 'Educational', slug: 'educational', icon: '🎓', color: '#84CC16', order: 8 },
  ];

  const categories: Record<string, { id: string }> = {};
  for (const cat of categoryData) {
    const c = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
    categories[cat.slug] = c;
  }
  console.log('✅ Categories created:', Object.keys(categories).length);

  // Series
  const seriesData = [
    { title: 'The Groove Chronicles', slug: 'groove-chronicles', description: 'Follow young heroes across magical African landscapes in this beloved series.', order: 1 },
    { title: 'Baobab Kids', slug: 'baobab-kids', description: 'Adventures under the great baobab tree, teaching values and courage.', order: 2 },
    { title: 'Little Lagos', slug: 'little-lagos', description: 'A vibrant city series celebrating Nigerian culture, food, and friendship.', order: 3 },
  ];

  const seriesMap: Record<string, { id: string }> = {};
  for (const s of seriesData) {
    const series = await prisma.series.upsert({
      where: { slug: s.slug },
      update: s,
      create: { ...s, published: true },
    });
    seriesMap[s.slug] = series;
  }
  console.log('✅ Series created:', Object.keys(seriesMap).length);

  // Sample Books
  const booksData = [
    {
      title: 'Zara and the Golden Drum',
      slug: 'zara-and-the-golden-drum',
      description: 'Young Zara discovers a magical golden drum that opens portals to the spirit world. On a quest to save her village, she must learn to listen before she can lead.',
      shortDescription: 'A magical adventure through the spirit world.',
      author: 'Adaeze Nwosu',
      coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
      ageMin: 6, ageMax: 10,
      pageCount: 48,
      tags: ['adventure', 'magic', 'africa', 'drums'],
      bookType: 'BOTH' as const,
      access: 'FREE' as const,
      price: 2500,
      featured: true, newRelease: false, popular: true,
      seriesSlug: 'groove-chronicles', seriesOrder: 1,
      categorySlug: 'african-stories',
      amazonLink: 'https://amazon.com',
      selarLink: 'https://selar.co',
    },
    {
      title: 'Kofi and the Talking Parrot',
      slug: 'kofi-and-the-talking-parrot',
      description: 'Kofi receives a most unusual gift: a parrot that can speak three languages. Together they embark on a journey across West Africa.',
      shortDescription: 'A hilarious multilingual parrot and a curious boy.',
      author: 'Kwame Asante',
      coverImage: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop',
      ageMin: 5, ageMax: 9,
      pageCount: 40,
      tags: ['animals', 'adventure', 'language', 'west-africa'],
      bookType: 'DIGITAL' as const,
      access: 'FREE' as const,
      featured: false, newRelease: true, popular: true,
      seriesSlug: 'baobab-kids', seriesOrder: 1,
      categorySlug: 'animals',
    },
    {
      title: 'Mama's Market Day',
      slug: 'mamas-market-day',
      description: 'On a bustling Saturday morning, Temi helps Mama at the market and learns the true value of hard work, counting, and community.',
      shortDescription: 'A heartwarming day at the market with Mama.',
      author: 'Funmi Adeyemi',
      coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop',
      ageMin: 4, ageMax: 8,
      pageCount: 32,
      tags: ['family', 'market', 'nigeria', 'counting'],
      bookType: 'BOTH' as const,
      access: 'PREMIUM' as const,
      price: 2000,
      featured: true, newRelease: true, popular: false,
      seriesSlug: 'little-lagos', seriesOrder: 1,
      categorySlug: 'family',
    },
    {
      title: 'The Dragon of Lagos Island',
      slug: 'dragon-of-lagos-island',
      description: 'A friendly dragon hidden beneath Lagos Island befriends children who discover her secret cave. But developers are coming and only imagination can save her.',
      shortDescription: 'A friendly dragon needs saving in modern Lagos.',
      author: 'Chinedu Okafor',
      coverImage: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400&h=600&fit=crop',
      ageMin: 7, ageMax: 12,
      pageCount: 64,
      tags: ['fantasy', 'dragon', 'lagos', 'environment'],
      bookType: 'DIGITAL' as const,
      access: 'PREMIUM' as const,
      featured: true, newRelease: false, popular: true,
      seriesSlug: 'little-lagos', seriesOrder: 2,
      categorySlug: 'fantasy',
    },
    {
      title: 'Baobab Activity Book: Numbers & Nature',
      slug: 'baobab-activity-book-numbers',
      description: 'A fun-packed activity book with counting games, nature puzzles, and drawing pages inspired by the African savannah.',
      shortDescription: 'Count, draw, and explore the African savannah!',
      author: 'Godson Groove Team',
      coverImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=600&fit=crop',
      ageMin: 3, ageMax: 7,
      pageCount: 56,
      tags: ['activity', 'numbers', 'nature', 'drawing'],
      bookType: 'PHYSICAL' as const,
      access: 'FREE' as const,
      price: 3000,
      featured: false, newRelease: true, popular: false,
      categorySlug: 'activity-books',
    },
    {
      title: 'Stars Over Sahara',
      slug: 'stars-over-sahara',
      description: 'A young girl named Amira and her grandfather navigate the Sahara by starlight, discovering stories written in the constellations.',
      shortDescription: 'Navigate the Sahara Desert with stars as your guide.',
      author: 'Fatima Al-Hassan',
      coverImage: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&h=600&fit=crop',
      ageMin: 8, ageMax: 13,
      pageCount: 72,
      tags: ['adventure', 'desert', 'stars', 'africa', 'grandparent'],
      bookType: 'BOTH' as const,
      access: 'PREMIUM' as const,
      price: 3500,
      featured: false, newRelease: false, popular: true,
      seriesSlug: 'groove-chronicles', seriesOrder: 2,
      categorySlug: 'adventure',
    },
  ];

  for (const bookData of booksData) {
    const { seriesSlug, seriesOrder, categorySlug, ...bookFields } = bookData;
    const seriesId = seriesSlug ? seriesMap[seriesSlug]?.id : undefined;
    const categoryId = categories[categorySlug]?.id;

    const book = await prisma.book.upsert({
      where: { slug: bookFields.slug },
      update: { ...bookFields, seriesId, seriesOrder },
      create: {
        ...bookFields,
        seriesId,
        seriesOrder,
        language: 'en',
        published: true,
        ...(categoryId && {
          categories: { create: [{ categoryId }] },
        }),
      },
    });

    // Create physical product for physical books
    if (['PHYSICAL', 'BOTH'].includes(bookFields.bookType) && bookFields.price) {
      await prisma.physicalProduct.upsert({
        where: { bookId: book.id },
        update: { price: bookFields.price, stockCount: 50, isAvailable: true },
        create: { bookId: book.id, price: bookFields.price, stockCount: 50, isAvailable: true },
      });
    }

    console.log('✅ Book:', book.title);
  }

  // Homepage banner
  await prisma.homepageBanner.upsert({
    where: { id: 'default-banner' },
    update: {},
    create: {
      id: 'default-banner',
      title: 'Oiling Imaginations',
      subtitle: 'Through the power of African storytelling',
      imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=1200&h=500&fit=crop',
      linkUrl: '/books',
      linkText: 'Explore Books',
      isActive: true,
      order: 1,
    },
  });

  console.log('\n🎉 Database seeded successfully!');
  console.log('───────────────────────────────');
  console.log('Admin: admin@godsongroove.com / admin123456');
  console.log('Reader: reader@godsongroove.com / reader123456');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
