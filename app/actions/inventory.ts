// app/actions/inventory.ts
"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import {
  TierFormData,
  NewsletterTheme,
  PublicationSchedule,
  AvailabilitySchedule,
} from "@/app/types/inventory";

type ActionResponse = {
  success: boolean;
  error?: string;
  tierId?: string; // For tier upsert, return the tier ID
};

// 1. Update Newsletter Details (Name/Slug)
export async function updateNewsletterSettings(
  slug: string,
  name: string
): Promise<ActionResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  const { error } = await supabase
    .from("newsletters")
    .update({ slug, name })
    .eq("owner_id", user.id);

  if (error) {
    if (error.code === "23505")
      return { success: false, error: "Slug already taken." };
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/settings");
  return { success: true };
}

// 2. Upsert Tier (Create or Update)
export async function upsertTier(data: TierFormData): Promise<ActionResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  // Get newsletter ID for security check
  const { data: newsletter } = await supabase
    .from("newsletters")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!newsletter) return { success: false, error: "Newsletter not found." };

  const payload = {
    newsletter_id: newsletter.id,
    name: data.name,
    type: data.type,
    price: data.price,
    description: data.description,
    is_active: data.is_active,
    specs_headline_limit: data.specs_headline_limit,
    specs_body_limit: data.specs_body_limit,
    specs_image_ratio: data.specs_image_ratio,
  };

  let error;
  let tierId = data.id;

  if (data.id) {
    // Update
    const res = await supabase
      .from("inventory_tiers")
      .update(payload)
      .eq("id", data.id)
      .eq("newsletter_id", newsletter.id);
    error = res.error;
  } else {
    // Insert - need to get the ID back
    const res = await supabase
      .from("inventory_tiers")
      .insert(payload)
      .select("id")
      .single();
    error = res.error;
    if (res.data) {
      tierId = res.data.id;
    }
  }

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/settings");
  return { success: true, tierId };
}

// 3. Delete Tier
export async function deleteTier(tierId: string): Promise<ActionResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  const { data: newsletter } = await supabase
    .from("newsletters")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!newsletter) return { success: false, error: "Newsletter not found." };

  const { error } = await supabase
    .from("inventory_tiers")
    .delete()
    .eq("id", tierId)
    .eq("newsletter_id", newsletter.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/settings");
  return { success: true };
}

// 4. Update Newsletter Theme
export async function updateNewsletterTheme(
  theme: NewsletterTheme
): Promise<ActionResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  const { error } = await supabase
    .from("newsletters")
    .update({ theme_config: theme })
    .eq("owner_id", user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/settings");
  return { success: true };
}

// 5. Update Newsletter Publication Schedule
export async function updateNewsletterSchedule(
  schedule: PublicationSchedule
): Promise<ActionResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  // Verify ownership
  const { data: newsletter } = await supabase
    .from("newsletters")
    .select("id")
    .eq("id", schedule.newsletter_id)
    .eq("owner_id", user.id)
    .single();

  if (!newsletter) return { success: false, error: "Newsletter not found." };

  const payload = {
    newsletter_id: schedule.newsletter_id,
    schedule_type: schedule.schedule_type,
    pattern_type: schedule.pattern_type,
    days_of_week: schedule.days_of_week,
    day_of_month: schedule.day_of_month,
    monthly_week_number: schedule.monthly_week_number,
    start_date: schedule.start_date,
    end_date: schedule.end_date,
    specific_dates: schedule.specific_dates,
  };

  let error;
  if (schedule.id) {
    // Update existing
    const res = await supabase
      .from("newsletter_publication_schedules")
      .update(payload)
      .eq("id", schedule.id)
      .eq("newsletter_id", schedule.newsletter_id);
    error = res.error;
  } else {
    // Insert new (upsert by newsletter_id - one schedule per newsletter)
    // First, delete any existing schedule for this newsletter
    await supabase
      .from("newsletter_publication_schedules")
      .delete()
      .eq("newsletter_id", schedule.newsletter_id);

    const res = await supabase
      .from("newsletter_publication_schedules")
      .insert(payload);
    error = res.error;
  }

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/settings");
  return { success: true };
}

// 6. Get Newsletter Publication Schedule
export async function getNewsletterSchedule(
  newsletterId: string
): Promise<PublicationSchedule | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("newsletter_publication_schedules")
    .select("*")
    .eq("newsletter_id", newsletterId)
    .single();

  if (error) {
    console.log("[getNewsletterSchedule] Error fetching schedule:", error);
    return null;
  }

  if (!data) {
    console.log(
      "[getNewsletterSchedule] No schedule found for newsletter:",
      newsletterId
    );
    return null;
  }

  const schedule = {
    id: data.id,
    newsletter_id: data.newsletter_id,
    schedule_type: data.schedule_type,
    pattern_type: data.pattern_type,
    days_of_week: data.days_of_week,
    day_of_month: data.day_of_month,
    monthly_week_number: data.monthly_week_number,
    start_date: data.start_date,
    end_date: data.end_date,
    specific_dates: data.specific_dates,
    created_at: data.created_at,
  };

  console.log("[getNewsletterSchedule] Retrieved schedule:", {
    newsletterId,
    schedule_type: schedule.schedule_type,
    pattern_type: schedule.pattern_type,
    days_of_week: schedule.days_of_week,
    day_of_month: schedule.day_of_month,
    monthly_week_number: schedule.monthly_week_number,
    start_date: schedule.start_date,
    end_date: schedule.end_date,
    specific_dates: schedule.specific_dates,
    rawData: data,
  });

  return schedule;
}

// 7. Upsert Tier Availability Schedule
export async function upsertTierAvailability(
  tierId: string,
  schedule: AvailabilitySchedule
): Promise<ActionResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  // Verify ownership
  const { data: tier } = await supabase
    .from("inventory_tiers")
    .select("newsletter_id, newsletters!inner(owner_id)")
    .eq("id", tierId)
    .single();

  if (!tier || (tier.newsletters as any).owner_id !== user.id) {
    return { success: false, error: "Tier not found or unauthorized." };
  }

  const payload = {
    tier_id: tierId,
    schedule_type: schedule.schedule_type,
    pattern_type: schedule.pattern_type,
    days_of_week: schedule.days_of_week,
    day_of_month: schedule.day_of_month,
    monthly_week_number: schedule.monthly_week_number,
    start_date: schedule.start_date,
    end_date: schedule.end_date,
    specific_dates: schedule.specific_dates,
    is_available: schedule.is_available ?? true,
    capacity: schedule.capacity ?? 1,
  };

  let error;
  if (schedule.id) {
    // Update existing
    const res = await supabase
      .from("tier_availability_schedules")
      .update(payload)
      .eq("id", schedule.id)
      .eq("tier_id", tierId);
    error = res.error;
  } else {
    // Insert new (upsert by tier_id - one schedule per tier)
    // First, delete any existing schedule for this tier
    await supabase
      .from("tier_availability_schedules")
      .delete()
      .eq("tier_id", tierId);

    const res = await supabase
      .from("tier_availability_schedules")
      .insert(payload);
    error = res.error;
  }

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/settings");
  return { success: true };
}

// 8. Get Tier Availability Schedule
export async function getTierAvailability(
  tierId: string
): Promise<AvailabilitySchedule | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tier_availability_schedules")
    .select("*")
    .eq("tier_id", tierId)
    .single();

  if (error) {
    console.log("[getTierAvailability] Error fetching schedule:", error);
    return null;
  }

  if (!data) {
    console.log("[getTierAvailability] No schedule found for tier:", tierId);
    return null;
  }

  const schedule = {
    id: data.id,
    tier_id: data.tier_id,
    schedule_type: data.schedule_type,
    pattern_type: data.pattern_type,
    days_of_week: data.days_of_week,
    day_of_month: data.day_of_month,
    monthly_week_number: data.monthly_week_number,
    start_date: data.start_date,
    end_date: data.end_date,
    specific_dates: data.specific_dates,
    is_available: data.is_available,
    capacity: data.capacity,
    created_at: data.created_at,
  };

  console.log("[getTierAvailability] Retrieved schedule:", {
    tierId,
    schedule_type: schedule.schedule_type,
    pattern_type: schedule.pattern_type,
    days_of_week: schedule.days_of_week,
    day_of_month: schedule.day_of_month,
    monthly_week_number: schedule.monthly_week_number,
    start_date: schedule.start_date,
    end_date: schedule.end_date,
    specific_dates: schedule.specific_dates,
    is_available: schedule.is_available,
    capacity: schedule.capacity,
    rawData: data,
  });

  return schedule;
}
