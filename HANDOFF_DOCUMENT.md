# Sponsra Handoff Document

**Version**: 1.0  
**Last Updated**: January 2025  
**Status**: ~45% Complete (See STATUS_REPORT.md for details)

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Features](#features)
4. [File Structure](#file-structure)
5. [Key Concepts](#key-concepts)
6. [Database Schema](#database-schema)
7. [Development Setup](#development-setup)
8. [Architecture Patterns](#architecture-patterns)
9. [Environment Variables](#environment-variables)
10. [Known Issues & TODOs](#known-issues--todos)

---

## 🎯 Project Overview

**Sponsra** is a booking platform for newsletter creators and sponsors. Think "Calendly for newsletter sponsorships."

### The Problem
Newsletter creators need a simple way to sell ad slots and sponsorships. Sponsors need an easy way to book and pay for placements.

### The Solution
- **For Creators**: A dashboard to manage inventory (ad tiers, pricing) and approve/reject bookings
- **For Sponsors**: A public booking portal where they can select dates, enter ad content, and pay

### Key Differentiator
This is **NOT a marketplace**. Creators share their unique booking link directly with sponsors. No discovery, no matching—just infrastructure.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router) - `16.1.1`
- **UI Library**: PrimeReact `10.9.7` (Lara Light/Dark Indigo theme)
- **Styling**: CSS Modules (NO Tailwind - explicitly forbidden)
- **Language**: TypeScript (strict mode)
- **React**: `19.2.3`

### Backend
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (email/password)
- **Storage**: Supabase Storage (planned, not yet implemented)
- **Payments**: Stripe Connect (Express accounts)
- **API**: Next.js Server Actions + API Routes

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint (Next.js config)
- **Type Checking**: TypeScript strict mode

---

## ✨ Features

### ✅ Implemented

#### Authentication
- Email/password sign up and sign in
- Automatic profile creation on signup
- Protected routes (dashboard requires auth)

#### Creator Dashboard (`/dashboard`)
- View all bookings with status tracking
- Revenue statistics
- Pending review count
- Approve/Reject booking workflow
- Stripe Connect onboarding flow
- Booking details modal with ad content preview

#### Sponsor Portal (`/[slug]/ad`)
- Dynamic routing by newsletter slug
- Tier selection (ad types with pricing)
- Calendar with blocked date visualization
- Live preview of ad content
- Character limits (headline: 60, body: 280)
- Multi-step booking flow:
  1. Select tier and date
  2. Enter ad content (headline, body, link, sponsor name)
  3. Payment via Stripe Checkout

#### Payment Flow
- Stripe Connect integration (Express accounts)
- 10% platform fee on transactions
- Webhook handling for payment confirmation
- Automatic status updates (draft → pending_payment → paid)

#### Database Security
- Row Level Security (RLS) policies
- Secure RPC functions for public operations
- Creator-only access to their bookings

### ❌ Not Yet Implemented

- **Dashboard Settings Page**: Creators cannot create/edit newsletter slugs or manage inventory tiers
- **15-Minute Soft Lock**: Draft bookings don't expire (only permanent unique constraint)
- **Image Upload**: No Supabase Storage setup or image validation ("Bouncer")
- **Export HTML**: No feature to generate HTML for approved ads
- **Landing Page**: Home page is just a theme toggle demo
- **UI Polish**: Basic styling, needs refinement

---

## 📁 File Structure

```
sponsra/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Route group (no URL segment)
│   │   └── login/
│   │       └── page.tsx          # Login/signup page
│   │
│   ├── (creator)/                # Route group for creator routes
│   │   └── dashboard/
│   │       ├── page.tsx          # Main dashboard (server component)
│   │       ├── BookingsTable.tsx # Client component: bookings list + review dialog
│   │       └── InventoryTable.tsx # Client component: inventory display (read-only)
│   │
│   ├── (portal)/                  # Route group for public portal
│   │   └── [slug]/               # Dynamic route: newsletter slug
│   │       └── ad/
│   │           ├── page.tsx      # Portal landing page (server)
│   │           ├── BookingForm.tsx # Step 1: Tier + date selection
│   │           └── AdCreative.tsx # Step 2: Ad content + preview + payment
│   │
│   ├── actions/                   # Server Actions (Next.js pattern)
│   │   ├── bookings.ts           # Booking CRUD operations
│   │   ├── stripe.ts             # Stripe Checkout session creation
│   │   └── stripe-connect.ts     # Stripe Connect account setup
│   │
│   ├── api/                       # API Routes
│   │   └── webhooks/
│   │       └── stripe/
│   │           └── route.ts      # Stripe webhook handler
│   │
│   ├── success/
│   │   └── page.tsx              # Post-payment success page
│   │
│   ├── layout.tsx                 # Root layout (PrimeReact setup)
│   ├── page.tsx                   # Home page (currently theme demo)
│   ├── registry.tsx               # PrimeReact SSR registry
│   ├── styles/
│   │   └── globals.css           # Global styles + CSS variables
│   └── favicon.ico
│
├── lib/                           # Shared utilities
│   ├── portal.tsx                # Portal helper: getNewsletterBySlug()
│   └── ThemeContext.tsx          # Theme switching context (light/dark)
│
├── utils/                         # Utility functions
│   └── supabase/
│       ├── client.ts             # Browser Supabase client
│       └── server.ts             # Server Supabase client (SSR)
│
├── supabase/                      # Database migrations
│   ├── migrations/               # SQL migration files (chronological)
│   │   ├── 20260114021410_init_profiles.sql
│   │   ├── 20260114030323_create_inventory_schema.sql
│   │   ├── 20260114033131_create_bookings_table.sql
│   │   ├── 20260114040324_add_booking_content.sql
│   │   ├── 20260114044420_secure_bookings.sql
│   │   ├── 20260114170014_add_stripe_connect.sql
│   │   ├── 20260114182753_finalize_schema_and_security.sql
│   │   └── 20260115000000_add_sponsor_name.sql
│   ├── seed.sql                  # Seed data (if any)
│   └── snippets/                 # SQL query snippets (dev notes)
│
├── public/                        # Static assets
│   ├── themes/                   # PrimeReact theme CSS files
│   │   ├── lara-light-indigo/
│   │   └── lara-dark-indigo/
│   └── [svg icons]
│
├── .cursor/                       # Cursor IDE rules
│   └── rules/
│       └── rules.mdc             # Coding standards (NO Tailwind!)
│
├── package.json                   # Dependencies
├── tsconfig.json                  # TypeScript config
├── next.config.ts                 # Next.js config
├── eslint.config.mjs              # ESLint config
│
├── IMPLEMENTATION_PLAN.md         # Original implementation plan
├── STATUS_REPORT.md               # Current status vs plan
└── HANDOFF_DOCUMENT.md            # This file
```

---

## 🔑 Key Concepts

### Route Groups
Next.js route groups `(auth)`, `(creator)`, `(portal)` don't add URL segments. They're for organization and layout sharing.

- `(auth)/login` → `/login`
- `(creator)/dashboard` → `/dashboard`
- `(portal)/[slug]/ad` → `/[slug]/ad`

### Server vs Client Components
- **Server Components** (default): Fetch data, no interactivity
  - `app/(creator)/dashboard/page.tsx` - Fetches bookings from DB
- **Client Components** (`"use client"`): Interactivity, hooks, state
  - `BookingsTable.tsx` - Dialog, buttons, state management
  - `BookingForm.tsx` - Calendar, form inputs

### Server Actions
Next.js pattern for mutations. Files in `app/actions/` export async functions marked `"use server"`.

```typescript
// app/actions/bookings.ts
"use server";
export async function createBooking(...) { ... }
```

### Booking Flow States
1. **draft**: Initial booking created (date selected)
2. **pending_payment**: Ad content saved, awaiting payment
3. **paid**: Payment confirmed via webhook
4. **approved**: Creator approved the ad
5. **rejected**: Creator rejected the ad

### Soft Lock (Not Yet Implemented)
Plan calls for 15-minute expiration on draft bookings. Currently, unique constraint `(tier_id, target_date)` prevents double booking permanently.

---

## 🗄 Database Schema

### Core Tables

#### `profiles`
- `id` (uuid, PK) - References `auth.users`
- `stripe_account_id` (text) - Stripe Connect account ID
- Created via trigger on user signup

#### `newsletters`
- `id` (uuid, PK)
- `owner_id` (uuid, FK → profiles)
- `name` (text)
- `slug` (text, unique) - Used in URL: `/[slug]/ad`
- `description` (text, nullable)
- `logo_url` (text, nullable)

#### `inventory_tiers`
- `id` (uuid, PK)
- `newsletter_id` (uuid, FK → newsletters)
- `name` (text) - e.g., "Main Sponsor"
- `type` (enum: 'ad' | 'sponsor')
- `price` (integer) - Stored in cents
- `description` (text, nullable)
- `is_active` (boolean)

#### `bookings`
- `id` (uuid, PK)
- `newsletter_id` (uuid, FK)
- `tier_id` (uuid, FK)
- `target_date` (date) - When ad runs
- `status` (enum: 'draft' | 'pending_payment' | 'paid' | 'approved' | 'rejected')
- `sponsor_name` (text)
- `ad_headline` (text, max 100 chars)
- `ad_body` (text, max 500 chars)
- `ad_link` (text)
- `ad_image_path` (text, nullable) - Planned for Supabase Storage
- **Constraint**: Unique `(tier_id, target_date)` prevents double booking

### Security Functions (RPC)

#### `create_booking(p_tier_id, p_target_date, p_newsletter_slug)`
- Creates draft booking
- Bypasses RLS (security definer)
- Returns booking UUID

#### `get_blocked_dates(queried_tier_id)`
- Returns array of dates already booked for a tier
- Used to disable calendar dates

#### `update_booking_content(booking_id, new_headline, new_body, new_link, new_sponsor_name)`
- Updates ad content and sets status to `pending_payment`
- Only works if status is `draft`

#### `get_checkout_data(p_booking_id)`
- Returns price, tier_name, stripe_account_id for Stripe session

### Row Level Security (RLS)

- **Newsletters**: Public read, owner write
- **Inventory Tiers**: Public read, owner write
- **Bookings**: 
  - Public can create (insert)
  - Public can read blocked dates (via function)
  - Creators can manage their own (via newsletter ownership)

---

## 🚀 Development Setup

### Prerequisites
- Node.js 18+ 
- npm
- Docker (for Supabase Local)
- Supabase CLI (`npm install -g supabase`)

### Initial Setup

```bash
# 1. Install dependencies
npm install

# 2. Start Supabase Local
npx supabase start

# 3. Run migrations
npx supabase db reset  # Applies all migrations + seed

# 4. Get environment variables
npx supabase status  # Copy the API URL and anon key

# 5. Create .env.local
cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=[from supabase status]
SUPABASE_SERVICE_ROLE_KEY=[from supabase status]
STRIPE_SECRET_KEY=sk_test_[your test key]
STRIPE_WEBHOOK_SECRET=whsec_[from Stripe dashboard]
NEXT_PUBLIC_BASE_URL=http://localhost:3000
EOF

# 6. Start dev server
npm run dev
```

### Database Migrations

```bash
# Create new migration
npx supabase migration new migration_name

# Apply migrations
npx supabase db reset  # Full reset (dev)
# OR
npx supabase migration up  # Incremental (production-like)
```

### Stripe Setup

1. Create Stripe account (test mode)
2. Enable Stripe Connect
3. Get API keys from Dashboard
4. Set up webhook endpoint: `http://localhost:3000/api/webhooks/stripe`
5. Use Stripe CLI for local webhook testing:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

---

## 🏗 Architecture Patterns

### Data Fetching
- **Server Components**: Direct Supabase queries in `page.tsx`
- **Client Components**: Use Server Actions for mutations
- **No API Routes** (except webhooks): Server Actions preferred

### Styling
- **PrimeReact Components**: Use as-is, minimal customization
- **CSS Modules**: For component-specific styles (`.module.css`)
- **Global Styles**: `app/styles/globals.css` for variables
- **NO Tailwind**: Explicitly forbidden in `.cursor/rules/rules.mdc`

### Error Handling
- Server Actions return `{ success: boolean, message?: string }`
- Client components show alerts/notifications
- Webhook errors logged to console (production: use monitoring)

### Type Safety
- Strict TypeScript (`tsconfig.json`)
- Avoid `any` - use proper types
- Database types inferred from Supabase queries

---

## 🔐 Environment Variables

### Required

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=          # Public (browser-safe)
NEXT_PUBLIC_SUPABASE_ANON_KEY=    # Public (browser-safe)
SUPABASE_SERVICE_ROLE_KEY=         # Server-only (bypasses RLS)

# Stripe
STRIPE_SECRET_KEY=                # Server-only
STRIPE_WEBHOOK_SECRET=            # Server-only (webhook verification)

# App
NEXT_PUBLIC_BASE_URL=             # For redirects (http://localhost:3000 or https://sponsra.app)
```

### Local Development
- Use `.env.local` (gitignored)
- Copy from `npx supabase status` for local Supabase

### Production
- Set in Vercel dashboard (or deployment platform)
- Use production Supabase project
- Use production Stripe keys

---

## 🐛 Known Issues & TODOs

### Critical Missing Features
1. **Dashboard Settings Page** (`/dashboard/settings`)
   - Create/edit newsletter slug
   - CRUD operations for inventory tiers
   - Currently: Creators cannot manage their inventory

2. **15-Minute Soft Lock**
   - Draft bookings should expire after 15 minutes
   - Need cleanup job/cron
   - Currently: Permanent unique constraint only

3. **Image Upload & Bouncer Validation**
   - Supabase Storage bucket setup
   - Image upload UI in `AdCreative.tsx`
   - Validation: resolution, format, size checks

### Medium Priority
4. **Export HTML Feature**
   - Generate HTML for approved ads
   - Copy-to-clipboard button in dashboard

5. **Landing Page**
   - Replace theme demo with marketing page
   - Hero, value prop, interactive demo

6. **UI Polish**
   - Refined typography
   - Enhanced color scheme
   - Modern, friendly aesthetic

### Technical Debt
- Routing discrepancy: Plan says `/portal/[slug]`, code uses `/[slug]`
- No error boundaries
- No loading states for some async operations
- Debug JSON in `BookingsTable.tsx` dialog (line 142-147) - remove before production

---

## 📚 Additional Resources

- **Implementation Plan**: `IMPLEMENTATION_PLAN.md`
- **Status Report**: `STATUS_REPORT.md`
- **Coding Rules**: `.cursor/rules/rules.mdc`
- **Next.js Docs**: https://nextjs.org/docs
- **PrimeReact Docs**: https://primereact.org/
- **Supabase Docs**: https://supabase.com/docs
- **Stripe Connect Docs**: https://stripe.com/docs/connect

---

## 🤝 Getting Help

### Common Questions

**Q: How do I add a new feature?**  
A: Follow the Server Action pattern in `app/actions/`, create client components in appropriate route groups.

**Q: Where do I add new database tables?**  
A: Create a migration in `supabase/migrations/` with timestamp prefix.

**Q: How do I test Stripe locally?**  
A: Use Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

**Q: Why can't I use Tailwind?**  
A: Project standard is CSS Modules. See `.cursor/rules/rules.mdc`.

---

## 📝 Notes for New Developers

1. **Start with the dashboard** - It's the most complete feature
2. **Understand the booking flow** - It's the core user journey
3. **Check RLS policies** - Security is important, don't bypass without understanding
4. **Use Server Actions** - Don't create API routes unless necessary (webhooks are exception)
5. **Follow the file structure** - Route groups, actions, utils are organized intentionally

---

**Last Updated**: January 2025  
**Maintained By**: [Your Team]  
**Questions?** Check `STATUS_REPORT.md` for current progress and blockers.
