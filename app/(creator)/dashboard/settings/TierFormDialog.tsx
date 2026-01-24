"use client";

import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import { Message } from "primereact/message";
import { TabView, TabPanel } from "primereact/tabview"; // Re-imported
import { TierFormData, TierFormat, FORMAT_DEFAULTS } from "@/app/types/inventory";
import sharedStyles from "./shared.module.css";
import styles from "./TierFormDialog.module.css";
import { FormatPreview } from "./FormatPreview";

interface TierFormDialogProps {
  visible: boolean;
  onHide: () => void;
  onSave: (data: TierFormData) => Promise<void>;
  initialData?: Partial<TierFormData>;
  loading: boolean;
  newsletterId: string;
  onScheduleChange?: (any: any) => void;
}

export default function TierFormDialog({
  visible,
  onHide,
  onSave,
  initialData,
  loading,
}: TierFormDialogProps) {
  const [formData, setFormData] = useState<TierFormData>({
    name: "",
    type: "ad",
    format: "hero",
    price: 0,
    description: "",
    is_active: true,
    specs_headline_limit: 60,
    specs_body_limit: 280,
    specs_image_ratio: "1.91:1",
    available_days: [1, 2, 3, 4, 5],
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [editActiveIndex, setEditActiveIndex] = useState(0); // For Tabs in Edit Mode

  // Check if we are in Edit Mode (existing ID)
  const isEditMode = !!formData.id;

  useEffect(() => {
    if (visible) {
      setCurrentStep(0);
      setEditActiveIndex(0);
      setFormData({
        id: initialData?.id,
        name: initialData?.name || "",
        type: initialData?.type || "ad",
        format: initialData?.format || "hero",
        price: initialData?.price || 0,
        description: initialData?.description || "",
        is_active: initialData?.is_active ?? true,
        specs_headline_limit: initialData?.specs_headline_limit || 60,
        specs_body_limit: initialData?.specs_body_limit || 280,
        specs_image_ratio: initialData?.specs_image_ratio || "1.91:1",
        available_days: initialData?.available_days || [1, 2, 3, 4, 5],
      });
    }
  }, [visible, initialData]);

  const handleFormatChange = (format: TierFormat) => {
    const defaults = FORMAT_DEFAULTS[format];
    setFormData({
      ...formData,
      format,
      specs_headline_limit: defaults.specs_headline_limit,
      specs_body_limit: defaults.specs_body_limit,
      specs_image_ratio: defaults.specs_image_ratio,
    });
  };

  const isStepValid = () => {
    if (currentStep === 0) {
      return formData.name.trim() !== "" && formData.price >= 0;
    }
    return true;
  };

  const handleNext = () => {
    if (isStepValid()) {
      setCurrentStep((prev) => Math.min(prev + 1, 2));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = () => {
    if (formData.name.trim() !== "" && formData.price >= 0) {
      onSave(formData);
    }
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

  const daysOfWeek = [
    { label: "Mon", value: 1 },
    { label: "Tue", value: 2 },
    { label: "Wed", value: 3 },
    { label: "Thu", value: 4 },
    { label: "Fri", value: 5 },
    { label: "Sat", value: 6 },
    { label: "Sun", value: 0 },
  ];

  const toggleDay = (day: number) => {
    const currentDays = formData.available_days || [];
    let newDays;
    if (currentDays.includes(day)) {
      newDays = currentDays.filter((d) => d !== day);
    } else {
      newDays = [...currentDays, day];
    }
    setFormData({ ...formData, available_days: newDays });
  };

  const steps = [
    { label: "Essentials", icon: "pi pi-tag" },
    { label: "Requirements", icon: "pi pi-sliders-h" },
    { label: "Schedule", icon: "pi pi-calendar" },
  ];

  // --- CONTENT RENDERERS ---

  const renderEssentialsContent = () => (
    <div className="flex flex-column gap-3 fadein animation-duration-300">
      <div className={sharedStyles.field}>
        <label>Ad Format</label>
        <div className={styles.formatCards}>
          {(["hero", "native", "link"] as TierFormat[]).map((format) => {
            const defaults = FORMAT_DEFAULTS[format];
            const isSelected = formData.format === format;
            let iconClass = "pi pi-image";
            if (format === "native") iconClass = "pi pi-align-left";
            if (format === "link") iconClass = "pi pi-link";

            return (
              <button
                key={format}
                type="button"
                className={`${styles.formatCard} ${isSelected ? styles.formatCardSelected : ""}`}
                onClick={() => handleFormatChange(format)}
              >
                <div className="w-full mb-3">
                  <FormatPreview format={format} />
                </div>
                <div className={styles.formatCardIcon}>
                  <i className={iconClass} style={{ fontSize: '1.5rem' }}></i>
                </div>
                <div className={styles.formatCardLabel}>{defaults.label}</div>
                <div className={styles.formatCardDesc}>{defaults.description}</div>
                {isSelected && <i className={`pi pi-check ${styles.formatCardCheck}`} />}
              </button>
            );
          })}
        </div>
        <small className="text-gray-500">Selecting a format pre-fills recommended limits</small>
      </div>

      <div className={sharedStyles.field}>
        <label htmlFor="name">Placement Name</label>
        <InputText
          id="name"
          value={formData.name}
          onChange={(e) =>
            setFormData({ ...formData, name: e.target.value })
          }
          placeholder="e.g., Primary Sponsor"
          required
          className={!formData.name.trim() && !isEditMode ? 'p-invalid' : ''} // Only show invalid in Wizard mode initially? or always
        />
        {!formData.name.trim() && <small className="p-error">Name is required.</small>}
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
  );

  const renderRequirementsContent = () => (
    <div className="flex flex-column gap-3 fadein animation-duration-300">
      <Message
        severity="info"
        text="These rules will be enforced when an advertiser uploads their creative."
        className="w-full mb-3"
      />

      <div className="formgrid grid">
        <div className="field col-6">
          <label htmlFor="headlineLimit">Headline Character Limit</label>
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
          {formData.format !== "link" && (
            <>
              <label htmlFor="bodyLimit">Body Character Limit</label>
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
            </>
          )}
        </div>
      </div>

      {formData.format !== "native" && formData.format !== "link" && (
        <div className={sharedStyles.field}>
          <label htmlFor="imageRatio">Creative Specs (Image)</label>
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
      )}
      {(formData.format === "native" || formData.format === "link") && (
        <div className={sharedStyles.field}>
          <label>Creative Specs</label>
          <div className="p-2 surface-100 border-round text-gray-600">
            <i className="pi pi-info-circle mr-2"></i>
            Images are not supported for this format.
          </div>
        </div>
      )}
    </div>
  );

  const renderScheduleContent = () => (
    <div className="flex flex-column gap-3 fadein animation-duration-300">
      <Message
        severity="info"
        text="Select the days of the week this ad tier is available."
        className="w-full mb-3"
      />
      <div className="flex flex-wrap gap-3">
        {daysOfWeek.map((day) => (
          <div key={day.value} className="flex align-items-center">
            <Checkbox
              inputId={`day_${day.value}`}
              onChange={() => toggleDay(day.value)}
              checked={formData.available_days?.includes(day.value) ?? false}
            />
            <label htmlFor={`day_${day.value}`} className="ml-2 cursor-pointer">
              {day.label}
            </label>
          </div>
        ))}
      </div>
      <div className="mt-4 text-sm text-gray-600">
        <i className="pi pi-info-circle mr-1"></i>
        Holidays and specific unavailable dates can be managed in <strong>Settings &gt; Availability Exceptions</strong>.
      </div>
    </div>
  );


  const renderFooter = () => (
    <div className="flex justify-content-between align-items-center w-full mt-4 pt-3 border-top-1 surface-border">
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
      <div className="flex gap-2">
        {/* EDIT MODE FOOTER: Just Cancel/Save */}
        {isEditMode ? (
          <>
            <Button
              label="Cancel"
              icon="pi pi-times"
              text
              onClick={onHide}
              disabled={loading}
            />
            <Button
              label="Save Changes"
              icon="pi pi-check"
              onClick={handleSubmit}
              loading={loading}
              disabled={!formData.name} // Basic check
            />
          </>
        ) : (
          /* WIZARD FOOTER */
          <>
            {currentStep === 0 ? (
              <Button
                label="Cancel"
                icon="pi pi-times"
                text
                onClick={onHide}
                disabled={loading}
              />
            ) : (
              <Button
                label="Back"
                icon="pi pi-arrow-left"
                outlined
                onClick={handleBack}
                disabled={loading}
              />
            )}

            {currentStep < 2 ? (
              <Button
                label="Next"
                icon="pi pi-arrow-right"
                iconPos="right"
                onClick={handleNext}
                disabled={!isStepValid()}
              />
            ) : (
              <Button
                label="Save Placement"
                icon="pi pi-check"
                onClick={handleSubmit}
                loading={loading}
                disabled={!isStepValid()}
              />
            )}
          </>
        )}
      </div>
    </div>
  );

  return (
    <Dialog
      visible={visible}
      style={{ width: "40rem", maxWidth: "95vw" }}
      header={formData.id ? `Edit Placement: ${formData.name}` : "Create New Placement"}
      modal
      className="p-fluid"
      footer={renderFooter()}
      onHide={onHide}
    >
      {/* If NEW: Show Stepper. If EDIT: No Stepper */}
      {!isEditMode && (
        <div className={styles.stepperHeader}>
          {steps.map((step, index) => {
            let stateClass = "";
            if (index === currentStep) stateClass = styles.stepActive;
            else if (index < currentStep) stateClass = styles.stepCompleted;

            return (
              <div key={index} className={`${styles.stepItem} ${stateClass}`}>
                <div className={styles.stepCircle}>
                  {index < currentStep ? <i className="pi pi-check"></i> : index + 1}
                </div>
                <span className={styles.stepLabel}>{step.label}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* If NEW: Show Wizard Content. If EDIT: Show TabView */}
      {!isEditMode ? (
        <div className="mt-4">
          {currentStep === 0 && renderEssentialsContent()}
          {currentStep === 1 && renderRequirementsContent()}
          {currentStep === 2 && renderScheduleContent()}
        </div>
      ) : (
        <TabView
          activeIndex={editActiveIndex}
          onTabChange={(e) => setEditActiveIndex(e.index)}
          className={styles.evenTabs}
        >
          <TabPanel header="Essentials" leftIcon="pi pi-tag">
            {renderEssentialsContent()}
          </TabPanel>
          <TabPanel header="Asset requirements" leftIcon="pi pi-sliders-h">
            {renderRequirementsContent()}
          </TabPanel>
          <TabPanel header="Schedule" leftIcon="pi pi-calendar">
            {renderScheduleContent()}
          </TabPanel>
        </TabView>
      )}
    </Dialog>
  );
}
