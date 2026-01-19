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

// Schedule type definitions
export type ScheduleType = "recurring" | "one_off" | "all_dates";
export type PatternType =
  | "weekly"
  | "biweekly"
  | "monthly_date"
  | "monthly_day"
  | "custom";

// Newsletter publication schedule
export interface PublicationSchedule {
  id?: string;
  newsletter_id: string;
  schedule_type: ScheduleType;
  pattern_type?: PatternType | null; // nullable for one_off schedules
  days_of_week?: number[] | null; // Array of day numbers (0=Sunday, 6=Saturday)
  day_of_month?: number | null; // For monthly_date patterns (1-31)
  monthly_week_number?: number | null; // For monthly_day patterns (1-5)
  start_date: string; // YYYY-MM-DD format
  end_date?: string | null; // YYYY-MM-DD format, null = indefinite
  specific_dates?: string[] | null; // For one-off dates (YYYY-MM-DD format)
  created_at?: string;
}

// Tier availability schedule
export interface AvailabilitySchedule {
  id?: string;
  tier_id: string;
  schedule_type: ScheduleType;
  pattern_type?: PatternType | null; // nullable for one_off and all_dates schedules
  days_of_week?: number[] | null;
  day_of_month?: number | null;
  monthly_week_number?: number | null;
  start_date?: string | null; // nullable for all_dates
  end_date?: string | null;
  specific_dates?: string[] | null;
  is_available?: boolean; // Can mark dates as explicitly unavailable
  capacity?: number; // Allows multiple bookings per date (future-proofing)
  created_at?: string;
}

// Date availability status for datepicker
export interface DateAvailabilityStatus {
  date: string; // YYYY-MM-DD format
  status: "available" | "booked" | "unavailable";
  reason?: string; // For tooltips ("No newsletter this day", "Sold Out", "Tier unavailable")
}
