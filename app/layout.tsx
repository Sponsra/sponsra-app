import type { Metadata } from "next";
import PrimeReactRegistry from "./registry";
import { ThemeProvider } from "@/lib/ThemeContext";

import "./styles/globals.css";

// Core PrimeReact CSS (Structure only, no colors)
import "primereact/resources/primereact.min.css";

export const metadata: Metadata = {
  title: "Sponsra",
  description: "The Newsletter Infrastructure Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Google Fonts - Premium Typography */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* The Theme Loader - Defaulting to Light Mode */}
        <link
          id="app-theme"
          rel="stylesheet"
          href="/themes/lara-light-indigo/theme.css"
        />
      </head>
      <body suppressHydrationWarning>
        <PrimeReactRegistry>
          <ThemeProvider>{children}</ThemeProvider>
        </PrimeReactRegistry>
      </body>
    </html>
  );
}
