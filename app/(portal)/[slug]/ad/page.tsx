import { getNewsletterBySlug } from "@/lib/portal";
import { notFound } from "next/navigation";
import { Card } from "primereact/card";
import BookingForm from "./BookingForm";
import { InventoryTierPublic, NewsletterTheme } from "@/app/types/inventory";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function AdBookingPage({ params }: PageProps) {
  const { slug } = await params;
  const newsletter = await getNewsletterBySlug(slug);

  if (!newsletter) notFound();

  const adTiers: InventoryTierPublic[] = (
    newsletter.inventory_tiers || []
  ).filter((t: InventoryTierPublic) => t.type === "ad" && t.is_active);

  const theme: NewsletterTheme = (newsletter as any).theme_config || {
    primary_color: "#3b82f6",
    font_family: "sans",
    layout_style: "minimal",
  };

  return (
    <div
      className="min-h-screen surface-ground"
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--surface-ground)",
      }}
    >
      <BookingForm
        tiers={adTiers}
        newsletterName={newsletter.name}
        slug={slug}
        theme={theme}
      />
    </div>
  );
}
