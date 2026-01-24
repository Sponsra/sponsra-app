import { createClient } from "@/utils/supabase/server";

export async function getNewsletterBySlug(slug: string) {
  const supabase = await createClient();

  // Use select('*') to get all columns, including theme_config if it exists
  // This makes the query more resilient if the column hasn't been added yet
  const { data: newsletter, error } = await supabase
    .from("newsletters")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !newsletter) {
    return null;
  }

  // Fetch the owner's profile to check Stripe status
  const { data: ownerProfile } = await supabase
    .from("profiles")
    .select("stripe_account_id")
    .eq("id", newsletter.owner_id)
    .single();

  // Fetch inventory tiers separately for more reliability
  // Using .select() with explicit columns ensures RLS policies are respected
  const { data: tiers, error: tiersError } = await supabase
    .from("inventory_tiers")
    .select(
      "id, name, price, type, format, description, is_active, specs_headline_limit, specs_body_limit, specs_image_ratio, is_archived"
    )
    .eq("newsletter_id", newsletter.id)
    .eq("is_active", true) // Only fetch active tiers
    .eq("is_archived", false)
    .order("price", { ascending: true });

  if (tiersError) {
    // Return empty array for tiers if query fails
    return {
      ...newsletter,
      inventory_tiers: [],
      owner_profile: ownerProfile,
    };
  }

  return {
    ...newsletter,
    inventory_tiers: tiers || [],
    owner_profile: ownerProfile,
  };
}
