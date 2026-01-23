// app/actions/inventory.ts
"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import {
  TierFormData,
  NewsletterTheme,
  AvailabilityException,
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
    available_days: data.available_days || [1, 2, 3, 4, 5], // Default Mon-Fri if not specified
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
  revalidatePath("/dashboard/inventory");
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

// 5. Toggle Availability Exception (Add/Remove Date)
export async function toggleAvailabilityException(
  newsletterId: string,
  date: string // YYYY-MM-DD
): Promise<ActionResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  // Check ownership
  const { data: newsletter } = await supabase
    .from("newsletters")
    .select("id")
    .eq("id", newsletterId)
    .eq("owner_id", user.id)
    .single();

  if (!newsletter) return { success: false, error: "Newsletter not found." };

  // Check if it exists
  const { data: existing } = await supabase
    .from("availability_exceptions")
    .select("id")
    .eq("newsletter_id", newsletterId)
    .eq("date", date)
    .single();

  let error;
  if (existing) {
    // Remove exception (Limit opened)
    const res = await supabase
      .from("availability_exceptions")
      .delete()
      .eq("id", existing.id);
    error = res.error;
  } else {
    // Add exception (Limit closed)
    const res = await supabase
      .from("availability_exceptions")
      .insert({
        newsletter_id: newsletterId,
        date: date,
        description: "Manually blocked",
      });
    error = res.error;
  }

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/settings");
  return { success: true };
}

// 6. Get Availability Exceptions
export async function getAvailabilityExceptions(
  newsletterId: string
): Promise<AvailabilityException[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("availability_exceptions")
    .select("*")
    .eq("newsletter_id", newsletterId);

  if (error) {
    console.error("Error fetching exceptions:", error);
    return [];
  }

  return data || [];
}
