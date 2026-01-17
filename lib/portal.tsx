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

  // Fetch inventory tiers separately for more reliability
  // Using .select() with explicit columns ensures RLS policies are respected
  const { data: tiers, error: tiersError } = await supabase
    .from("inventory_tiers")
    .select(
      "id, name, price, type, description, is_active, specs_headline_limit, specs_body_limit, specs_image_ratio"
    )
    .eq("newsletter_id", newsletter.id)
    .eq("is_active", true) // Only fetch active tiers
    .order("price", { ascending: true });

  if (tiersError) {
    // Return empty array for tiers if query fails
    return {
      ...newsletter,
      inventory_tiers: [],
    };
  }

  return {
    ...newsletter,
    inventory_tiers: tiers || [],
  };
}
