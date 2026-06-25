# 🎵 Godson Groove

**Oiling imaginations through storytelling**

A production-ready children's storytelling SaaS platform built with Next.js, Prisma, PostgreSQL, and Paystack.

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + Tailwind CSS |
| Backend | Next.js API Routes (Node.js) |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT (access + refresh tokens) with HttpOnly cookies |
| Payments | Paystack (primary) + Stripe abstraction layer |
| Storage | AWS S3 / Cloudflare R2 (S3-compatible) |
| Hosting | Vercel (recommended) |

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites

- Node.js 18+
- Docker (for local PostgreSQL) OR a cloud Postgres URL
- AWS S3 bucket OR Cloudflare R2 bucket

### 2. Clone & Install

```bash
git clone https://github.com/your-org/godson-groove.git
cd godson-groove
npm install
```

### 3. Environment Setup

```bash
cp .env.example .env
```

Edit `.env` and fill in all required values (see Environment Variables section below).

### 4. Start Local Database

```bash
docker-compose up -d
```

### 5. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed initial data (admin user, categories, sample books)
npm run db:seed
```

### 6. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Default login credentials (after seeding):**
- Admin: `admin@godsongroove.com` / `admin123456`
- Reader: `reader@godsongroove.com` / `reader123456`

---

## 🔑 Environment Variables

### Required

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/godson_groove"

# JWT
JWT_ACCESS_SECRET="your-32+-char-secret"
JWT_REFRESH_SECRET="your-32+-char-secret"

# Paystack
PAYSTACK_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY="pk_live_..."
GROOVE_PASS_PRICE_NGN="2500"

# AWS S3
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_S3_BUCKET="godson-groove-assets"

# App URL
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

### Optional

```env
# Stripe (global expansion)
STRIPE_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."

# Email
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASS="your-api-key"
```

---

## 📁 Project Structure

```
godson-groove/
├── prisma/
│   ├── schema.prisma          # Complete DB schema (17 models)
│   └── seed.ts                # Seed data with sample books
├── src/
│   ├── app/
│   │   ├── (auth)/            # Auth pages (login, register)
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (main)/            # Public site
│   │   │   ├── page.tsx       # Homepage
│   │   │   ├── books/         # Book listing & detail
│   │   │   ├── series/        # Story worlds
│   │   │   ├── shop/          # Physical books shop
│   │   │   ├── search/        # Search (list view)
│   │   │   ├── cart/          # Shopping cart
│   │   │   ├── dashboard/     # User dashboard
│   │   │   └── groove-pass/   # Subscription page
│   │   ├── admin/             # Admin dashboard
│   │   │   ├── page.tsx       # Analytics overview
│   │   │   ├── books/         # Book CRUD + file upload
│   │   │   ├── orders/        # Order management
│   │   │   ├── users/         # User management
│   │   │   ├── series/        # Series management
│   │   │   └── categories/    # Category management
│   │   └── api/               # API routes
│   │       ├── auth/          # Login, register, logout, refresh, me
│   │       ├── books/         # CRUD, search, read, progress, bookmarks
│   │       ├── series/        # Series CRUD
│   │       ├── categories/    # Category CRUD
│   │       ├── orders/        # Order creation & listing
│   │       ├── payments/      # Paystack + Stripe
│   │       ├── subscriptions/ # Groove Pass management
│   │       ├── user/          # Dashboard data
│   │       └── admin/         # Admin-only routes
│   ├── components/
│   │   ├── AuthProvider.tsx   # Auth context
│   │   ├── CartProvider.tsx   # Cart context
│   │   ├── layout/            # Navbar, Footer
│   │   ├── books/             # BookCard, BookCarousel
│   │   └── admin/             # AdminSidebar, AdminHeader
│   └── lib/
│       ├── prisma.ts          # DB client singleton
│       ├── auth.ts            # JWT helpers
│       ├── api.ts             # Response helpers
│       ├── storage.ts         # S3 upload/download
│       ├── paystack.ts        # Paystack integration
│       ├── stripe.ts          # Stripe abstraction layer
│       └── withAuth.ts        # Route protection HOC
├── middleware.ts               # Next.js edge middleware
├── tailwind.config.ts          # Brand colors & tokens
├── docker-compose.yml          # Local dev DB
└── .env.example               # Environment template
```

---

## 🎨 Brand Assets

Place these files in `public/images/`:

| File | Usage |
|------|-------|
| `logoyellow.png` | Primary logo (light backgrounds) |
| `logowhite.png` | Logo on dark/yellow backgrounds |
| `faviconyellow.png` | Primary favicon |
| `faviconwhite.png` | Favicon on dark backgrounds |

---

## 💳 Payment Setup

### Paystack (Nigeria)

1. Create account at [paystack.com](https://paystack.com)
2. Get API keys from Settings → API Keys & Webhooks
3. Set webhook URL: `https://yourdomain.com/api/payments/paystack/webhook`
4. Create a subscription plan in Paystack dashboard and copy the Plan Code to `PAYSTACK_SUBSCRIPTION_PLAN_CODE`

### Paystack Test Cards

```
Card: 4084 0840 8408 4081
CVV: 408  Expiry: 01/25  PIN: 0000  OTP: 123456
```

---

## 🔐 User Roles

| Role | Access |
|------|--------|
| `FREE_USER` | Free books only |
| `SUBSCRIBER` | All books (Groove Pass) |
| `ADMIN` | Full platform access |

---

## 🛳️ Production Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel --prod
```

Add all environment variables in Vercel dashboard → Settings → Environment Variables.

### Database (Production)

Use any of:
- [Neon](https://neon.tech) (serverless Postgres — free tier available)
- [Supabase](https://supabase.com)
- [Railway](https://railway.app)
- AWS RDS

```bash
# Run migrations in production
DATABASE_URL="your-prod-url" npm run db:migrate:prod
```

### Storage

For Cloudflare R2 (cheaper than S3), set:
```env
AWS_S3_ENDPOINT="https://your-account-id.r2.cloudflarestorage.com"
```

---

## 📊 Admin Dashboard

Access at `/admin` (ADMIN role required).

| Feature | Path |
|---------|------|
| Overview + Analytics | `/admin` |
| Book Management | `/admin/books` |
| Story Worlds | `/admin/series` |
| Categories | `/admin/categories` |
| Orders | `/admin/orders` |
| Users | `/admin/users` |

---

## 🔒 Security Features

- **JWT** access tokens (15min) + refresh tokens (30 days) stored in HttpOnly cookies
- **bcrypt** password hashing (cost factor 12)
- **Role-based** route protection via middleware + HOC
- **Input validation** with Zod on all API routes
- **Presigned S3 URLs** for book file access (1-hour expiry)
- **Paystack webhook** signature verification
- **CSRF protection** via SameSite cookie policy

---

## 🌍 Internationalisation

Currently English + Nigerian Naira (₦). To add currencies:
1. Add Stripe for USD/EUR/GBP payments
2. The Stripe abstraction layer in `src/lib/stripe.ts` is ready for this

---

## 📝 Key Features

- ✅ Free & Premium book system with subscription gate
- ✅ Digital reading with presigned S3 file URLs
- ✅ Reading progress tracking & bookmarks
- ✅ Physical book e-commerce (cart → Paystack → order tracking)
- ✅ Groove Pass subscription (₦2,500/month via Paystack)
- ✅ Story Worlds (series) with sequential books
- ✅ Full admin dashboard (books, orders, users, series, categories)
- ✅ External marketplace links (Amazon, Selar, OkadaBooks)
- ✅ Mobile-first responsive design
- ✅ Category carousels on homepage
- ✅ List-view search results
- ✅ File uploads (PDF, EPUB, audio) to S3
- ✅ JWT auth with refresh token rotation

---

*Built with ❤️ for Godson Groove*
