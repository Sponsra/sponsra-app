# Sponsra Architecture Documentation

## Table of Contents
1. [Application Overview](#application-overview)
2. [Technology Stack](#technology-stack)
3. [System Architecture](#system-architecture)
4. [Data Flow](#data-flow)
5. [Database Schema](#database-schema)
6. [Core Features](#core-features)
7. [Security Architecture](#security-architecture)
8. [Deployment & Infrastructure](#deployment--infrastructure)
9. [Key Design Decisions](#key-design-decisions)

---

## Application Overview

**Sponsra** is a B2B SaaS platform that enables newsletter creators to sell advertising slots and sponsorships directly to sponsors through a streamlined booking portal. Think of it as "Calendly for newsletter sponsorships."

### Core Value Proposition
- **For Creators**: A dashboard to manage inventory (ad tiers, pricing, schedules) and approve/reject bookings
- **For Sponsors**: A public booking portal to select dates, enter ad content, and complete payment

### User Types
1. **Creators**: Newsletter owners who manage their inventory and bookings
2. **Sponsors**: Advertisers who book slots through public portals
3. **Public Users**: Anyone browsing booking portals (no authentication required)

---

## Technology Stack

### Frontend
- **Framework**: Next.js 16.1.1 (App Router)
- **UI Library**: React 19.2.3
- **Component Library**: PrimeReact 10.9.7
- **Styling**: CSS Modules (not Tailwind)
- **Icons**: PrimeIcons 7.0.0
- **Language**: TypeScript 5

### Backend
- **Runtime**: Next.js Server Actions & API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (for ad creatives/images)
- **Payments**: Stripe Connect (Express accounts)

### Infrastructure
- **Frontend Hosting**: Vercel
- **Database**: Supabase Cloud (PostgreSQL)
- **CI/CD**: GitHub Actions (for database migrations)
- **Environment Management**: Vercel Environment Variables with scoping

### Key Libraries
- `@supabase/ssr`: Server-side rendering support for Supabase
- `@supabase/supabase-js`: Supabase client library
- `stripe`: Stripe API integration
- `@stripe/stripe-js`: Stripe client-side library

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Browser                       │
│  ┌──────────────────┐         ┌──────────────────┐          │
│  │  Creator Portal  │         │  Sponsor Portal  │          │
│  │   (Dashboard)    │         │  (Booking Flow)  │          │
│  └──────────────────┘         └──────────────────┘          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────┐
│                    Next.js Application                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   App Router │  │ Server       │  │   API Routes │      │
│  │   (Pages)    │  │ Actions      │  │  (Webhooks)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   Supabase      │  │   Supabase      │  │     Stripe      │
│   (Database)    │  │   (Storage)     │  │   (Payments)    │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

### Application Structure

```
app/
├── (auth)/              # Authentication routes
│   └── login/           # Login/signup page
├── (creator)/           # Creator dashboard (protected)
│   └── dashboard/      # Main dashboard, bookings, inventory, settings
├── (portal)/            # Public booking portal
│   └── [slug]/         # Dynamic newsletter slug routes
│       └── ad/         # Booking wizard
├── actions/             # Server Actions (data mutations)
│   ├── bookings.ts     # Booking CRUD operations
│   ├── inventory.ts    # Inventory & schedule management
│   ├── stripe.ts       # Payment processing
│   └── stripe-connect.ts # Stripe Connect setup
├── api/                 # API Routes
│   └── webhooks/
│       └── stripe/     # Stripe webhook handler
├── components/          # Shared components
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
    └── supabase/       # Supabase client helpers
```

### Route Groups
- `(auth)`: Authentication pages
- `(creator)`: Protected creator dashboard routes
- `(portal)`: Public booking portal routes

---

## Data Flow

### 1. Booking Flow (Sponsor → Creator)

```
Sponsor visits /[slug]/ad
    │
    ▼
1. Select Tier & Date
    │
    ▼
2. createBooking() → Creates draft booking in DB
    │
    ▼
3. Enter Ad Creative (headline, body, link, image)
    │
    ▼
4. saveAdCreative() → Updates booking with content
    │
    ▼
5. createBookingCheckout() → Creates Stripe Checkout Session
    │
    ▼
6. Redirect to Stripe Checkout
    │
    ▼
7. Payment Success → Stripe Webhook
    │
    ▼
8. Webhook updates booking status to "paid"
    │
    ▼
9. Creator sees booking in dashboard (status: "paid")
    │
    ▼
10. Creator approves/rejects → Status: "approved" or "rejected"
```

### 2. Availability Calculation Flow

```
getAvailableDates(tierId, startDate, endDate)
    │
    ├─► Fetch Newsletter Publication Schedule
    ├─► Fetch Tier Availability Schedule
    └─► Fetch Existing Bookings (date range bounded)
    │
    ▼
Generate candidate dates from newsletter schedule
    │
    ▼
Filter by tier schedule (intersection)
    │
    ▼
Subtract booked dates
    │
    ▼
Return DateAvailabilityStatus[] with:
    - available
    - booked
    - unavailable (with reason)
```

### 3. Creator Dashboard Data Flow

```
Dashboard Page Load
    │
    ├─► Check Authentication
    ├─► Fetch Newsletter (with inventory_tiers, bookings)
    ├─► Check Stripe Connect Status
    └─► Calculate Metrics:
        - Revenue (this month, last month)
        - Pipeline count
        - Occupancy (next 30 days)
        - Requires attention
        - Up next bookings
    │
    ▼
Render Dashboard Components
```

### 4. Payment Flow (Stripe Connect)

```
Creator clicks "Setup Payouts"
    │
    ▼
createStripeConnectAccount()
    │
    ├─► Create Stripe Express Account
    ├─► Save account_id to profiles table
    └─► Create Account Link (onboarding URL)
    │
    ▼
Redirect to Stripe Onboarding
    │
    ▼
Creator completes onboarding
    │
    ▼
Return to dashboard
    │
    ▼
getStripeStatus() → Checks if charges_enabled
```

### 5. Payment Processing Flow

```
createCheckoutSession(bookingId)
    │
    ├─► Fetch booking data via RPC (get_checkout_data)
    ├─► Extract: price, tier_name, stripe_account_id, newsletter_slug
    └─► Create Stripe Checkout Session:
        - Line item: tier price
        - Payment intent: application_fee (10%)
        - Transfer: to creator's Stripe account
        - Metadata: booking_id
    │
    ▼
Return checkout URL
    │
    ▼
Sponsor completes payment
    │
    ▼
Stripe Webhook: checkout.session.completed
    │
    ▼
Update booking status to "paid"
```

---

## Database Schema

### Core Tables

#### `profiles`
- User profile information
- Links to Supabase Auth users
- Stores `stripe_account_id` for Stripe Connect

#### `newsletters`
- Core newsletter entity
- Fields: `id`, `owner_id`, `name`, `slug`, `description`, `logo_url`, `theme_config`
- One-to-many with `inventory_tiers`
- One-to-many with `bookings`

#### `inventory_tiers`
- Ad/sponsor tier definitions
- Fields: `id`, `newsletter_id`, `name`, `type` (enum: 'ad' | 'sponsor'), `price` (cents), `description`, `is_active`
- Specs: `specs_headline_limit`, `specs_body_limit`, `specs_image_ratio`
- One-to-many with `bookings`
- One-to-one with `tier_availability_schedules`

#### `bookings`
- Booking records
- Fields: `id`, `newsletter_id`, `tier_id`, `target_date`, `status` (enum), `sponsor_email`
- Content: `ad_headline`, `ad_body`, `ad_link`, `sponsor_name`, `ad_image_path`
- Constraint: Unique `(tier_id, target_date)` to prevent double booking

#### `newsletter_publication_schedules`
- Newsletter publication schedule
- Fields: `schedule_type` (enum: 'recurring' | 'one_off' | 'all_dates')
- Pattern fields: `pattern_type`, `days_of_week`, `day_of_month`, `monthly_week_number`
- Date fields: `start_date`, `end_date`, `specific_dates[]`

#### `tier_availability_schedules`
- Tier-specific availability rules
- Inherits from newsletter schedule or overrides
- Additional fields: `is_available`, `capacity`

### Database Functions (RPC)

1. **`create_booking`**: Creates draft booking, validates uniqueness
2. **`get_blocked_dates`**: Returns booked dates for a tier (bypasses RLS)
3. **`get_checkout_data`**: Returns booking data for Stripe checkout
4. **`get_booking_for_validation`**: Returns booking with tier specs for validation
5. **`update_booking_content`**: Updates booking with ad creative content

### Row Level Security (RLS)

- **Newsletters**: Public read, owner write
- **Inventory Tiers**: Public read, owner write
- **Bookings**: Public read/insert, owner update
- **Schedules**: Public read, owner write
- **Storage**: Restricted uploads to `ad-creatives` bucket

---

## Core Features

### Creator Features

#### 1. Dashboard Overview
- **Pulse Cards**: Revenue metrics, pipeline count, occupancy
- **Requires Attention**: Paid bookings needing review, stale drafts
- **Up Next**: Next 3 approved bookings
- **Stripe Connect Status**: Warning banner if not connected

#### 2. Inventory Management
- Create/edit/delete ad tiers
- Configure tier specs:
  - Headline/body character limits
  - Image ratio requirements (1:1, 1.91:1, any, no_image)
  - Pricing (stored in cents)
- Activate/deactivate tiers

#### 3. Publication Schedule Management
- Configure newsletter publication schedule:
  - **Recurring**: Weekly, biweekly, monthly patterns
  - **One-off**: Specific dates
  - **All dates**: Every day
- Pattern types:
  - Weekly: Days of week
  - Monthly date: Specific day (e.g., 15th)
  - Monthly day: Nth occurrence (e.g., 2nd Tuesday)

#### 4. Tier Availability Scheduling
- Override newsletter schedule per tier
- Set tier-specific availability patterns
- Mark dates as explicitly unavailable
- Set capacity (future-proofing for multiple bookings per date)

#### 5. Booking Management
- View all bookings in calendar or table view
- Approve/reject bookings
- See booking details: content, sponsor info, status

#### 6. Settings
- Newsletter name and slug
- Theme configuration:
  - Primary color
  - Font family (sans, serif, mono)
  - Layout style (minimal, boxed)
- Stripe Connect setup

### Sponsor Features

#### 1. Public Booking Portal
- Access via `/[slug]/ad`
- View available tiers
- See tier pricing and specs

#### 2. Booking Wizard (Multi-Step)
- **Step 1: Select Date**
  - Calendar view with availability status
  - Shows: available, booked, unavailable (with reasons)
  - Filters by tier availability schedule
  
- **Step 2: Enter Creative**
  - Headline (with character counter)
  - Body text (with character counter)
  - Link URL
  - Sponsor name
  - Image upload (if required by tier)
    - Validates aspect ratio
    - Uploads to Supabase Storage
    - Max 2MB, formats: JPG, PNG, GIF

- **Step 3: Review**
  - Preview of booking details
  - Tier information
  - Total price

- **Step 4: Payment**
  - Redirect to Stripe Checkout
  - Payment processing via Stripe Connect
  - 10% platform fee

- **Step 5: Success**
  - Confirmation page
  - Booking status: "paid"

### System Features

#### 1. Availability Calculation
- Complex algorithm combining:
  - Newsletter publication schedule
  - Tier availability schedule
  - Existing bookings
- Returns detailed status for each date

#### 2. Image Upload
- Client-side upload to Supabase Storage
- Path format: `{bookingId}/{timestamp}.{ext}`
- Aspect ratio validation
- File size validation (2MB max)

#### 3. Theme System
- PrimeReact theme switching
- Multiple theme variants (light/dark, color schemes)
- Portal routes use fixed theme
- Dashboard supports theme toggle

---

## Security Architecture

### Authentication
- **Supabase Auth**: Email/password authentication
- **Session Management**: Cookie-based sessions via `@supabase/ssr`
- **Protected Routes**: Server-side auth checks in dashboard routes

### Authorization
- **Row Level Security (RLS)**: Database-level access control
- **Server Actions**: Server-side ownership verification
- **Public Access**: Booking portals are public (no auth required)

### Data Security
- **RLS Policies**: Enforce data access at database level
- **RPC Functions**: Bypass RLS for public availability queries
- **Service Role Key**: Used only in webhook handlers (server-only)

### Payment Security
- **Stripe Webhook Verification**: Signature validation
- **Metadata**: Booking ID stored in Stripe session metadata
- **Idempotency**: Database constraints prevent double booking

### Storage Security
- **Bucket Policies**: Restricted uploads to `ad-creatives` bucket
- **Path Restrictions**: Organized by booking ID
- **File Validation**: Client-side and server-side validation

---

## Deployment & Infrastructure

### Environment Setup

#### Dual-Environment Strategy
- **Production**: Live user data
- **Staging**: Preview builds, PR testing

#### Environment Variables

**Supabase**
- `NEXT_PUBLIC_SUPABASE_URL`: Project URL (public)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Anonymous key (public)
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key (server-only)

**Stripe**
- `STRIPE_SECRET_KEY`: API secret key (server-only)
- `STRIPE_WEBHOOK_SECRET`: Webhook signing secret (server-only)

**App**
- `NEXT_PUBLIC_BASE_URL`: Base URL for redirects

### Deployment Pipeline

#### Frontend (Vercel)
- Automatic deployment on push
- Environment variable scoping:
  - Production → Production Supabase
  - Preview/Development → Staging Supabase

#### Database Migrations (GitHub Actions)
- **Trigger**: Push to repository
- **Logic**:
  - Push to `main` → Migrate Production DB
  - Push to other branches → Migrate Staging DB
- **Connection**: Uses Connection Pooler (port 6543) for IPv4 compatibility

### Database Connection
- **Critical**: Must use Connection Pooler (port 6543), not direct connection (5432)
- **Reason**: GitHub Actions (IPv4) cannot reach direct Supabase address (IPv6)

---

## Key Design Decisions

### 1. Next.js App Router
- **Rationale**: Modern React Server Components, better performance
- **Server Actions**: Replace API routes for mutations
- **Route Groups**: Organize routes by user type

### 2. Supabase as Backend
- **Rationale**: Integrated auth, database, storage in one platform
- **RLS**: Database-level security reduces application complexity
- **RPC Functions**: Bypass RLS for public queries while maintaining security

### 3. Stripe Connect
- **Rationale**: Enable creators to receive payments directly
- **Express Accounts**: Simplified onboarding
- **Application Fee**: 10% platform fee built into payment flow

### 4. Availability Scheduling System
- **Rationale**: Flexible scheduling for diverse newsletter patterns
- **Two-Level System**: Newsletter schedule + tier overrides
- **Date Type**: Uses DATE (not TIMESTAMPTZ) to prevent timezone issues

### 5. Booking Status Flow
- **States**: `draft` → `pending_payment` → `paid` → `approved`/`rejected`
- **Rationale**: Clear workflow, prevents premature approvals

### 6. CSS Modules (Not Tailwind)
- **Rationale**: Scoped styling, better for component isolation
- **PrimeReact Integration**: Works seamlessly with PrimeReact themes

### 7. Server Actions Over API Routes
- **Rationale**: Type-safe, simpler than REST endpoints
- **Exception**: Webhooks require API routes (external callbacks)

### 8. Public Booking Portals
- **Rationale**: No authentication barrier for sponsors
- **Security**: RLS ensures data isolation, booking creation is public

### 9. Image Upload to Supabase Storage
- **Rationale**: Integrated with Supabase, no additional service needed
- **Path Structure**: Organized by booking ID for easy cleanup

### 10. Dual-Environment Database
- **Rationale**: Safe testing without affecting production data
- **Automation**: GitHub Actions automatically routes to correct environment

---

## Technical Highlights

### Performance Optimizations
- **Bounded Queries**: Date range filtering prevents fetching years of booking history
- **Parallel Queries**: Availability calculation uses `Promise.all()` for concurrent fetches
- **Server Components**: Reduce client-side JavaScript
- **Image Optimization**: Client-side validation before upload

### Error Handling
- **Graceful Degradation**: Fallback queries if RPC fails
- **User Feedback**: Clear error messages in UI
- **Logging**: Comprehensive console logging for debugging availability calculation

### Type Safety
- **TypeScript**: Full type coverage
- **Type Definitions**: Centralized in `app/types/`
- **Server Actions**: Type-safe function signatures

### Scalability Considerations
- **Database Indexes**: On foreign keys and frequently queried columns
- **RLS Performance**: Policies are optimized for common query patterns
- **Storage Organization**: Files organized by booking ID for efficient cleanup

---

## Future Considerations

### Potential Enhancements
1. **Multiple Bookings Per Date**: Capacity system is in place but not fully utilized
2. **Email Notifications**: Notify creators of new bookings
3. **Analytics Dashboard**: Revenue trends, booking patterns
4. **Export Functionality**: Export bookings to CSV/PDF
5. **Multi-Newsletter Support**: Creators managing multiple newsletters
6. **Booking Modifications**: Allow sponsors to edit bookings before approval
7. **Recurring Bookings**: Support for subscription-style recurring sponsorships

---

## Conclusion

Sponsra is a well-architected SaaS platform that leverages modern web technologies to provide a seamless booking experience for newsletter creators and sponsors. The system is designed with security, scalability, and maintainability in mind, using proven patterns and best practices throughout.

The architecture separates concerns cleanly, with clear data flows and well-defined boundaries between public and authenticated areas. The use of Supabase and Stripe Connect reduces infrastructure complexity while providing enterprise-grade features.

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Maintained By**: Development Team
