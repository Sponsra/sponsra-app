Inventory System Refactor - Implementation Plan
Overview
This refactor will transform the inventory management system from a rigid inventory_tiers structure to a flexible products + asset_requirements system. The new system allows newsletter creators to define custom sponsorship products with dynamic asset requirements (headlines, images, links, body text) that sponsors must provide during booking.

Key Changes
Schema Transformation
OLD: inventory_tiers table with fixed fields (ad_headline, ad_body, ad_link, ad_image_path)
NEW: products + asset_requirements + inventory_slots + bookings + booking_assets tables
UI Transformation
OLD: Basic tier creation form with fixed specs
NEW: 3-step product creation wizard with live preview of sponsor booking form
Architectural Decision & Recommendation
IMPORTANT

Modal vs. Dedicated Page

Current Setup: Your existing TierFormDialog uses a 3-step wizard in a modal dialog (480 lines of code).

Recommendation: Use a dedicated page (/dashboard/products/create) instead of a modal for the new product wizard.

Why?

Better UX: The new wizard is more complex (3 steps + live preview), and a full page provides more breathing room
Live Preview: Step 3 shows a side-by-side preview of the sponsor form, which needs horizontal space
Asset Management: Configuring multiple asset requirements with constraints works better with more screen real estate
Mobile Friendly: Easier to make responsive without modal constraints
URL State: Users can bookmark, share, or refresh mid-creation
Editing: Edit mode can use the same wizard with pre-filled data at /dashboard/products/[id]/edit
Trade-off: Requires navigation away from the inventory list, but provides much better creation experience.

NOTE

Inventory Table Structure

Keep your existing inventory management structure:

Location: /dashboard/inventory (dedicated inventory page)
Component: 
InventoryManager.tsx
 (currently in settings, will move to inventory directory)
Action Button: "New Product" → navigates to /dashboard/products/create
Table: 
InventoryTable.tsx
 → rename to ProductTable.tsx, update to display products
Edit: Table row edit button → navigates to /dashboard/products/[id]/edit
This maintains your existing inventory page structure while using dedicated pages for the complex wizard.

Proposed Changes
Phase 1: Database Schema Migration
[NEW] 
20260125000001_products_schema.sql
Complete new schema migration including:

New ENUMs: product_frequency, product_type, asset_kind, slot_status, booking_status (updated)
products table
asset_requirements table
inventory_slots table (replacing the concept of available dates)
New bookings and booking_assets tables
RLS policies for all tables
Performance indexes
Key Design Decisions:

inventory_slots are pre-generated based on product frequency/schedule
Each slot can have status: available, held, booked, locked
Asset requirements drive the sponsor booking form UI
booking_assets stores the actual content submitted by sponsors
Phase 2: Type Definitions
[MODIFY] 
types/inventory.ts
Add new types while keeping old ones temporarily for migration:

Product
 - represents a sponsorship product
AssetRequirement
 - defines what content sponsors must provide
AssetKind
 - enum for 'headline' | 'body' | 'image' | 'link'
AssetConstraints
 - validation rules (maxChars, aspectRatio, etc.)
InventorySlot - individual bookable unit
ProductFormData
 - for the creation wizard
[NEW] 
types/product.ts
Product-specific types separate from legacy inventory types.

[MODIFY] 
types/booking.ts
Update booking types to match new schema:

Remove ad_headline, ad_body, etc. fields
Add booking_assets relationship
Update 
BookingStatus
 enum
Phase 3: Server Actions
[NEW] 
actions/products.ts
New server actions for product management:

createProduct(data: ProductFormData) - Creates product + asset requirements
updateProduct(id: string, data: ProductFormData) - Updates product
deleteProduct(id: string) - Archives product
getProducts(newsletterId: string) - Lists all products
getProduct(id: string) - Gets single product with requirements
[NEW] 
actions/inventory-slots.ts
Inventory slot generation and management:

generateSlotsForProduct(productId: string, months: number) - Calls Edge Function to generate slots
getSlotsForProduct(productId: string) - Lists available slots with booking status
holdSlot(slotId: string, sessionId: string) - Temporary hold during checkout (15 min TTL)
releaseSlot(slotId: string) - Release expired holds
getAvailableDates(productId: string, startDate: Date, endDate: Date) - For calendar UI
[MODIFY] 
actions/bookings.ts
Update booking actions for new schema:

Modify createBooking to work with slots and asset submissions
Modify updateBookingStatus for new status workflow
Add submitBookingAssets(bookingId: string, assets: Record<string, string>)
[MODIFY] 
actions/inventory.ts
Keep existing actions for backward compatibility during migration, but deprecate tier-related functions.

Phase 4: Inventory Slot Generation System
IMPORTANT

Slot Generation Strategy

We'll use Supabase Edge Functions (Option A) for inventory slot generation because:

More flexible for complex scheduling logic
Easier to debug and test
Can be triggered manually or automatically
Better error handling and logging
[NEW] 
supabase/functions/generate-slots/index.ts
Edge Function that generates inventory slots based on product configuration:

// Algorithm:
// 1. Fetch product (frequency, active_days, start_date, placements_per_issue)
// 2. Loop through next 12 months day-by-day
// 3. For each date:
//    - Check if day-of-week matches active_days
//    - Check if date >= start_date
//    - Check frequency interval (weekly, monthly, etc.)
//    - If match, insert placements_per_issue slots
// 4. Set status = 'available' by default
Frequency Logic:

Daily: Every day in active_days
Weekly: Once per week on active_days (e.g., every Friday)
Monthly: First occurrence of active_day in each month (e.g., first Friday)
Yearly: Once per year on specific date
Example:

Product Config:
- frequency: 'weekly'
- active_days: ['Fri']  // 5 in JavaScript (0=Sun)
- start_date: '2026-01-24'
- placements_per_issue: 2
Result:
- 2026-01-24 (Fri): slot_index 1, slot_index 2
- 2026-01-31 (Fri): slot_index 1, slot_index 2
- 2026-02-07 (Fri): slot_index 1, slot_index 2
... (every Friday for 12 months)
[NEW] 
supabase/functions/cleanup-expired-holds/index.ts
Cron job Edge Function to release expired slot holds:

// Run every 5 minutes
// Find slots where status='held' AND held_at < now() - 15 minutes
// Update to status='available' and clear held_by_session_id
Database Modifications
Add to migration file:

-- Enable Real-time for inventory_slots (instant calendar updates)
ALTER PUBLICATION supabase_realtime ADD TABLE inventory_slots;
-- Storage bucket for sponsor-submitted images
INSERT INTO storage.buckets (id, name, public)
VALUES ('sponsorship-assets', 'sponsorship-assets', true);
-- Storage RLS: Anyone can upload, creators can delete their product's assets
CREATE POLICY "Public can upload assets" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'sponsorship-assets');
CREATE POLICY "Creators can delete their assets" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'sponsorship-assets' AND
    EXISTS (
      SELECT 1 FROM bookings b
      JOIN products p ON p.id = b.product_id
      WHERE p.creator_id = auth.uid()
      AND storage.foldername(name)[1] = b.id::text
    )
  );
Phase 5: Product Creation Wizard UI
[NEW] 
(creator)/dashboard/products/create/page.tsx
Full-page product creation wizard (adapted from test template):

Step 1: Product Details - Name, price, type (primary/secondary/classified), description
Step 2: Availability Schedule - Frequency (daily/weekly/monthly/yearly), active days, start date, placements per issue
Step 3: Asset Requirements - Configure what sponsors must provide (headlines, images, links, body text)
Live Preview - Right side shows real-time preview of sponsor booking form
Key Features:

Step navigation with progress indicator
Drag-and-drop asset reordering
Constraint configuration (maxChars, aspectRatio, fileTypes)
Visual format selection cards
Real-time form validation
[NEW] 
(creator)/dashboard/products/create/page.module.css
Wizard styles adapted from test template:

Replace hardcoded colors with CSS variables from 
globals.css
Use --primary-500, --color-border, --color-text-heading, etc.
Maintain the same visual structure but with consistent theming
Color Mapping:

/* Test Template → App Theme */
#2563eb → var(--primary-500)
#f3f4f6 → var(--color-bg-off-white)
#111827 → var(--color-text-heading)
#6b7280 → var(--color-text-body)
#e5e7eb → var(--color-border)
[NEW] 
(creator)/dashboard/products/create/ProductWizard.tsx
Client component for wizard logic (if separating from page.tsx):

Step navigation state
Form validation
Integration with createProduct action
Live preview of sponsor booking form
Phase 6: Inventory Management UI Updates
[MODIFY] 
(creator)/dashboard/inventory/page.tsx
Update inventory page to use products:

Change "Placements" to "Products" in header
Update data fetching from inventory_tiers to products
Include asset_requirements in product query
Pass products to updated 
InventoryManager
[MODIFY] 
(creator)/dashboard/inventory/InventoryManager.tsx
Move from /settings/ to /inventory/ directory and update:

Change "New Placement" button to "New Product"
Navigate to /dashboard/products/create instead of opening modal
Remove 
TierFormDialog
 import and usage (deprecated)
Update to use ProductTable instead of 
InventoryTable
Keep Delete confirmation dialog
Update terminology throughout
[NEW] 
(creator)/dashboard/inventory/ProductTable.tsx
Replaces 
InventoryTable.tsx
 to display products:

Show product name, type, frequency, price
Display slot availability (e.g., "12/52 booked")
Edit button → navigates to /dashboard/products/[id]/edit
Delete button → archives product
Format column with visual indicators
Columns:

| Name              | Type      | Frequency | Price   | Slots Used | Status | Actions        |
| Primary Sponsor   | Primary   | Weekly    | $500.00 | 12/52      | Active | [Edit][Delete] |
[NEW] 
(creator)/dashboard/products/[id]/edit/page.tsx
Edit page using same wizard component:

Pre-fill all fields from existing product
Show tabs instead of stepper (user can jump between sections)
Same validation and submission logic
After save → redirect back to /dashboard/inventory
Phase 7: Sponsor Booking Flow Updates
[MODIFY] 
(portal)/[slug]/ad/BookingWizard.tsx
Update to fetch products instead of inventory_tiers:

Display available products
Show product descriptions and pricing
Pass asset requirements to asset submission step
[NEW] 
(portal)/[slug]/ad/steps/StepSubmitAssets.tsx
Dynamic asset submission form (replaces current fixed form):

Render inputs based on asset_requirements
Show labels, helper text, constraints
Validate based on requirements (maxChars, aspectRatio, etc.)
Handle image uploads to Supabase Storage
Dynamic Form Logic:

assetRequirements.map(req => {
  if (req.kind === 'image') return <ImageUpload />;
  if (req.kind === 'body') return <Textarea maxLength={req.constraints.maxChars} />;
  if (req.kind === 'headline') return <Input maxLength={req.constraints.maxChars} />;
  if (req.kind === 'link') return <URLInput />;
})
[MODIFY] 
(portal)/[slug]/ad/page.tsx
Update to fetch products:

const products: ProductPublic[] = (
  newsletter.products || []
).filter((p: ProductPublic) => p.is_active);
Integration with Wizard:

// In ProductWizard after successful product creation
const handleSubmit = async () => {
  // 1. Create product + asset requirements
  const { productId } = await createProduct(formData);
  
  // 2. Trigger slot generation (12 months ahead)
  await generateSlotsForProduct(productId, 12);
  
  // 3. Redirect to inventory page
  router.push('/dashboard/inventory');
};
Phase 8: Dashboard & Admin Updates
[MODIFY] 
(creator)/dashboard/page.tsx
Update dashboard queries to use new schema:

Fetch bookings from new table structure
Calculate stats based on products/slots
Update "Requires Attention" logic
[MODIFY] 
(creator)/dashboard/bookings/BookingsTable.tsx
Update to display booking assets:

Show submitted assets in table
Link to product instead of tier
Display asset thumbnails/previews
[MODIFY] 
(creator)/dashboard/RequiresAttention.tsx
Update booking queries for new schema.

[MODIFY] 
(creator)/dashboard/UpNext.tsx
Update to fetch from new bookings table.

Verification Plan
Automated Tests
# 1. Test database migration
npm run supabase migration up
# 2. Test product creation
- Create product with all asset types
- Verify asset requirements saved correctly
- Check inventory slots generated
# 3. Test sponsor booking flow
- Select product
- Choose available slot
- Submit assets with constraints
- Verify validation works
# 4. Test RLS policies
- Creator can CRUD their products
- Public can view active products
- Sponsors can create bookings
- Creators can view their bookings
Manual Verification
Product Creation Wizard

Navigate to /dashboard/products/create
Complete all 3 steps
Verify live preview updates correctly
Check product saved to database
Sponsor Booking

Visit /{slug}/ad
Select a product
Verify dynamic asset form renders
Submit booking with all assets
Confirm booking appears in dashboard
Dashboard Updates

Check all stats reflect new schema
Verify booking table displays assets
Test editing/archiving products
Migration Rollout Strategy
Recommended Approach: Clean Slate for Staging
Since this is staging, I recommend:

Drop old tables (inventory_tiers, old bookings)
Create new schema from scratch
Seed with test data using the product wizard
This avoids complex data migration and gives us a clean start.

Steps:
Local Development (Current)

Apply new migrations locally
Deploy Edge Functions
Build all new components
Test end-to-end flows
Staging Deployment

Deploy migrations to staging database
Deploy Edge Functions to staging
Configure storage buckets
Enable real-time on inventory_slots
Create test products and verify slot generation
Future Production (if needed)

Write data migration script to convert old tiers → products
Schedule maintenance window
Backup production database
Run migrations
Monitor for issues
Files Summary
New Files (18)
supabase/migrations/20260125000001_products_schema.sql
supabase/functions/generate-slots/index.ts
supabase/functions/cleanup-expired-holds/index.ts
app/types/product.ts
app/actions/products.ts
app/actions/inventory-slots.ts
app/(creator)/dashboard/products/create/page.tsx
app/(creator)/dashboard/products/create/page.module.css
app/(creator)/dashboard/products/create/ProductWizard.tsx
app/(creator)/dashboard/products/page.tsx
app/(creator)/dashboard/products/ProductTable.tsx
app/(portal)/[slug]/ad/steps/StepSubmitAssets.tsx
app/components/ImageUpload.tsx (for asset submission)
Modified Files (12)
app/types/inventory.ts
app/types/booking.ts
app/actions/bookings.ts
app/actions/inventory.ts
 (deprecate tier functions)
app/(creator)/dashboard/inventory/page.tsx
 (update to use products)
app/(creator)/dashboard/inventory/InventoryManager.tsx (move from settings, update to products)
app/(creator)/dashboard/inventory/ProductTable.tsx (create from InventoryTable.tsx)
app/(portal)/[slug]/ad/BookingWizard.tsx
app/(portal)/[slug]/ad/page.tsx
app/(creator)/dashboard/page.tsx
app/(creator)/dashboard/bookings/BookingsTable.tsx
app/(creator)/dashboard/RequiresAttention.tsx
Routing Structure
Product Wizard Pages:

/dashboard/products/create - Full-page product creation wizard
/dashboard/products/[id]/edit - Edit existing product
Inventory Management (existing):

/dashboard/inventory - Main inventory page showing ProductTable
"New Product" button → navigates to /dashboard/products/create
Edit actions → navigate to /dashboard/products/[id]/edit
Why This Structure?

Keeps inventory list on dedicated /dashboard/inventory page
Uses full-page wizard for complex creation/editing
Clean separation of concerns
Maintains existing navigation structure
Deprecated (eventual cleanup)
Old inventory_tiers table
Old booking schema fields
/settings/InventoryTable.tsx
 component (moved to inventory directory, renamed to ProductTable)
/settings/InventoryManager.tsx
 component (moved to inventory directory)
/settings/TierFormDialog.tsx
 component (replaced by dedicated wizard pages)

