"use client";
import React, { createContext, useState, useEffect } from "react";

export const ThemeContext = createContext({
  isDark: false,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    // This effectively swaps the CSS link tag in the head
    const themeLink = document.getElementById("app-theme") as HTMLLinkElement;
    if (themeLink) {
      themeLink.href = newTheme
        ? "/themes/lara-dark-indigo/theme.css"
        : "/themes/lara-light-indigo/theme.css";
    }
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
