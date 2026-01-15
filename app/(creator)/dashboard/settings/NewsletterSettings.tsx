"use client";

import React, { useRef, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { updateNewsletterSettings } from "@/app/actions/inventory";
import styles from "./settings.module.css";

interface NewsletterSettingsProps {
  initialData: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export default function NewsletterSettings({
  initialData,
}: NewsletterSettingsProps) {
  const toast = useRef<Toast>(null);
  const [loading, setLoading] = useState(false);
  // If no data exists yet, default to empty strings
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await updateNewsletterSettings(
        formData.slug,
        formData.name
      );

      if (result.success) {
        toast.current?.show({
          severity: "success",
          summary: "Saved",
          detail: "Newsletter settings updated successfully",
        });
      } else {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: result.error || "Failed to save settings",
        });
      }
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "An unexpected error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.section}>
      <Toast ref={toast} />
      <div className={styles.sectionHeader}>
        <h2>General Configuration</h2>
        <p>Manage your public profile and URL</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className={styles.formGrid}>
          {/* Newsletter Name */}
          <div className={styles.field}>
            <label htmlFor="newsletterName">Newsletter Name</label>
            <InputText
              id="newsletterName"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g. The Daily Tech"
              required
            />
          </div>

          {/* URL Slug */}
          <div className={styles.field}>
            <label htmlFor="newsletterSlug">URL Slug</label>
            <div className="p-inputgroup">
              <span className="p-inputgroup-addon">sponsra.com/</span>
              <InputText
                id="newsletterSlug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                  })
                }
                placeholder="daily-tech"
                required
              />
            </div>
            <small style={{ color: "var(--text-color-secondary)" }}>
              This is the link you will share with sponsors.
            </small>
          </div>
        </div>

        <div className={styles.actions}>
          <Button
            label="Save Changes"
            icon="pi pi-save"
            loading={loading}
            type="submit"
          />
        </div>
      </form>
    </div>
  );
}
