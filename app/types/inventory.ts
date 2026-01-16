// app/types/inventory.ts

export type TierType = "ad" | "sponsor";

export interface InventoryTier {
  id: string; // UUID
  newsletter_id: string; // UUID
  name: string;
  type: TierType;
  price: number; // Stored in cents
  description: string | null;
  is_active: boolean;
  created_at?: string;
  specs_headline_limit: number;
  specs_body_limit: number;
  specs_image_ratio: "any" | "1:1" | "1.91:1" | "no_image";
}
// Tier data as returned from queries (public-facing, includes specs for validation)
export interface InventoryTierPublic {
  id: string;
  name: string;
  type: TierType;
  price: number; // Stored in cents
  description: string | null;
  is_active: boolean;
  specs_headline_limit: number;
  specs_body_limit: number;
  specs_image_ratio: "any" | "1:1" | "1.91:1" | "no_image";
}

// Used for forms (ID is optional for new items)
export interface TierFormData {
  id?: string;
  name: string;
  type: TierType;
  price: number;
  description: string;
  is_active: boolean;
  specs_headline_limit: number;
  specs_body_limit: number;
  specs_image_ratio: "any" | "1:1" | "1.91:1" | "no_image";
}

// Newsletter theme configuration
export interface NewsletterTheme {
  primary_color: string;
  font_family: "sans" | "serif" | "mono";
  layout_style: "minimal" | "boxed";
}
