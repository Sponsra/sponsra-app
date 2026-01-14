import { createClient } from "@/utils/supabase/server";

export async function getNewsletterBySlug(slug: string) {
  const supabase = await createClient();

  const { data: newsletter, error } = await supabase
    .from("newsletters")
    .select(
      `
      id, 
      name, 
      description, 
      logo_url, 
      owner_id,
      inventory_tiers (
        id, name, price, type, description, is_active
      )
    `
    )
    .eq("slug", slug)
    .single();

  if (error || !newsletter) {
    return null;
  }

  return newsletter;
}
