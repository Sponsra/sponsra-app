"use client";

import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { TabView, TabPanel } from "primereact/tabview";
import { InventoryTier } from "@/app/types/inventory";

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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    // You could add a toast here via a callback prop, but button text change is often enough
  };

  return (
    <Dialog
      header="Share Booking Link"
      visible={visible}
      style={{ width: "30rem" }}
      onHide={onHide}
      modal
      className="p-fluid"
    >
      <div className="flex flex-column gap-4">
        <p className="m-0 text-secondary">
          Create a personalized link to send to a potential sponsor.
        </p>

        <div className="field">
          <label className="font-bold">Pre-select Tier (Optional)</label>
          <Dropdown
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.value)}
            options={tiers}
            optionLabel="name"
            placeholder="Let them choose..."
            showClear
          />
        </div>

        <div className="field">
          <label className="font-bold">Pre-fill Sponsor Name (Optional)</label>
          <InputText
            value={sponsorName}
            onChange={(e) => setSponsorName(e.target.value)}
            placeholder="e.g. Acme Corp"
          />
        </div>

        <div className="surface-100 p-3 border-round">
          <label className="text-xs font-bold text-500 uppercase">
            Generated Link
          </label>
          <div className="flex gap-2 mt-2">
            <InputText
              value={generatedLink}
              readOnly
              className="w-full text-sm"
            />
            <Button
              icon="pi pi-copy"
              onClick={copyToClipboard}
              severity="secondary"
              tooltip="Copy"
            />
          </div>
        </div>
      </div>
    </Dialog>
  );
}
