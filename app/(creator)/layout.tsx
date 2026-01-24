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

    // We no longer block access based on inventory/slug status
    // Users can access dashboard immediately after signup
    const isSetupComplete = true;

    return (
        <RouteGuard isSetupComplete={isSetupComplete}>
            {children}
        </RouteGuard>
    );
}
