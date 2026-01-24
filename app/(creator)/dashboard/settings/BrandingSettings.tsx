"use client";

import React, { useState, useRef } from "react";
import { Button } from "primereact/button";
import { ColorPicker } from "primereact/colorpicker";
import { Toast } from "primereact/toast";
import { updateBrandColor } from "@/app/actions/inventory";
import sharedStyles from "./shared.module.css";

interface BrandingSettingsProps {
  initialBrandColor: string;
}

export default function BrandingSettings({
  initialBrandColor,
}: BrandingSettingsProps) {
  const [brandColor, setBrandColor] = useState(initialBrandColor || "#0ea5e9");
  const [loading, setLoading] = useState(false);
  const toast = useRef<Toast>(null);

  const handleSave = async () => {
    setLoading(true);
    try {
      const result = await updateBrandColor(brandColor);
      if (result.success) {
        toast.current?.show({
          severity: "success",
          summary: "Saved",
          detail: "Brand color updated",
        });
      } else {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: result.error,
        });
      }
    } catch (e) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to save",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={sharedStyles.section}>
      <Toast ref={toast} />
      <div className={sharedStyles.sectionHeader}>
        <h2>Brand Color</h2>
        <p>Your brand color will be used for buttons and links in ads</p>
      </div>

      <div className="flex align-items-center gap-4">
        <div className={sharedStyles.field}>
          <div className="flex align-items-center gap-3">
            <ColorPicker
              value={brandColor.replace("#", "")}
              onChange={(e) => setBrandColor(`#${e.value}`)}
            />
            <span className="text-sm font-mono text-500">{brandColor}</span>
          </div>
        </div>

        <Button
          label="Save"
          icon="pi pi-save"
          onClick={handleSave}
          loading={loading}
          size="small"
        />
      </div>
    </div>
  );
}

