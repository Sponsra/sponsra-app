"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { TierFormData } from "@/app/types/inventory";

type ActionResponse = {
    success: boolean;
    error?: string;
    slug?: string;
};

// Step 1: Newsletter Setup
export async function setupNewsletter(name: string): Promise<ActionResponse> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthorized" };

    // Simple slug generation: "Test Newsletter" -> "test-newsletter"
    let slug = name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");

    // Fallback for empty slug
    if (!slug) slug = `newsletter-${Date.now()}`;

    // First check if slug exists (client side should do this too, but safety first)
    const { data: existing } = await supabase
        .from("newsletters")
        .select("id")
        .eq("slug", slug)
        .single();

    if (existing) {
        // Append random number if taken (simplified for MVP)
        slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
    }

    // Check if user already has a newsletter
    const { data: userNewsletter } = await supabase
        .from("newsletters")
        .select("id")
        .eq("owner_id", user.id)
        .single();

    let error;

    if (userNewsletter) {
        // Update existing
        const res = await supabase
            .from("newsletters")
            .update({ name, slug })
            .eq("id", userNewsletter.id);
        error = res.error;
    } else {
        // Create new
        const res = await supabase
            .from("newsletters")
            .insert({
                owner_id: user.id,
                name,
                slug,
            });
        error = res.error;
    }

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath("/(creator)", "layout");
    return { success: true, slug };
}

// Step 2: Inventory Setup
export async function setupInitialInventory(
    tierData: Partial<TierFormData>
): Promise<ActionResponse> {
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

    const payload = {
        newsletter_id: newsletter.id,
        name: tierData.name || "Standard Sponsorship",
        type: tierData.type || "sponsor",
        price: tierData.price || 50000,
        description: tierData.description || "Main sponsorship slot.",
        is_active: true,
        specs_headline_limit: 80,
        specs_body_limit: 280,
        specs_image_ratio: "1.91:1",
    };

    const { error } = await supabase.from("inventory_tiers").insert(payload);

    if (error) return { success: false, error: error.message };

    revalidatePath("/(creator)", "layout");
    return { success: true };
}
