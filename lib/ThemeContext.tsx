"use client";
import React, { createContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Check if we're on a portal route (booking pages)
  const isPortalRoute = pathname?.includes("/ad") || false;

  // Always use cyan theme color
  const themeColor = "cyan";

  const updateTheme = (dark: boolean) => {
    // Don't update theme for portal routes
    if (isPortalRoute) {
      return;
    }
    // Switch PrimeReact theme CSS file - this updates all PrimeReact variables
    // Our custom variables are mapped to PrimeReact variables, so they update automatically
    const themeLink = document.getElementById("app-theme") as HTMLLinkElement;
    if (themeLink) {
      const themeName = dark
        ? `lara-dark-${themeColor}`
        : `lara-light-${themeColor}`;
      themeLink.href = `/themes/${themeName}/theme.css`;
    }
  };

  // Load theme preferences from localStorage on mount
  useEffect(() => {
    setMounted(true);
    // Skip theme loading for portal routes - they use fixed theme
    if (isPortalRoute) {
      return;
    }
    const savedIsDark = localStorage.getItem("theme-dark") === "true";
    setIsDark(savedIsDark);
    updateTheme(savedIsDark);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPortalRoute]);

  const toggleTheme = () => {
    // Don't allow theme changes on portal routes
    if (isPortalRoute) {
      return;
    }
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem("theme-dark", String(newTheme));
    updateTheme(newTheme);
  };

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
