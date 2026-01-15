"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only using pathname after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  // Use pathname only after component has mounted to avoid hydration mismatch
  const currentPath = mounted ? pathname : "/dashboard";

  const navItems = [
    {
      label: "Dashboard",
      icon: "pi pi-home",
      href: "/dashboard",
      active: currentPath === "/dashboard",
    },
    {
      label: "Bookings",
      icon: "pi pi-calendar",
      href: "/dashboard",
      active: currentPath === "/dashboard",
    },
    {
      label: "Inventory",
      icon: "pi pi-box",
      href: "/dashboard",
      active: false,
    },
    {
      label: "Analytics",
      icon: "pi pi-chart-bar",
      href: "/dashboard",
      active: false,
    },
    {
      label: "Settings",
      icon: "pi pi-cog",
      href: "/dashboard/settings",
      active: currentPath === "/dashboard/settings",
    },
  ];

  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Image
            src="/logo.svg"
            alt="Sponsra"
            width={32}
            height={32}
            priority
            style={{ flexShrink: 0 }}
          />
          <span className="logo-text">Sponsra</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`nav-item ${item.active ? "active" : ""}`}
          >
            <i className={item.icon}></i>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="nav-item sign-out" onClick={handleSignOut}>
          <i className="pi pi-sign-out"></i>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
