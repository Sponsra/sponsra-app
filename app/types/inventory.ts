// app/types/inventory.ts

export type TierType = "ad" | "sponsor";
export type TierFormat = "hero" | "native" | "link";

// Default specs per format (used as templates when creating/editing tiers)
export const FORMAT_DEFAULTS = {
  hero: {
    label: "Primary",
    description: "Primary sponsorship with image",
    specs_headline_limit: 60,
    specs_body_limit: 280,
    specs_image_ratio: "1.91:1" as const,
  },
  native: {
    label: "Native",
    description: "Text-only mid-roll placement",
    specs_headline_limit: 80,
    specs_body_limit: 400,
    specs_image_ratio: "no_image" as const,
  },
  link: {
    label: "Classified",
    description: "Simple classified-style link (URL + text only)",
    specs_headline_limit: 100,
    specs_body_limit: 0, // No body text for Link format
    specs_image_ratio: "no_image" as const,
  },
} as const;

export interface InventoryTier {
  id: string; // UUID
  newsletter_id: string; // UUID
  name: string;
  type: TierType;
  format: TierFormat;
  price: number; // Stored in cents
  description: string | null;
  is_active: boolean;
  created_at?: string;
  specs_headline_limit: number;
  specs_body_limit: number;
  specs_image_ratio: "any" | "1:1" | "1.91:1" | "no_image";
  is_archived: boolean;
  available_days?: number[]; // 0=Sunday, 6=Saturday
}
// Tier data as returned from queries (public-facing, includes specs for validation)
export interface InventoryTierPublic {
  id: string;
  name: string;
  type: TierType;
  format: TierFormat;
  price: number; // Stored in cents
  description: string | null;
  is_active: boolean;
  specs_headline_limit: number;
  specs_body_limit: number;
  specs_image_ratio: "any" | "1:1" | "1.91:1" | "no_image";
  is_archived: boolean;
  available_days?: number[];
}

// Used for forms (ID is optional for new items)
export interface TierFormData {
  id?: string;
  name: string;
  type: TierType;
  format: TierFormat;
  price: number;
  description: string;
  is_active: boolean;
  specs_headline_limit: number;
  specs_body_limit: number;
  specs_image_ratio: "any" | "1:1" | "1.91:1" | "no_image";
  available_days?: number[];
}



// Availability Exception (Blackout Dates)
export interface AvailabilityException {
  id: string;
  newsletter_id: string;
  date: string; // YYYY-MM-DD
  description?: string;
  created_at?: string;
}

// Date availability status for datepicker
export interface DateAvailabilityStatus {
  date: string; // YYYY-MM-DD format
  status: "available" | "booked" | "unavailable";
  reason?: string; // For tooltips ("No newsletter this day", "Sold Out", "Tier unavailable")
}
