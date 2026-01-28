import { getNewsletterBySlug } from "@/lib/portal";
import { notFound } from "next/navigation";
import BookingWizard from "./BookingWizard";
import { getActiveProducts } from "@/app/actions/products";
import styles from "./page.module.css";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function AdBookingPage({ params }: PageProps) {
  const { slug } = await params;
  const newsletter = await getNewsletterBySlug(slug);

  if (!newsletter) notFound();

  // Security Check: If the owner hasn't connected Stripe, disable public booking.
  // This prevents users from accessing broken payment flows via direct URL guessing.
  const isStripeConnected = !!(newsletter as any).owner_profile?.stripe_account_id;

  // Fetch active products for this newsletter
  const products = await getActiveProducts(newsletter.id);

  // Use brand_color directly
  const brandColor = (newsletter as any).brand_color || "#0ea5e9";

  if (!isStripeConnected) {
    return (
      <div className={styles.container}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
          <div className="bg-slate-100 p-6 rounded-full mb-6">
            <i className="pi pi-lock text-4xl text-slate-400"></i>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Bookings Currently Unavailable</h1>
          <p className="text-slate-600 max-w-md">
            {newsletter.name} is not accepting bookings at the moment. Please check back later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <BookingWizard
        products={products}
        newsletterName={newsletter.name}
        slug={slug}
        brandColor={brandColor}
      />
    </div>
  );
}
