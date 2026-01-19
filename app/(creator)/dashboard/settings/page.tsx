import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "../Sidebar";
import AppearanceSettings from "./AppearanceSettings";
import NewsletterSettings from "./NewsletterSettings";
import BrandingSettings from "./BrandingSettings";
import sharedStyles from "./shared.module.css";
import type { NewsletterTheme } from "@/app/types/inventory";

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

  // Default theme fallback
  const theme: NewsletterTheme = newsletter?.theme_config || {
    primary_color: "#6366f1",
    font_family: "sans",
    layout_style: "minimal",
  };

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
            initialTheme={theme}
            newsletterName={newsletter?.name || "Your Newsletter"}
          />
        </div>
      </div>
    </div>
  );
}
