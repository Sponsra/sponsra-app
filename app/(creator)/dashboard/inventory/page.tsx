import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "../Sidebar";
import ProductManager from "./ProductManager";
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

  // Fetch products with asset requirements
  const { data: products } = newsletter
    ? await supabase
      .from("products")
      .select(`
          *,
          asset_requirements (*)
        `)
      .eq("newsletter_id", newsletter.id)
      .eq("is_archived", false)
      .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <div className="dashboard-header mb-6">
          <div>
            <h1>Products</h1>
            <p className="dashboard-header-subtitle">
              Manage your sponsorship products &amp; inventory
            </p>
          </div>
        </div>

        <div className={styles.container}>
          <ProductManager
            initialProducts={products || []}
            newsletterId={newsletter?.id || ""}
          />
        </div>
      </div>
    </div>
  );
}

