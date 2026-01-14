import { getNewsletterBySlug } from "@/lib/portal";
import { notFound } from "next/navigation";
import { Card } from "primereact/card";
import BookingForm from "./BookingForm"; // Import the new component

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function AdBookingPage({ params }: PageProps) {
  const { slug } = await params;
  const newsletter = await getNewsletterBySlug(slug);

  if (!newsletter) notFound();

  const adTiers = newsletter.inventory_tiers.filter(
    (t: any) => t.type === "ad" && t.is_active
  );

  return (
    <div
      className="min-h-screen surface-ground flex justify-content-center p-4"
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--surface-ground)",
        padding: "2rem",
      }}
    >
      <div style={{ maxWidth: "500px", width: "100%" }}>
        <div className="text-center mb-5">
          <h1 className="text-3xl font-bold mb-2 text-900">
            {newsletter.name}
          </h1>
          <p className="text-xl text-600">Booking Portal</p>
        </div>

        <Card title="Book a Classified Ad">
          <BookingForm tiers={adTiers} newsletterName={newsletter.name} />
        </Card>
      </div>
    </div>
  );
}
