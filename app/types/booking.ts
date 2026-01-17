export type BookingStatus =
  | "draft"
  | "pending_payment"
  | "paid"
  | "approved"
  | "rejected"
  | string;

export interface BookingInventoryTier {
  price?: number | null;
  name?: string | null;
  specs_headline_limit?: number | null;
  specs_body_limit?: number | null;
}

export interface Booking {
  id: string;
  created_at?: string | null;
  target_date: string;
  status: BookingStatus;
  ad_headline: string | null;
  ad_body: string | null;
  ad_link: string | null;
  sponsor_name: string | null;
  ad_image_path: string | null;
  inventory_tiers?: BookingInventoryTier | BookingInventoryTier[] | null;
}
