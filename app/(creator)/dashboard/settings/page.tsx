import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "../Sidebar";
import AppearanceSettings from "./AppearanceSettings";
import NewsletterSettings from "./NewsletterSettings";
import InventoryManager from "./InventoryManager"; // <--- Import the manager
import styles from "./settings.module.css";

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

  const { data: tiers } = newsletter
    ? await supabase
        .from("inventory_tiers")
        .select("*")
        .eq("newsletter_id", newsletter.id)
        .order("price", { ascending: true })
    : { data: [] };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <div className="dashboard-header mb-6">
          <div>
            <h1>Settings</h1>
            <p className="dashboard-header-subtitle">
              Manage your newsletter, inventory, and preferences
            </p>
          </div>
        </div>

        <div className={styles.container}>
          <AppearanceSettings />

          <NewsletterSettings initialData={newsletter} />

          {/* FINAL COMPONENT ADDED */}
          <InventoryManager initialTiers={tiers || []} />
        </div>
      </div>
    </div>
  );
}
