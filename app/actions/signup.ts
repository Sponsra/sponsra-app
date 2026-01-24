"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

type ActionResponse = {
    success: boolean;
    error?: string;
    slug?: string;
};

export async function signupWithNewsletter(formData: {
    email: string;
    newsletterName: string;
    password: string;
}): Promise<ActionResponse> {
    const supabase = await createClient();
    const { email, password, newsletterName } = formData;

    // 1. Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/callback`,
        },
    });

    if (authError) {
        return { success: false, error: authError.message };
    }

    if (!authData.user) {
        return { success: false, error: "Signup failed. Please try again." };
    }

    // 2. Generate slug from newsletter name
    let slug = newsletterName
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");

    // Fallback for empty slug
    if (!slug) slug = `newsletter-${Date.now()}`;

    // Check if slug exists
    const { data: existing } = await supabase
        .from("newsletters")
        .select("id")
        .eq("slug", slug)
        .single();

    if (existing) {
        slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
    }

    // 3. Create the newsletter record linked to the new user
    const { error: dbError } = await supabase
        .from("newsletters")
        .insert({
            owner_id: authData.user.id,
            name: newsletterName,
            slug,
        });

    if (dbError) {
        // Note: The auth user is already created at this point. 
        // In a real prod app, we might want to delete the user or handle this more gracefully.
        // For now, returning the error is acceptable.
        console.error("Failed to create newsletter:", dbError);
        return { success: false, error: "Account created, but failed to set up newsletter. Please contact support." };
    }

    revalidatePath("/", "layout");
    return { success: true, slug };
}
