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

Phase 5: polish and UI

- create a polished design and style
- Fonts and color theme and overall feel fo the application
- App should feel moderna nd friendly, but not sterile and dry. This should feel like a high end, polished product

Phase 6: Landing Page & Launch Prep
Goal: Marketing and Deployment configuration.

Step 6.1: Landing Page (Hero, Value Prop).

Step 6.2: Interactive "Bouncer" Demo.

Phase 7: The Rules Engine (Custom Constraints)
Goal: Allow creators to define the "physics" of their ad slots.

Research Findings:

Headlines: Range from 30 chars (Google Ads/TLDR Quick Links) to 90 chars (Morning Brew).

Body: Ranges from 140 chars (Tweet style) to 150 words (~800 chars) for Primary Sponsorships.

Images: Standard aspect ratios are 1:1 (Square), 1.91:1 (Landscape), or None (Text-only ads).

The Plan:

DB: Add configuration columns to inventory_tiers (char_limit_headline, char_limit_body, image_requirement).

UI: Update the Tier Form in the Dashboard to include an "Ad Specs" accordion.

Logic: Update the Portal's AdCreative form to enforce these specific limits dynamically.

Validation Check:

[ ] Creator can set headline limit (e.g., 60 chars) for a tier.

[ ] Creator can set body limit (e.g., 200 chars) for a tier.

[ ] Creator can require/allow/forbid images with aspect ratio constraints.

[ ] Portal form enforces limits in real-time with character counters.

[ ] "Bouncer" rejects submissions that exceed limits.

Phase 8: The Template Engine (Realistic Previews)
Goal: Make the "Live Preview" look like the creator's actual newsletter on both mobile and desktop and light and dark mode (40% of users are on dark mode)

The Problem: Currently, the preview is a generic grey card. It tells the sponsor nothing about how it will look in your email.

The Plan:

DB: Add a theme_config (JSON) column to newsletters to store brand colors, font family (Serif/Sans), and layout style.

UI: Add a "Look & Feel" tab to Settings.

Component: Build a NewsletterMockup component that wraps the ad in a 600px-wide email container with the creator's branding. Or different sized containers for a mobile view and a web view.

Validation Check:

[ ] Creator can set primary brand color, font family (Serif/Sans), and layout style.

[ ] Preview shows mobile (320px) and desktop (600px) views.

[ ] Preview supports light and dark mode toggle.

[ ] Preview accurately reflects the creator's branding choices.

[ ] Sponsor sees realistic preview before submitting.

Phase 9: The Export Engine (Copy-Paste Handoff)
Goal: Let creators move approved ads into Beehiiv/Substack/ConvertKit in 1 click.

The Plan:

UI: Add an "Export" dropdown to the Booking Review Modal.

Formats:

HTML (Email Ready): Standard table-based HTML with inline styles.

Markdown: For tech newsletters/Obsidian users.

Plain Text: Just the copy.

Validation Check:

[ ] Creator can export approved booking as HTML.

[ ] Creator can export approved booking as Markdown.

[ ] Creator can export approved booking as Plain Text.

[ ] HTML export is email-client compatible (table-based, inline styles).

[ ] Exported content can be pasted directly into newsletter platforms.

Phase 10: Smart Links ("Magic" Invites)
Goal: Personalize the booking experience like Calendly.

Concept: Instead of just sending sponsra.com/my-newsletter, you send sponsra.com/my-newsletter?sponsor=Acme&tier=main.

The Plan:

UI: Add a "Share" button to the Dashboard.

Feature: A modal where you pre-fill the Sponsor Name and select a Tier.

Output: Generates a custom link that skips the Tier Selection step and pre-fills the sponsor's name, reducing friction.

Validation Check:

[ ] Creator can generate a personalized booking link.

[ ] Link pre-fills sponsor name in the form.

[ ] Link pre-selects a specific tier (skips tier selection step).

[ ] Link works correctly when shared with sponsor.

[ ] Sponsor experience is streamlined with pre-filled data.

Phase 11 (Launch): Vercel Deployment & Domain Middleware (sponsra.link rewrite).
Step 11.1: Vercel Deployment
Push git repo to Vercel.
Configure Environment Variables (Supabase URLs, Stripe Keys).
Step 11.2: Domain Configuration
Map sponsra.app to the main project.
Map sponsra.link as a Middleware rewrite (or separate Vercel project if easier) to handle the portal routes.
Step 11.3: Smoke Test
Create a real account on the live site.
Book a real (test mode) ad.
Validation Check:
[ ] https://sponsra.app loads securely.
[ ] https://sponsra.link/demo/ad loads the portal.

Phase -- infinity
Ideas that can be implemented in any phase or at the end or never. Just ideas.

Ideas:

- Clean simple booking page with a centered calendar (maybe glassmorphism with a subtle gradient background?) so it feels light and creative. Then the background could be changed to fit the vibe of the newsletter.

- Opengraph image for what the sponsra.link will look like when a user pastes it into a text or eail or somewhere it will render.

How we will work:
I will provide the code for one specific step (e.g., Step 1.2).
You will implement it and run the Validation Check.
You will confirm "Green Light."
We move to the next step.

---

I am building a creator and sponsor tool for medium sized creators of newsletters. This tool with be the "calendly" of newsletter sponsorship booking and allow a creator to share a link with a sponsor where the sponsor can book an ad slot in the newsletter or choose a longer term sponsorship opportunity. The tool is called Sponsra. It is not trying to be a marketplace to connect creators and sponsors (those tools exist and the market is saturated there). Sponsra will consist of a creator dashboard at sponsra.app/dashboard/[creator-id] and a link to booking that will be sponsra.link/ad/booking or sponsra.link/sponsor/booking (or something of the sort, this naming is changeable to fit my needs) I have developed an implementation plan and I would like you to review it, understand it deeply, ask any questions you may have about the product of the tech stack or the implementation plan and then you will help me implement step by step. Here is the plan to get us started.
