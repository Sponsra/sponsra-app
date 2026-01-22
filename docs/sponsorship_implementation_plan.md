Sponsorship Booking Flow Implementation
Goal Description
The goal is to enable a distinct booking flow for "sponsorship" inventory, separate from the existing "ad" booking flow. Currently, there is only a /ad page which filters for ad tiers. We will create a /sponsorship page for sponsorship tiers and update the dashboard to allow creators to generate and share links for this new flow.

User Review Required
New Booking URL: We will introduce /[slug]/sponsorship for sponsorship bookings.
Dashboard Changes: "Share Link" dialog will now allow selecting between Ad and Sponsorship links.
Proposed Changes
Portal (Booking Flow)
[NEW] 
sponsorship/page.tsx
Create a new page based on 
app/(portal)/[slug]/ad/page.tsx
.
Logic:
Fetch newsletter by slug.
Filter inventory tiers for t.type === "sponsor".
Render 
BookingWizard
 with the sponsorship tiers.
Handle "Stripe not connected" state same as ad page.
Dashboard (Creator Tools)
[MODIFY] 
ShareLinkDialog.tsx
Add a selector for "Link Destination": "Ads Page" (/ad) vs "Sponsorships Page" (/sponsorship).
Update baseUrl logic to respect the selection.
Auto-switch destination if a tier is selected (e.g. if a Sponsor tier is picked, force or default to Sponsorship page).
[MODIFY] 
DashboardHeader.tsx
Update 
copyGenericLink
 to potentially ask which link to copy, or perhaps defaults to /ad.
Decision: For the quick "Share Link" button, we might leave it as /ad for now or change it to open a small menu.
Better approach: Let's stick to modifying 
ShareLinkDialog
 as the primary way to get specific links, and maybe add a secondary "Copy Sponsorship Link" action or just leave the main button as "Copy Ad Link" if ads are primary.
Refined Plan: Update 
DashboardHeader
 to have two generic copy buttons or a split button?
Let's keep it simple: 
ShareLinkDialog
 is the robust way.
For the main "Share Link" button, maybe we just verify if it implies ads? The user said "there is no sponsorship url link".
I will update 
DashboardHeader
 to have a simpler way to access the sponsorship link, perhaps by updating the tooltip or adding a second button/menu item if PrimeReact SplitButton is available (it is used in the project? I see Button import).
Let's stick to updating 
ShareLinkDialog
 first, and if 
DashboardHeader
 has a "Share Custom Link", that uses the dialog. The "Share Link" button is "Copy Generic Link". I will change "Share Link" to open a context menu (if easy) or just redirect the user to use the "Share Custom Link" dialog which will now handle both generic and custom links.
Actually, I will change the "Share Link" button to trigger an OverlayPanel or Menu to choose "Copy Ad Link" or "Copy Sponsorship Link". Or simply add a second button if space permits.
Let's check 
BookingWizard
 first to see if it needs changes.
Verification Plan
Manual Verification
Create Sponsorship Tier: Go to Inventory settings and create a tier with type "Sponsorship".
Visit Sponsorship Page: Navigate to http://localhost:3000/[slug]/sponsorship.
Verify only Sponsorship tiers are shown.
Verify Ad tiers are NOT shown.
Visit Ad Page: Navigate to http://localhost:3000/[slug]/ad.
Verify only Ad tiers are shown.
Dashboard Sharing:
Open "Share Custom Link" dialog.
Select "Sponsorship" type.
Verify generated link points to /sponsorship.
Select a Sponsorship tier -> Verify link updates to /sponsorship?tier=....