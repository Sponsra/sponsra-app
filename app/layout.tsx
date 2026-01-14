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
        {/* The Theme Loader - Defaulting to Light Mode */}
        <link
          id="app-theme"
          rel="stylesheet"
          href="/themes/lara-light-indigo/theme.css"
        />
      </head>
      <body>
        <PrimeReactRegistry>
          <ThemeProvider>{children}</ThemeProvider>
        </PrimeReactRegistry>
      </body>
    </html>
  );
}
