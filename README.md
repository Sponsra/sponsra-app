# Sponsra

A booking platform for newsletter creators and sponsors. Think "Calendly for newsletter sponsorships."

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Infrastructure & Deployment](#infrastructure--deployment)
- [Environment Variables](#environment-variables)
- [Local Development](#local-development)
- [Database Migrations](#database-migrations)
- [Stripe Setup](#stripe-setup)
- [Useful Commands](#useful-commands)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

**Sponsra** enables newsletter creators to sell ad slots and sponsorships directly to sponsors through a simple booking portal.

### Key Features

- **For Creators**: Dashboard to manage inventory (ad tiers, pricing) and approve/reject bookings
- **For Sponsors**: Public booking portal to select dates, enter ad content, and pay

### Tech Stack

- **Frontend**: Next.js 16.1.1 (App Router), React 19.2.3, PrimeReact 10.9.7, TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Storage), Stripe Connect
- **Deployment**: Vercel (frontend), GitHub Actions (database migrations)

---

## 🔧 Prerequisites

Before you begin, ensure you have:

- **Node.js** 18+ installed
- **npm** (comes with Node.js)
- **Docker Desktop** installed and running (required for Supabase Local)
- **Supabase CLI** installed globally:
  ```bash
  npm install -g supabase
  ```
- **Git** installed
- Accounts for:
  - **Vercel** (for frontend deployment)
  - **Supabase** (for database - you'll need 2 projects: Production + Staging)
  - **Stripe** (for payments)
  - **GitHub** (for repository and CI/CD)

---

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd sponsra

# Install dependencies
npm install
```

### 2. Start Local Supabase

```bash
# Start Supabase Local (requires Docker)
npx supabase start

# Get your local environment variables
npx supabase status
```

Copy the output values - you'll need them for `.env.local`.

### 3. Create Environment File

Create `.env.local` in the project root:

```bash
# Supabase (from npx supabase status)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-local-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-local-service-role-key>

# Stripe (test mode keys from Stripe Dashboard)
STRIPE_SECRET_KEY=sk_test_<your-test-key>
STRIPE_WEBHOOK_SECRET=whsec_<your-webhook-secret>

# App
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. Run Database Migrations Locally

```bash
# Apply all migrations
npx supabase db reset
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏗 Infrastructure & Deployment

This project uses a **Dual-Environment setup** (Staging vs. Production) to ensure safe testing.

- **Vercel** handles the frontend application deployment
- **GitHub Actions** handles the database migrations via Supabase CLI

### 1. Database Setup (Supabase)

We use **two separate Supabase projects** to isolate production data from testing:

- **Production Project**: Holds live user data
- **Staging Project**: Used for preview builds and PR testing. Can be wiped/reset if needed

#### ⚠️ CRITICAL: Connection Pooler

When getting the Database Connection String, you **MUST** use the **Connection Pooler** (Port **6543**), not the direct connection (Port 5432).

**Why?** GitHub Actions (IPv4) cannot reach the direct Supabase address (IPv6).

**How to find it:**

1. Go to Supabase Dashboard > Settings > Database
2. Navigate to **Connection Pooling** > Mode: **Session**
3. Copy the connection string (it will end with `:6543/postgres`)

### 2. Environment Variables (Vercel)

We use Vercel's **Environment Variable Scoping** to point the app to the correct database automatically.

#### Required Variables

Set these in **Vercel Dashboard** > Your Project > Settings > Environment Variables:

| Variable Name                   | Value Source                                 | Scoped To                |
| ------------------------------- | -------------------------------------------- | ------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`      | Production Project URL                       | **Production**           |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production Anon Key                          | **Production**           |
| `NEXT_PUBLIC_SUPABASE_URL`      | Staging Project URL                          | **Preview, Development** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Staging Anon Key                             | **Preview, Development** |
| `SUPABASE_SERVICE_ROLE_KEY`     | Production Service Role Key                  | **Production**           |
| `SUPABASE_SERVICE_ROLE_KEY`     | Staging Service Role Key                     | **Preview, Development** |
| `STRIPE_SECRET_KEY`             | Production Stripe Secret Key                 | **Production**           |
| `STRIPE_SECRET_KEY`             | Test Stripe Secret Key                       | **Preview, Development** |
| `STRIPE_WEBHOOK_SECRET`         | Production Webhook Secret                    | **Production**           |
| `STRIPE_WEBHOOK_SECRET`         | Test Webhook Secret                          | **Preview, Development** |
| `NEXT_PUBLIC_BASE_URL`          | Production URL (e.g., `https://sponsra.app`) | **Production**           |
| `NEXT_PUBLIC_BASE_URL`          | Preview URL or `http://localhost:3000`       | **Preview, Development** |

**Note**: The same variable name can have different values depending on the environment scope. Vercel will automatically use the correct value based on where the code is deployed.

### 3. CI/CD Pipeline (GitHub Actions)

Database migrations are automated via `.github/workflows/deploy-migrations.yml`. This ensures the database schema always matches the deployed code.

#### Required GitHub Secrets

Go to **GitHub Repository** > Settings > Secrets and variables > Actions and add:

1. **`SUPABASE_ACCESS_TOKEN`**

   - Your personal access token from Supabase
   - Get it from: Supabase Dashboard > Account Settings > Access Tokens

2. **`SUPABASE_DB_URL_PROD`**

   - The Production Connection Pooler string
   - Format: `postgresql://postgres:[PASSWORD]@[PROJECT-REF].supabase.co:6543/postgres`
   - ⚠️ **Must use port 6543** (Connection Pooler)

3. **`SUPABASE_DB_URL_STAGING`**
   - The Staging Connection Pooler string
   - Format: `postgresql://postgres:[PASSWORD]@[PROJECT-REF].supabase.co:6543/postgres`
   - ⚠️ **Must use port 6543** (Connection Pooler)

#### Deployment Logic

- **Push to `main`** → Triggers `supabase db push` against **Production DB**
- **Push to any other branch** → Triggers `supabase db push` against **Staging DB**

The workflow file is located at: `.github/workflows/deploy-migrations.yml`

---

## 🔐 Environment Variables

### Complete List

#### Supabase (Required)

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL (public, browser-safe)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key (public, browser-safe)
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-only, bypasses RLS)

#### Stripe (Required)

- `STRIPE_SECRET_KEY` - Stripe API secret key (server-only)
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret (server-only)

#### App (Required)

- `NEXT_PUBLIC_BASE_URL` - Base URL for redirects (e.g., `http://localhost:3000` or `https://sponsra.app`)

### Where to Set Them

- **Local Development**: Create `.env.local` in project root (gitignored)
- **Vercel**: Set in Vercel Dashboard with proper environment scoping
- **GitHub Actions**: Set as repository secrets (for database URLs only)

---

## 💻 Local Development

### Starting the Development Environment

```bash
# 1. Start Supabase Local (requires Docker)
npx supabase start

# 2. Apply migrations
npx supabase db reset

# 3. Start Next.js dev server
npm run dev
```

### Making Schema Changes

1. **Edit your schema** or run migrations locally
2. **Create a migration**:
   ```bash
   npx supabase db diff -f name_of_migration
   ```
3. **Test locally**:
   ```bash
   npx supabase db reset  # Applies all migrations
   ```
4. **Push code**:
   ```bash
   git push origin feature/my-new-feature
   ```
   This triggers:
   - GitHub Action to migrate **Staging** database
   - Vercel to deploy a **Preview URL**

### Local Development Workflow

```bash
# Start Local DB
npx supabase start

# Make Schema Changes
# Edit your schema or run migrations locally
npx supabase db diff -f name_of_migration

# Push Code
git push origin feature/my-new-feature
```

This triggers the GitHub Action to migrate Staging, and Vercel to deploy a Preview URL.

---

## 🗄 Database Migrations

### Creating Migrations

```bash
# Create a new migration file
npx supabase migration new migration_name

# Or create from schema diff
npx supabase db diff -f migration_name
```

### Applying Migrations

```bash
# Local: Full reset (applies all migrations + seed)
npx supabase db reset

# Local: Incremental (production-like)
npx supabase migration up

# Remote: Via GitHub Actions (automatic on push)
# - Push to main → Production
# - Push to other branches → Staging
```

### Migration Files Location

All migrations are stored in: `supabase/migrations/`

---

## 💳 Stripe Setup

### 1. Create Stripe Account

- Sign up at [stripe.com](https://stripe.com)
- Enable **Stripe Connect** (required for this project)

### 2. Get API Keys

From Stripe Dashboard > Developers > API keys:

- **Test Mode Secret Key**: `sk_test_...` (for local/preview)
- **Live Mode Secret Key**: `sk_live_...` (for production)

### 3. Set Up Webhooks

#### Local Development

1. Install Stripe CLI:

   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe

   # Or download from: https://stripe.com/docs/stripe-cli
   ```

2. Login to Stripe CLI:

   ```bash
   stripe login
   ```

3. Forward webhooks to local server:

   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

4. Copy the webhook signing secret (starts with `whsec_`) and add to `.env.local`:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

#### Production/Preview

1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://your-domain.com/api/webhooks/stripe`
3. Select events: `checkout.session.completed`
4. Copy the **Signing secret** and add to Vercel environment variables

---

## 🛠 Useful Commands

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

### Supabase

```bash
# Start Supabase Local
npx supabase start

# Stop Supabase Local
npx supabase stop

# Check Supabase status (get connection info)
npx supabase status

# Reset database (applies all migrations)
npx supabase db reset

# Create new migration
npx supabase migration new migration_name

# Create migration from schema diff
npx supabase db diff -f migration_name

# Apply migrations incrementally
npx supabase migration up

# View database in Supabase Studio
npx supabase studio
```

### Git

```bash
# Create feature branch
git checkout -b feature/my-new-feature

# Push and trigger staging deployment
git push origin feature/my-new-feature

# Merge to main (triggers production deployment)
git checkout main
git merge feature/my-new-feature
git push origin main
```

---

## 🐛 Troubleshooting

### Supabase Local Won't Start

**Problem**: `npx supabase start` fails

**Solutions**:

- Ensure **Docker Desktop** is running
- Check Docker has enough resources allocated (Settings > Resources)
- Try: `npx supabase stop` then `npx supabase start` again

### Migration Fails in GitHub Actions

**Problem**: GitHub Action fails with connection error

**Solutions**:

- Verify you're using **Connection Pooler** (port **6543**), not direct connection (5432)
- Check `SUPABASE_DB_URL_PROD` and `SUPABASE_DB_URL_STAGING` secrets are set correctly
- Verify `SUPABASE_ACCESS_TOKEN` is valid and not expired

### Environment Variables Not Working in Vercel

**Problem**: App works locally but fails in Vercel

**Solutions**:

- Check environment variable scoping (Production vs Preview/Development)
- Ensure all required variables are set for the correct environment
- Redeploy after adding new variables (Vercel > Deployments > Redeploy)

### Stripe Webhook Not Working Locally

**Problem**: Webhook events not received locally

**Solutions**:

- Ensure Stripe CLI is running: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- Verify `STRIPE_WEBHOOK_SECRET` in `.env.local` matches the secret from Stripe CLI
- Check the webhook endpoint is accessible: `http://localhost:3000/api/webhooks/stripe`

### Database Connection Issues

**Problem**: Can't connect to Supabase

**Solutions**:

- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
- For local: Run `npx supabase status` to get current values
- For production: Check Supabase Dashboard > Settings > API

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Connect Documentation](https://stripe.com/docs/connect)
- [Vercel Documentation](https://vercel.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

---

## 📝 Notes

- This project uses **CSS Modules** (not Tailwind) for styling
- Database migrations are **automated** via GitHub Actions
- Always test migrations in **Staging** before pushing to `main`
- Use **Connection Pooler** (port 6543) for all remote database connections

---

**Last Updated**: January 2025
