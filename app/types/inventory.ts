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
}

// Tier data as returned from queries (may not include all fields)
export interface InventoryTierPublic {
  id: string;
  name: string;
  type: TierType;
  price: number; // Stored in cents
  description: string | null;
  is_active: boolean;
}

// Used for forms (ID is optional for new items)
export interface TierFormData {
  id?: string;
  name: string;
  type: TierType;
  price: number;
  description: string;
  is_active: boolean;
}
