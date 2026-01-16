"use client";

import { useState } from "react";
import { Button } from "primereact/button";
import ShareLinkDialog from "./ShareLinkDialog";
import type { InventoryTier } from "@/app/types/inventory";
import classes from "./DashboardHeader.module.css";

interface DashboardHeaderProps {
  newsletterName: string;
  newsletterSlug: string;
  tiers: InventoryTier[];
}

export default function DashboardHeader({
  newsletterName,
  newsletterSlug,
  tiers,
}: DashboardHeaderProps) {
  const [showShare, setShowShare] = useState(false);

  return (
    <div className={`dashboard-header ${classes.header}`}>
      <div>
        <h1 className={classes.title}>Dashboard</h1>
        <p className={classes.subtitle}>Welcome back, {newsletterName}</p>
      </div>

      <div className={classes.actions}>
        <Button label="New Booking" icon="pi pi-plus" className="modern-button" />
        <Button
          label="Share Link"
          icon="pi pi-share-alt"
          onClick={() => setShowShare(true)}
        />
        <ShareLinkDialog
          visible={showShare}
          onHide={() => setShowShare(false)}
          tiers={tiers}
          newsletterSlug={newsletterSlug}
        />
      </div>
    </div>
  );
}
