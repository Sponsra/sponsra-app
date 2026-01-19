"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({
  isOpen: controlledIsOpen,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  // Use controlled state if provided, otherwise use internal state
  const isOpen =
    controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = onClose || setInternalIsOpen;

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setInternalIsOpen(false);
    }
  };

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
      label: "Home",
      icon: "pi pi-home",
      href: "/dashboard",
      active: currentPath === "/dashboard",
    },
    {
      label: "Bookings",
      icon: "pi pi-calendar",
      href: "/dashboard/bookings",
      active: currentPath === "/dashboard/bookings",
    },
    {
      label: "Inventory",
      icon: "pi pi-box",
      href: "/dashboard/inventory",
      active: currentPath === "/dashboard/inventory",
    },
    // {
    //   label: "Analytics",
    //   icon: "pi pi-chart-bar",
    //   href: "/dashboard",
    //   active: false,
    // },
    {
      label: "Settings",
      icon: "pi pi-cog",
      href: "/dashboard/settings",
      active: currentPath === "/dashboard/settings",
    },
  ];

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isOpen && typeof window !== "undefined" && window.innerWidth <= 768) {
      handleClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        className="mobile-menu-button"
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
        aria-expanded={isOpen}
      >
        <i className="pi pi-bars"></i>
      </button>

      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="sidebar-backdrop"
          onClick={handleClose}
          aria-hidden="true"
        />
      )}
      <aside className={`dashboard-sidebar ${isOpen ? "open" : ""}`}>
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
          <button
            className="sidebar-close"
            onClick={handleClose}
            aria-label="Close menu"
          >
            <i className="pi pi-times"></i>
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`nav-item ${item.active ? "active" : ""}`}
              onClick={handleClose}
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
    </>
  );
}
