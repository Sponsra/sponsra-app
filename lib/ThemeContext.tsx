"use client";
import React, { createContext, useState, useEffect } from "react";

// Available Lara theme colors according to PrimeReact documentation
// https://primereact.org/theming/
export type ThemeColor =
  | "indigo"
  | "blue"
  | "purple"
  | "teal"
  | "amber"
  | "cyan"
  | "pink";

export interface ThemeContextType {
  isDark: boolean;
  themeColor: ThemeColor;
  toggleTheme: () => void;
  setThemeColor: (color: ThemeColor) => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  themeColor: "indigo",
  toggleTheme: () => {},
  setThemeColor: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDark, setIsDark] = useState(false);
  const [themeColor, setThemeColorState] = useState<ThemeColor>("indigo");
  const [mounted, setMounted] = useState(false);

  // Load theme preferences from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const savedIsDark = localStorage.getItem("theme-dark") === "true";
    const savedColor = (localStorage.getItem("theme-color") ||
      "indigo") as ThemeColor;
    setIsDark(savedIsDark);
    setThemeColorState(savedColor);
    updateTheme(savedIsDark, savedColor);
  }, []);

  const updateTheme = (dark: boolean, color: ThemeColor) => {
    const themeLink = document.getElementById("app-theme") as HTMLLinkElement;
    if (themeLink) {
      const themeName = dark ? `lara-dark-${color}` : `lara-light-${color}`;
      themeLink.href = `/themes/${themeName}/theme.css`;
    }
  };

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem("theme-dark", String(newTheme));
    updateTheme(newTheme, themeColor);
  };

  const setThemeColor = (color: ThemeColor) => {
    setThemeColorState(color);
    localStorage.setItem("theme-color", color);
    updateTheme(isDark, color);
  };

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider
      value={{ isDark, themeColor, toggleTheme, setThemeColor }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
