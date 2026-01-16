import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "../Sidebar";
import InventoryManager from "../settings/InventoryManager";
import styles from "./inventory.module.css";

export default async function InventoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: newsletter } = await supabase
    .from("newsletters")
    .select("id, name")
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
            <h1>Inventory</h1>
            <p className="dashboard-header-subtitle">
              Manage your ad slots and pricing
            </p>
          </div>
        </div>

        <div className={styles.container}>
          <InventoryManager initialTiers={tiers || []} />
        </div>
      </div>
    </div>
  );
}
