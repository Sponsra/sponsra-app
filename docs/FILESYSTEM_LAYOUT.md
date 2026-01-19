# Sponsra Filesystem Layout

Complete directory tree with file descriptions.

```
sponsra/
│
├── 📁 app/                                    # Next.js App Router (main application)
│   │
│   ├── 📁 (auth)/                             # Route group: Authentication (no URL segment)
│   │   └── 📁 login/
│   │       └── page.tsx                      # Login/signup page (client component)
│   │
│   ├── 📁 (creator)/                          # Route group: Creator routes (no URL segment)
│   │   └── 📁 dashboard/
│   │       ├── page.tsx                      # Dashboard main page (server component)
│   │       ├── BookingsTable.tsx             # Bookings list + review dialog (client)
│   │       └── InventoryTable.tsx             # Inventory display table (client, read-only)
│   │
│   ├── 📁 (portal)/                           # Route group: Public portal (no URL segment)
│   │   └── 📁 [slug]/                        # Dynamic route: newsletter slug
│   │       └── 📁 ad/
│   │           ├── page.tsx                   # Portal landing page (server)
│   │           ├── BookingForm.tsx            # Step 1: Tier + date selection (client)
│   │           └── AdCreative.tsx             # Step 2: Ad content + preview (client)
│   │
│   ├── 📁 actions/                            # Server Actions (Next.js pattern)
│   │   ├── bookings.ts                       # Booking CRUD: create, save, approve, reject
│   │   ├── stripe.ts                         # Stripe Checkout session creation
│   │   └── stripe-connect.ts                 # Stripe Connect account setup & status
│   │
│   ├── 📁 api/                                # API Routes (Next.js)
│   │   └── 📁 webhooks/
│   │       └── 📁 stripe/
│   │           └── route.ts                   # Stripe webhook handler (POST)
│   │
│   ├── 📁 success/
│   │   └── page.tsx                          # Post-payment success page (client)
│   │
│   ├── 📁 styles/
│   │   └── globals.css                        # Global CSS variables & base styles
│   │
│   ├── layout.tsx                             # Root layout: PrimeReact setup + theme
│   ├── page.tsx                               # Home page (currently theme demo)
│   ├── registry.tsx                           # PrimeReact SSR registry wrapper
│   ├── page.module.css                        # Home page styles (CSS Module)
│   └── favicon.ico                            # Site favicon
│
├── 📁 lib/                                    # Shared library code
│   ├── portal.tsx                            # Portal utilities: getNewsletterBySlug()
│   └── ThemeContext.tsx                      # Theme switching context (light/dark)
│
├── 📁 utils/                                  # Utility functions
│   └── 📁 supabase/
│       ├── client.ts                         # Browser Supabase client (SSR-compatible)
│       └── server.ts                         # Server Supabase client (cookie-based)
│
├── 📁 supabase/                               # Database & Supabase config
│   ├── 📁 migrations/                        # SQL migration files (chronological order)
│   │   ├── 20260114021410_init_profiles.sql  # Profiles table + RLS + trigger
│   │   ├── 20260114030323_create_inventory_schema.sql  # Newsletters + inventory_tiers
│   │   ├── 20260114033131_create_bookings_table.sql    # Bookings table + status enum
│   │   ├── 20260114040324_add_booking_content.sql      # Ad content columns + constraints
│   │   ├── 20260114044420_secure_bookings.sql          # RLS policies + secure functions
│   │   ├── 20260114170014_add_stripe_connect.sql       # Stripe account ID column
│   │   ├── 20260114182753_finalize_schema_and_security.sql  # Final security functions
│   │   └── 20260115000000_add_sponsor_name.sql          # Sponsor name column
│   │
│   ├── seed.sql                               # Seed data (optional, for dev)
│   └── 📁 snippets/                           # SQL query snippets (dev notes, not migrations)
│
├── 📁 public/                                 # Static assets (served at root)
│   ├── 📁 themes/                             # PrimeReact theme CSS files
│   │   ├── 📁 lara-light-indigo/
│   │   │   └── theme.css                     # Light theme
│   │   └── 📁 lara-dark-indigo/
│   │       └── theme.css                      # Dark theme
│   │
│   ├── file.svg                               # SVG icons
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
│
├── 📁 .cursor/                                # Cursor IDE configuration
│   └── 📁 rules/
│       └── rules.mdc                          # Coding standards & project rules
│
├── 📄 package.json                            # npm dependencies & scripts
├── 📄 package-lock.json                       # Locked dependency versions
├── 📄 tsconfig.json                           # TypeScript configuration
├── 📄 next.config.ts                          # Next.js configuration
├── 📄 eslint.config.mjs                       # ESLint configuration
├── 📄 next-env.d.ts                           # Next.js type definitions
│
├── 📄 IMPLEMENTATION_PLAN.md                   # Original implementation plan
├── 📄 STATUS_REPORT.md                        # Current status vs. plan
├── 📄 HANDOFF_DOCUMENT.md                     # Comprehensive handoff guide
└── 📄 FILESYSTEM_LAYOUT.md                    # This file
```

---

## File Descriptions

### Core Application Files

#### `app/layout.tsx`

Root layout component. Sets up PrimeReact provider, theme context, and global styles. All pages inherit from this.

#### `app/page.tsx`

Home page. Currently just a theme toggle demo. **TODO**: Replace with landing page.

#### `app/registry.tsx`

PrimeReact SSR registry wrapper. Required for Next.js App Router compatibility.

---

### Route Groups

#### `(auth)/login/page.tsx`

Authentication page with sign up and sign in forms. Uses Supabase Auth.

#### `(creator)/dashboard/page.tsx`

Main creator dashboard (server component). Fetches newsletter, inventory, and bookings. Displays stats and booking table.

#### `(creator)/dashboard/BookingsTable.tsx`

Client component for displaying bookings in a table. Includes review dialog for approve/reject actions.

#### `(creator)/dashboard/InventoryTable.tsx`

Client component for displaying inventory tiers. **Currently read-only** - no CRUD operations.

#### `(portal)/[slug]/ad/page.tsx`

Public portal landing page (server component). Resolves newsletter by slug and renders booking form.

#### `(portal)/[slug]/ad/BookingForm.tsx`

Step 1 of booking flow: Tier selection and date picker. Creates draft booking.

#### `(portal)/[slug]/ad/AdCreative.tsx`

Step 2 of booking flow: Ad content form with live preview. Saves content and redirects to Stripe.

---

### Server Actions

#### `app/actions/bookings.ts`

- `getBookedDates(tierId)` - Returns blocked dates for calendar
- `createBooking(tierId, date, slug)` - Creates draft booking
- `saveAdCreative(bookingId, content)` - Saves ad content
- `approveBooking(bookingId)` - Approves booking
- `rejectBooking(bookingId)` - Rejects booking

#### `app/actions/stripe.ts`

- `createCheckoutSession(bookingId)` - Creates Stripe Checkout session with Connect

#### `app/actions/stripe-connect.ts`

- `createStripeConnectAccount()` - Creates Express account and onboarding link
- `getStripeStatus()` - Checks if creator has connected Stripe

---

### API Routes

#### `app/api/webhooks/stripe/route.ts`

Stripe webhook handler. Verifies signature and updates booking status to "paid" on successful payment.

---

### Utilities

#### `lib/portal.tsx`

Helper function to fetch newsletter by slug. Used by portal pages.

#### `lib/ThemeContext.tsx`

React context for theme switching (light/dark). Updates CSS link tag in head.

#### `utils/supabase/client.ts`

Browser Supabase client using `@supabase/ssr`. For client components.

#### `utils/supabase/server.ts`

Server Supabase client using `@supabase/ssr` with cookie handling. For server components and actions.

---

### Database Migrations

Migrations are applied in chronological order. Each adds a piece of the schema:

1. **init_profiles**: User profiles table + auto-creation trigger
2. **create_inventory_schema**: Newsletters and inventory_tiers tables
3. **create_bookings_table**: Bookings table with status enum
4. **add_booking_content**: Ad content columns (headline, body, link, image_path)
5. **secure_bookings**: RLS policies and secure RPC functions
6. **add_stripe_connect**: Stripe account ID column in profiles
7. **finalize_schema_and_security**: Final security functions and policies
8. **add_sponsor_name**: Sponsor name column in bookings

---

### Configuration Files

#### `package.json`

Dependencies:

- Next.js 16.1.1
- PrimeReact 10.9.7
- Supabase (@supabase/ssr, @supabase/supabase-js)
- Stripe (stripe, @stripe/stripe-js)
- React 19.2.3

#### `tsconfig.json`

TypeScript strict mode with path aliases (`@/*` → root).

#### `next.config.ts`

Minimal Next.js config (default settings).

#### `.cursor/rules/rules.mdc`

Project coding standards:

- NO Tailwind CSS
- Use CSS Modules
- Strict TypeScript
- PrimeReact for UI
- Server Actions for mutations

---

## Key Directories

### `app/` - Application Code

All Next.js App Router code lives here. Route groups organize by feature.

### `lib/` - Shared Library Code

Reusable utilities and contexts used across the app.

### `utils/` - Utility Functions

Helper functions, especially Supabase clients.

### `supabase/migrations/` - Database Schema

All database changes are versioned here. Never edit existing migrations.

### `public/` - Static Assets

Files served at root URL. Themes, icons, images.

---

## File Naming Conventions

- **Components**: PascalCase (`BookingForm.tsx`)
- **Pages**: `page.tsx` (Next.js convention)
- **Server Actions**: kebab-case (`bookings.ts`)
- **CSS Modules**: `ComponentName.module.css`
- **Migrations**: `YYYYMMDDHHMMSS_description.sql`

---

## Missing Files (Planned)

- `app/(creator)/dashboard/settings/page.tsx` - Settings page for inventory management
- `app/(portal)/[slug]/ad/ImageUpload.tsx` - Image upload component (Bouncer)
- `app/page.tsx` - Landing page (currently just theme demo)
- `supabase/storage/` - Storage bucket configuration (not yet implemented)

---

**See `HANDOFF_DOCUMENT.md` for detailed explanations of each component and how they work together.**
