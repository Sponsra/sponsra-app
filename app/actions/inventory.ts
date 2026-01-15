// app/actions/inventory.ts
"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { TierFormData } from "@/app/types/inventory";

type ActionResponse = {
  success: boolean;
  error?: string;
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
  };

  let error;
  if (data.id) {
    // Update
    const res = await supabase
      .from("inventory_tiers")
      .update(payload)
      .eq("id", data.id)
      .eq("newsletter_id", newsletter.id);
    error = res.error;
  } else {
    // Insert
    const res = await supabase.from("inventory_tiers").insert(payload);
    error = res.error;
  }

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/settings");
  return { success: true };
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
