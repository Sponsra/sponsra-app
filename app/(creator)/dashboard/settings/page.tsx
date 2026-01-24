import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "../Sidebar";
import AppearanceSettings from "./AppearanceSettings";
import NewsletterSettings from "./NewsletterSettings";
import BrandingSettings from "./BrandingSettings";
import StripeSettings from "./StripeSettings";
import { getStripeStatus } from "@/app/actions/stripe-connect";
import sharedStyles from "./shared.module.css";


export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: newsletter } = await supabase
    .from("newsletters")
    .select("*")
    .eq("owner_id", user.id)
    .single();

  // Fetch Stripe status
  const stripeStatus = await getStripeStatus();

  // Fetch Stripe account ID
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_account_id")
    .eq("id", user.id)
    .single();



  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <div className="dashboard-header mb-6">
          <div>
            <h1>Settings</h1>
            <p className="dashboard-header-subtitle">
              Manage your newsletter and preferences
            </p>
          </div>
        </div>

        <div className={sharedStyles.container}>
          <AppearanceSettings />

          <NewsletterSettings initialData={newsletter} />

          {/* NEW: Branding Settings */}
          <BrandingSettings
            initialBrandColor={newsletter?.brand_color || "#0ea5e9"}
          />

          {/* NEW: Stripe Settings */}
          <StripeSettings
            stripeStatus={stripeStatus}
            stripeAccountId={profile?.stripe_account_id || null}
          />
        </div>
      </div>
    </div>
  );
}
