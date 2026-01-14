Here is your Master Implementation Plan document. I have updated it to reflect the path-based routing for development and the 15-minute soft-lock logic.

I recommend saving the content below as IMPLEMENTATION_PLAN.md in the root of your project so we can reference it easily.

Sponsra Implementation Plan
Tech Stack: Next.js 15 (App Router), PrimeReact (UI), Supabase (Auth, DB, Storage, Edge Functions), Stripe Connect.

Phase 0: The Foundation (Current)
Goal: A stable Next.js 15 environment with PrimeReact styled correctly and Supabase Local running.

Step 0.1: Initialize Next.js 15 + PrimeReact + Tailwind CSS.

Step 0.2: Configure layout.tsx with the PrimeReact Provider and Theme (Lara Light/Dark Indigo).

Step 0.3: Initialize Supabase Local (npx supabase init + start) and Client setup.

Step 0.4: Set up .cursorrules for AI coding standards.

Validation Check:

[ ] npm run dev loads a page with a PrimeReact Button that is Indigo.

[ ] npx supabase status shows the API is running (Docker required).

[ ] The app builds without linting errors.

Phase 1: The "Creator's Office" (Dashboard)
Goal: A creator can log in and define inventory (Ads vs. Sponsorships).

Step 1.1: Authentication UI (/login) & Profile Trigger.

Step 1.2: Database Schema: newsletters and inventory_tiers.

Step 1.3: Dashboard Settings (/dashboard/settings) - Slug setup & Inventory management.

Validation Check:

[ ] Sign up as a new user (Supabase Auth).

[ ] Set newsletter slug (e.g., my-newsletter).

[ ] Create tiers (e.g., "Main Sponsor" - $500) and persist to DB.

Phase 2: The "Sponsor Experience" (Portal)
Goal: Public booking pages are live with "Bouncer" validation logic. Note: We will use path-based routing localhost:3000/portal/[slug] for development.

Step 2.1: Dynamic Routing (app/portal/[slug]/...) & Slug Resolver.

Step 2.2: Ad Portal UI - Calendar & Bouncer Form (Input validation).

Step 2.3: Live Preview Component (Real-time updates).

Validation Check:

[ ] Visiting /portal/my-newsletter/ad loads correct branding.

[ ] "Bouncer" rejects invalid inputs (e.g., low-res images).

[ ] Preview updates instantly as user types.

Phase 3: The "Transaction Engine"
Goal: Connecting Sponsor intent to Creator bank account.

Step 3.1: Booking Schema & Logic (Soft Lock: 15 mins).

Step 3.2: Stripe Connect Integration (Checkout Sessions & Webhooks).

Step 3.3: Creator Inbox (Approve/Reject Dashboard).

Validation Check:

[ ] Full flow: Select Date -> Pay (Stripe Test) -> Return.

[ ] DB updates status to paid.

[ ] Creator sees booking in dashboard.

Phase 4: The "Bouncer" Polish & Assets
Goal: Secure asset storage and delivery.

Step 4.1: Supabase Storage (Buckets & RLS).

Step 4.2: "Export HTML" feature for Creators.

Validation Check:

[ ] Sponsor uploads image; stored securely.

[ ] Creator views image.

[ ] "Copy HTML" generates valid code block.

Phase 5: Landing Page & Launch Prep
Goal: Marketing and Deployment configuration.

Step 5.1: Landing Page (Hero, Value Prop).

Step 5.2: Interactive "Bouncer" Demo.

Phase 6 (Launch): Vercel Deployment & Domain Middleware (sponsra.link rewrite).
Step 6.1: Vercel Deployment
Push git repo to Vercel.
Configure Environment Variables (Supabase URLs, Stripe Keys).
Step 6.2: Domain Configuration
Map sponsra.app to the main project.
Map sponsra.link as a Middleware rewrite (or separate Vercel project if easier) to handle the portal routes.
Step 6.3: Smoke Test
Create a real account on the live site.
Book a real (test mode) ad.
Validation Check:
[ ] https://sponsra.app loads securely.
[ ] https://sponsra.link/demo/ad loads the portal.
How we will work:
I will provide the code for one specific step (e.g., Step 1.2).
You will implement it and run the Validation Check.
You will confirm "Green Light."
We move to the next step.

---

I am building a creator and sponsor tool for medium sized creators of newsletters. This tool with be the "calendly" of newsletter sponsorship booking and allow a creator to share a link with a sponsor where the sponsor can book an ad slot in the newsletter or choose a longer term sponsorship opportunity. The tool is called Sponsra. It is not trying to be a marketplace to connect creators and sponsors (those tools exist and the market is saturated there). Sponsra will consist of a creator dashboard at sponsra.app/dashboard/[creator-id] and a link to booking that will be sponsra.link/ad/booking or sponsra.link/sponsor/booking (or something of the sort, this naming is changeable to fit my needs) I have developed an implementation plan and I would like you to review it, understand it deeply, ask any questions you may have about the product of the tech stack or the implementation plan and then you will help me implement step by step. Here is the plan to get us started.
