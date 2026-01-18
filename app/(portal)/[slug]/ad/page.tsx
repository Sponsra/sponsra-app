import { getNewsletterBySlug } from "@/lib/portal";
import { notFound } from "next/navigation";
import BookingWizard from "./BookingWizard";
import { InventoryTierPublic, NewsletterTheme } from "@/app/types/inventory";
import styles from "./page.module.css";

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
    primary_color: "#6366f1",
    font_family: "sans",
    layout_style: "minimal",
  };

  return (
    <div className={styles.container}>
      <BookingWizard
        tiers={adTiers}
        newsletterName={newsletter.name}
        slug={slug}
        theme={theme}
      />
    </div>
  );
}
