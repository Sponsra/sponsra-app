"use client";

import React, { useState, useEffect, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { InventoryTier } from "@/app/types/inventory";
import styles from "./ShareLinkDialog.module.css";

interface ShareLinkDialogProps {
  visible: boolean;
  onHide: () => void;
  tiers: InventoryTier[];
  newsletterSlug: string;
}

export default function ShareLinkDialog({
  visible,
  onHide,
  tiers,
  newsletterSlug,
}: ShareLinkDialogProps) {
  const [selectedTier, setSelectedTier] = useState<InventoryTier | null>(null);
  const [sponsorName, setSponsorName] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const toast = useRef<Toast>(null);

  // Base URL (client-side)
  const baseUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/${newsletterSlug}/ad`
      : `/${newsletterSlug}/ad`;

  // Generate link whenever inputs change
  useEffect(() => {
    const params = new URLSearchParams();

    if (selectedTier) {
      params.set("tier", selectedTier.id);
    }

    if (sponsorName) {
      params.set("sponsor", sponsorName);
    }

    const queryString = params.toString();
    setGeneratedLink(queryString ? `${baseUrl}?${queryString}` : baseUrl);
  }, [selectedTier, sponsorName, baseUrl]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      toast.current?.show({
        severity: "success",
        summary: "Copied!",
        detail: "Custom booking link copied to clipboard.",
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
    <>
      <Dialog
        header={
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <i className="pi pi-share-alt text-primary"></i>
            <span>Create Custom Booking Link</span>
          </div>
        }
        visible={visible}
        style={{ width: "32rem" }}
        breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        onHide={onHide}
        modal
        className="p-fluid"
        pt={{
          header: {
            style: {
              background: "var(--color-bg-white)",
              borderBottom: "1px solid var(--color-border)",
              padding: "1.5rem",
            },
          },
          content: { style: { padding: "1.5rem" } },
        }}
      >
        <div className={styles.content}>
          <p className={styles.description}>
            Create a personalized link with pre-configured options to send to a
            potential sponsor. The link will automatically pre-select a tier
            and/or pre-fill the sponsor name when opened.
          </p>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="tier-select">
              Pre-select Tier
              <span className={styles.labelOptional}>(Optional)</span>
            </label>
            <Dropdown
              id="tier-select"
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.value)}
              options={tiers}
              optionLabel="name"
              placeholder="Let them choose..."
              showClear
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="sponsor-name">
              Pre-fill Sponsor Name
              <span className={styles.labelOptional}>(Optional)</span>
            </label>
            <InputText
              id="sponsor-name"
              value={sponsorName}
              onChange={(e) => setSponsorName(e.target.value)}
              placeholder="e.g. Acme Corp"
            />
          </div>

          <div className={styles.linkSection}>
            <label className={styles.linkLabel}>Generated Link</label>
            <div className={styles.linkContainer}>
              <InputText
                value={generatedLink}
                readOnly
                className={styles.linkInput}
              />
              <Button
                icon="pi pi-copy"
                onClick={copyToClipboard}
                severity="secondary"
                tooltip="Copy to clipboard"
                className={styles.copyButton}
              />
            </div>
          </div>
        </div>
      </Dialog>
      <Toast ref={toast} />
    </>
  );
}
