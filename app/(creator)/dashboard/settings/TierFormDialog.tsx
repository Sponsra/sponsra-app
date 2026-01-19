"use client";

import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import { TabView, TabPanel } from "primereact/tabview";
import { Message } from "primereact/message";
import { TierFormData, AvailabilitySchedule } from "@/app/types/inventory";
import TierAvailabilitySection from "./TierAvailabilitySection";
import sharedStyles from "./shared.module.css";
import styles from "./TierFormDialog.module.css";

interface TierFormDialogProps {
  visible: boolean;
  onHide: () => void;
  onSave: (data: TierFormData) => Promise<void>;
  initialData?: Partial<TierFormData>;
  loading: boolean;
  newsletterId: string;
  onScheduleChange?: (schedule: AvailabilitySchedule | null) => void;
}

export default function TierFormDialog({
  visible,
  onHide,
  onSave,
  initialData,
  loading,
  newsletterId,
  onScheduleChange,
}: TierFormDialogProps) {
  const [formData, setFormData] = useState<TierFormData>({
    name: "",
    type: "ad",
    price: 0,
    description: "",
    is_active: true,
    specs_headline_limit: 60,
    specs_body_limit: 280,
    specs_image_ratio: "any",
  });

  const [activeIndex, setActiveIndex] = useState(0); // Track active tab

  useEffect(() => {
    if (visible) {
      setActiveIndex(0); // Reset to first tab on open
      setFormData({
        id: initialData?.id,
        name: initialData?.name || "",
        type: initialData?.type || "ad",
        price: initialData?.price || 0,
        description: initialData?.description || "",
        is_active: initialData?.is_active ?? true,
        specs_headline_limit: initialData?.specs_headline_limit || 60,
        specs_body_limit: initialData?.specs_body_limit || 280,
        specs_image_ratio: initialData?.specs_image_ratio || "any",
      });
    }
  }, [visible, initialData]);

  const handleSubmit = () => {
    if (!formData.name || formData.price < 0) {
      // Simple validation: switch to first tab if name is missing
      setActiveIndex(0);
      return;
    }
    onSave(formData);
  };

  const typeOptions = [
    { label: "Ad Slot", value: "ad" },
    { label: "Sponsorship", value: "sponsor" },
  ];

  const imageRatioOptions = [
    { label: "Any Aspect Ratio", value: "any" },
    { label: "Square (1:1)", value: "1:1" },
    { label: "Landscape (1.91:1)", value: "1.91:1" },
    { label: "No Image Allowed", value: "no_image" },
  ];

  // Footer includes the Main Actions + The Active Toggle
  const renderFooter = () => (
    <div className="flex justify-content-between align-items-center w-full">
      <div className="flex align-items-center">
        <Checkbox
          inputId="is_active"
          onChange={(e) =>
            setFormData({ ...formData, is_active: e.checked || false })
          }
          checked={formData.is_active}
        />
        <label htmlFor="is_active" className="ml-2 cursor-pointer">
          Active
        </label>
      </div>
      <div>
        <Button
          label="Cancel"
          icon="pi pi-times"
          text
          onClick={onHide}
          disabled={loading}
        />
        <Button
          label="Save Tier"
          icon="pi pi-check"
          onClick={handleSubmit}
          loading={loading}
        />
      </div>
    </div>
  );

  return (
    <Dialog
      visible={visible}
      style={{ width: "40rem", maxWidth: "95vw" }}
      header={formData.id ? `Edit ${formData.name}` : "Create New Tier"}
      modal
      className="p-fluid"
      footer={renderFooter()}
      onHide={onHide}
    >
      <TabView
        activeIndex={activeIndex}
        onTabChange={(e) => setActiveIndex(e.index)}
      >
        {/* --- TAB 1: ESSENTIALS --- */}
        <TabPanel header="Essentials" leftIcon="pi pi-tag">
          <div className="flex flex-column gap-3 mt-2">
            <div className={sharedStyles.field}>
              <label htmlFor="name">Tier Name</label>
              <InputText
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Primary Sponsor"
                required
              />
            </div>

            <div className="formgrid grid">
              <div className="field col-6">
                <label htmlFor="type">Type</label>
                <Dropdown
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.value })}
                  options={typeOptions}
                  optionLabel="label"
                />
              </div>
              <div className="field col-6">
                <label htmlFor="price">Price (USD)</label>
                <InputNumber
                  id="price"
                  value={formData.price ? formData.price / 100 : 0}
                  onValueChange={(e) =>
                    setFormData({ ...formData, price: (e.value || 0) * 100 })
                  }
                  mode="currency"
                  currency="USD"
                  locale="en-US"
                />
              </div>
            </div>

            <div className={sharedStyles.field}>
              <label htmlFor="description">Description (Internal)</label>
              <InputTextarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                placeholder="Notes about this tier..."
              />
            </div>
          </div>
        </TabPanel>

        {/* --- TAB 2: RULES / CONSTRAINTS --- */}
        <TabPanel header="Ad Rules" leftIcon="pi pi-list">
          <Message
            severity="info"
            text="These rules will be enforced when an advertiser uploads their creative."
            className="w-full mb-3"
          />

          <div className="flex flex-column gap-3">
            <div className="formgrid grid">
              <div className="field col-6">
                <label htmlFor="headlineLimit">Headline Max Length</label>
                <div className="p-inputgroup">
                  <InputNumber
                    id="headlineLimit"
                    value={formData.specs_headline_limit}
                    onValueChange={(e) =>
                      setFormData({
                        ...formData,
                        specs_headline_limit: e.value || 60,
                      })
                    }
                    min={10}
                    max={200}
                  />
                  <span className="p-inputgroup-addon">chars</span>
                </div>
              </div>
              <div className="field col-6">
                <label htmlFor="bodyLimit">Body Max Length</label>
                <div className="p-inputgroup">
                  <InputNumber
                    id="bodyLimit"
                    value={formData.specs_body_limit}
                    onValueChange={(e) =>
                      setFormData({
                        ...formData,
                        specs_body_limit: e.value || 280,
                      })
                    }
                    min={50}
                    max={5000}
                  />
                  <span className="p-inputgroup-addon">chars</span>
                </div>
              </div>
            </div>

            <div className={sharedStyles.field}>
              <label htmlFor="imageRatio">Image Requirement</label>
              <Dropdown
                id="imageRatio"
                value={formData.specs_image_ratio}
                options={imageRatioOptions}
                onChange={(e) =>
                  setFormData({ ...formData, specs_image_ratio: e.value })
                }
                optionLabel="label"
              />
            </div>
          </div>
        </TabPanel>

        {/* --- TAB 3: AVAILABILITY --- */}
        <TabPanel header="Schedule" leftIcon="pi pi-calendar">
          <TierAvailabilitySection
            tierId={formData.id}
            newsletterId={newsletterId}
            onScheduleChange={onScheduleChange}
          />
        </TabPanel>
      </TabView>
    </Dialog>
  );
}
