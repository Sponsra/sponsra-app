import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import RouteGuard from "./RouteGuard";

export default async function CreatorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch status
    const { data: newsletter } = await supabase
        .from("newsletters")
        .select("slug, inventory_tiers(id)")
        .eq("owner_id", user.id)
        .single();

    const hasSlug = !!newsletter?.slug;
    const hasInventory =
        Array.isArray(newsletter?.inventory_tiers) &&
        newsletter.inventory_tiers.length > 0;

    const isSetupComplete = hasSlug && hasInventory;

    return (
        <RouteGuard isSetupComplete={isSetupComplete}>
            {children}
        </RouteGuard>
    );
}
