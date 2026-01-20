"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

interface RouteGuardProps {
    children: React.ReactNode;
    isSetupComplete: boolean;
}

export default function RouteGuard({
    children,
    isSetupComplete,
}: RouteGuardProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        // Logic:
        // If NOT complete, restrict everything except onboarding
        // If COMPLETE, restrict onboarding (send to dashboard)

        if (!isSetupComplete) {
            if (!pathname.startsWith("/onboarding")) {
                router.push("/onboarding");
            }
        }
        // Logic removed: We no longer auto-redirect FROM /onboarding if setup is complete.
        // This allows the user to finish the wizard (Step 3).
    }, [mounted, isSetupComplete, pathname, router]);

    // Prevent flash of content 
    // If we are redirecting, we might want to return null, 
    // but simpler to just render children and let the effect trigger.
    // Ideally we show a spinner if we are about to redirect, but simplistic for now:

    if (!mounted) return <>{children}</>;

    // Optional: Return minimal loader if invalid state to prevent flash?
    if (!isSetupComplete && !pathname.startsWith("/onboarding")) {
        return null;
    }
    // Logic removed: Allow rendering /onboarding even if Setup is complete.

    return <>{children}</>;
}
