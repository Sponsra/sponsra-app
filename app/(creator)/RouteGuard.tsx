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
        setMounted(true);
    }, []);

    if (!mounted) return <>{children}</>;

    return <>{children}</>;
}
