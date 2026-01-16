"use client";

import React, { useState, useRef } from "react";
import { Button } from "primereact/button";
import { ColorPicker } from "primereact/colorpicker";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { updateNewsletterTheme } from "@/app/actions/inventory";
import { NewsletterTheme } from "@/app/types/inventory";
import NewsletterMockup from "../../../components/NewsletterMockup";
import styles from "./settings.module.css";

interface BrandingSettingsProps {
  initialTheme: NewsletterTheme;
  newsletterName: string;
}

export default function BrandingSettings({
  initialTheme,
  newsletterName,
}: BrandingSettingsProps) {
  const [theme, setTheme] = useState<NewsletterTheme>(
    initialTheme || {
      primary_color: "#3b82f6",
      font_family: "sans",
      layout_style: "minimal",
    }
  );
  const [loading, setLoading] = useState(false);
  const toast = useRef<Toast>(null);

  const handleSave = async () => {
    setLoading(true);
    try {
      const result = await updateNewsletterTheme(theme);
      if (result.success) {
        toast.current?.show({
          severity: "success",
          summary: "Saved",
          detail: "Branding updated",
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

  const fontOptions = [
    { label: "Sans Serif (Modern)", value: "sans" },
    { label: "Serif (Classic)", value: "serif" },
    { label: "Monospace (Tech)", value: "mono" },
  ];

  const layoutOptions = [
    { label: "Minimal (Clean Border)", value: "minimal" },
    { label: "Boxed (Card Style)", value: "boxed" },
  ];

  // Dummy content for the preview
  const previewContent = {
    sponsorName: "Your Sponsor",
    headline: "This is how your ads will look",
    body: "We use your selected fonts and colors to make the ad feel native to your newsletter. Adjust the settings on the left to test it out.",
    link: "https://example.com",
  };

  return (
    <div className={styles.section}>
      <Toast ref={toast} />
      <div className={styles.sectionHeader}>
        <h2>Look & Feel</h2>
        <p>Customize the email template used for ad previews</p>
      </div>

      <div className="grid">
        {/* LEFT: Controls */}
        <div className="col-12 md:col-5">
          <div className="flex flex-column gap-4">
            <div className={styles.field}>
              <label htmlFor="primaryColor">Brand Color</label>
              <div className="flex align-items-center gap-3">
                <ColorPicker
                  value={theme.primary_color.replace("#", "")}
                  onChange={(e) =>
                    setTheme({ ...theme, primary_color: `#${e.value}` })
                  }
                />
                <span className="text-sm font-mono text-500">
                  {theme.primary_color}
                </span>
              </div>
            </div>

            <div className={styles.field}>
              <label>Font Family</label>
              <Dropdown
                value={theme.font_family}
                options={fontOptions}
                onChange={(e) => setTheme({ ...theme, font_family: e.value })}
                className="w-full"
              />
            </div>

            <div className={styles.field}>
              <label>Ad Layout Style</label>
              <Dropdown
                value={theme.layout_style}
                options={layoutOptions}
                onChange={(e) => setTheme({ ...theme, layout_style: e.value })}
                className="w-full"
              />
            </div>

            <div className="mt-2">
              <Button
                label="Save Changes"
                icon="pi pi-save"
                onClick={handleSave}
                loading={loading}
              />
            </div>
          </div>
        </div>

        {/* RIGHT: Live Preview */}
        <div className="col-12 md:col-7">
          <div className="surface-50 border-round p-3 h-full flex align-items-center justify-content-center">
            <NewsletterMockup
              theme={theme}
              content={previewContent}
              newsletterName={newsletterName}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
