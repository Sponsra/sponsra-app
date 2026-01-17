import type { Metadata } from "next";
import PrimeReactRegistry from "../registry";

import "../styles/globals.css";

// Core PrimeReact CSS (Structure only, no colors)
import "primereact/resources/primereact.min.css";

export const metadata: Metadata = {
  title: "Sponsra - Booking Portal",
  description: "Book an ad in this newsletter",
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Fixed theme for portal pages - not affected by dashboard theme settings */}
      {/* ThemeProvider in root layout will skip theme updates for portal routes */}
      <link
        id="portal-theme"
        rel="stylesheet"
        href="/themes/lara-light-cyan/theme.css"
      />
      <PrimeReactRegistry>{children}</PrimeReactRegistry>
    </>
  );
}
