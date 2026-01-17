"use client";

import { useState, useRef } from "react";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
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
  const toast = useRef<Toast>(null);

  const copyGenericLink = async () => {
    const baseUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/${newsletterSlug}/ad`
        : `/${newsletterSlug}/ad`;

    try {
      await navigator.clipboard.writeText(baseUrl);
      toast.current?.show({
        severity: "success",
        summary: "Copied!",
        detail: "Generic booking link copied to clipboard.",
        life: 3000,
      });
    } catch {
      toast.current?.show({
        severity: "error",
        summary: "Copy failed",
        detail: "Unable to copy to clipboard. Please try again.",
        life: 3000,
      });
    }
  };

  return (
    <div className={`dashboard-header ${classes.header}`}>
      <div>
        <h1 className={classes.title}>Home</h1>
        <p className={classes.subtitle}>Welcome back, {newsletterName}</p>
      </div>

      <div className={classes.actions}>
        <Button
          label="Share Link"
          icon="pi pi-link"
          onClick={copyGenericLink}
          className="modern-button"
          severity="secondary"
          tooltip="Copy a standard booking link"
          tooltipOptions={{ position: "bottom" }}
        />
        <Button
          label="Share Custom Link"
          icon="pi pi-link"
          onClick={() => setShowShare(true)}
          className="modern-button"
          tooltip="Create a personalized booking link"
          tooltipOptions={{ position: "bottom" }}
        />
        <ShareLinkDialog
          visible={showShare}
          onHide={() => setShowShare(false)}
          tiers={tiers}
          newsletterSlug={newsletterSlug}
        />
        <Toast ref={toast} />
      </div>
    </div>
  );
}
