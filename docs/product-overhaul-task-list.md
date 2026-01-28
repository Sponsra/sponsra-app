Inventory System Refactor - Task List

<!-- BEGIN COMPLETED TASKS -->
Planning & Analysis
 Review current database schema
 Review existing UI components and dependencies
 Create comprehensive implementation plan
 Finalize routing structure (inventory on /dashboard/inventory)
 Get user approval on plan
Database Migration
 Create new database schema migration file (20260125000001_products_schema.sql)
 Define new ENUMs (product_frequency, product_type, asset_kind, slot_status, booking_status)
 Create products table with RLS policies
 Create asset_requirements table with RLS policies
 Create inventory_slots table with RLS policies
 Create new bookings table with RLS policies
 Create booking_assets table with RLS policies
 Create indexes for performance
 Enable real-time on inventory_slots table
 Create storage bucket: sponsorship-assets
 Add storage RLS policies (upload/delete)
 Test migration locally with clean slate
Edge Functions (Slot Generation System)
 Create generate-slots Edge Function
 Implement frequency calculation logic (daily, weekly, monthly, yearly)
 Implement day-of-week matching for active_days
 Handle placements_per_issue slot creation
 Add error handling and logging to generate-slots
 Test slot generation locally for all frequencies
 Create cleanup-expired-holds Edge Function (cron)
 Implement 15-minute hold expiration logic
 Test hold cleanup logic locally
 Deploy Edge Functions to staging
 Configure cron schedule for cleanup function
Type Definitions
 Create types/product.ts with Product, ProductFormData types
 Define AssetRequirement, AssetKind, AssetConstraints types
 Define InventorySlot type with status enum
 Update types/booking.ts for new schema (remove ad_* fields, add booking_assets)
 Add ProductFrequency, ProductType enums
 Update types/inventory.ts (keep legacy for compatibility)
 Verify all type references throughout app
Server Actions
 Create actions/products.ts
 Implement createProduct (with asset requirements)
 Implement updateProduct
 Implement deleteProduct (archive)
 Implement getProducts(newsletterId)
 Implement getProduct(id) with asset requirements
 Create actions/inventory-slots.ts
 Implement generateSlotsForProduct (calls Edge Function)
 Implement getSlotsForProduct with booking status
 Implement holdSlot with 15-min TTL
 Implement releaseSlot
 Implement getAvailableDates for calendar UI
 Update actions/bookings.ts for new schema
 Modify createBooking to work with slots
 Add submitBookingAssets function
 Add image upload to Supabase Storage helper
Product Creation Wizard UI
 Create (creator)/dashboard/products/create/page.tsx
 Build Step 1: Product Details (name, price, type, description)
 Build Step 2: Availability Schedule (frequency, active_days, start_date, placements_per_issue)
 Build Step 3: Asset Requirements (headlines, images, links, body text)
 Add live preview panel (right side, shows sponsor form)
 Implement step navigation with progress indicator
 Create page.module.css - convert test template styles
 Map all colors to CSS variables from globals.css
 Implement drag-and-drop asset reordering
 Add constraint configuration UI (maxChars, aspectRatio)
 Add visual format selection cards
 Integrate with createProduct server action
 Call generateSlotsForProduct after product creation
 Add form validation and error handling
 Test product creation end-to-end
 Verify slot generation triggers correctly
Product Edit UI
 Create (creator)/dashboard/products/[id]/edit/page.tsx
 Reuse wizard components with pre-filled data
 Show tabs instead of stepper (allow jumping between sections)
 Load existing product with asset requirements
 Implement save changes functionality
 Redirect to /dashboard/inventory after save
 Test editing existing products
Inventory Management UI Updates
 Update (creator)/dashboard/inventory/page.tsx
 Change header from "Placements" to "Products"
 Update data fetching from inventory_tiers to products
 Include asset_requirements in product query
 Pass products to InventoryManager
 Move settings/InventoryManager.tsx to inventory/InventoryManager.tsx
 Update InventoryManager: Change "New Placement" to "New Product"
 Update InventoryManager: Navigate to /dashboard/products/create (not modal)
 Remove TierFormDialog import and usage
 Update InventoryManager to use ProductTable
 Keep Delete confirmation dialog in InventoryManager
 Create inventory/ProductTable.tsx (from InventoryTable.tsx)
 Display product name, type, frequency, price
 Show slot availability (X booked / Y total)
 Edit button navigates to /dashboard/products/[id]/edit
 Delete button archives product
 Add format column with visual indicators
 Test inventory page with products
Image Upload Component
 Create components/ImageUpload.tsx
 Implement drag & drop functionality
 Add aspect ratio validation
 Add file type validation (jpg, png, webp)
 Upload to sponsorship-assets bucket
 Generate public URL for storage
 Add image preview/thumbnail
 Handle upload errors gracefully

 <!-- END COMPLETED TASKS -->

 <!-- BEGIN INCOMPLETE TASKS -->
Sponsor Booking Flow Updates
 Update (portal)/[slug]/ad/page.tsx to fetch products
 Update BookingWizard.tsx for new product system
 Display available products instead of inventory_tiers
 Show product descriptions and pricing
 Create steps/StepSubmitAssets.tsx (dynamic form)
 Render inputs based on asset_kind (headline, body, image, link)
 Show labels, helper text, constraints from asset_requirements
 Implement constraint validation (maxChars, aspectRatio)
 Integrate ImageUpload for image assets
 Handle URL validation for link assets
 Update slot selection with hold/release logic
 Implement 15-minute slot hold during checkout
 Update checkout process for new booking schema
 Update booking confirmation
 Test real-time slot availability updates
 Test booking flow end-to-end
Dashboard & Admin Updates
 Update (creator)/dashboard/page.tsx for new schema
 Update booking queries to use new tables
 Calculate stats based on products/slots
 Update RequiresAttention.tsx component
 Update UpNext.tsx component
 Update bookings/BookingsTable.tsx
 Display submitted booking_assets in table
 Link to products instead of tiers
 Add asset preview/thumbnails in booking table
 Test dashboard with new data structure
Testing & Validation
 Test product creation wizard all 3 steps
 Test slot generation for daily frequency
 Test slot generation for weekly frequency
 Test slot generation for monthly frequency
 Test slot generation for yearly frequency
 Test multiple placements_per_issue (2, 3, etc.)
 Test product editing and updates
 Test sponsor booking with headline asset
 Test sponsor booking with body text asset
 Test sponsor booking with image asset
 Test sponsor booking with link asset
 Test image upload and storage
 Test constraint validation (maxChars)
 Test aspect ratio validation for images
 Test slot hold during checkout
 Verify expired hold cleanup works (wait 16+ min)
 Test real-time slot updates in calendar
 Test booking approval workflow
 Verify creator RLS policies (CRUD products)
 Verify public RLS policies (view products)
 Verify sponsor RLS policies (create bookings)
 Load test with multiple concurrent bookings
Deployment & Cleanup
 Deploy migrations to staging database
 Deploy Edge Functions to staging
 Configure storage buckets in staging (sponsorship-assets)
 Enable real-time on inventory_slots in staging
 Create test products in staging
 Verify slot generation in staging
 Test complete booking flow in staging
 Delete old settings/InventoryTable.tsx
 Delete old settings/InventoryManager.tsx
 Delete old settings/TierFormDialog.tsx
 Remove inventory_tiers table references
 Remove old booking schema code
 Update any remaining legacy code
 Document new schema in README
 Create user guide for product creation wizard
 Document Edge Function slot generation logic
 Update API documentation for new endpoints