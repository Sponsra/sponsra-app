"use client";

import {
  useState,
  useEffect,
  ReactNode,
  createContext,
  useContext,
} from "react";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { createBookingWithAssets } from "@/app/actions/bookings";
import { Product } from "@/app/types/product";
import ImageUpload from "../components/ImageUpload";
import NewsletterMockup from "@/app/components/NewsletterMockup";
import styles from "./StepCreative.module.css";

interface StepCreativeContextType {
  headline: string;
  setHeadline: (value: string) => void;
  body: string;
  setBody: (value: string) => void;
  link: string;
  setLink: (value: string) => void;
  sponsorName: string;
  setSponsorName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  imagePath: string | null;
  setImagePath: (path: string | null) => void;
  loading: boolean;
  handleContinue: () => Promise<void>;
  isFormValid: () => boolean;
}

const StepCreativeContext = createContext<StepCreativeContextType | null>(null);

interface StepCreativeProviderProps {
  newsletterName: string;
  bookingId: string;
  slotId: string;
  product: Product;
  newsletterSlug: string;
  brandColor: string;
  initialSponsorName?: string;
  onBack: () => void;
  onContinue: (creative: {
    headline: string;
    body: string;
    link: string;
    sponsorName: string;
    email: string;
    imagePath: string | null;
  }) => void;
  children: ReactNode;
}

function StepCreativeProvider({
  newsletterName,
  bookingId,
  slotId,
  product,
  newsletterSlug,
  brandColor,
  initialSponsorName = "",
  onBack,
  onContinue,
  children,
}: StepCreativeProviderProps) {
  const [headline, setHeadline] = useState("");
  const [body, setBody] = useState("");
  const [link, setLink] = useState("");
  const [sponsorName, setSponsorName] = useState(initialSponsorName);
  const [email, setEmail] = useState("");
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSponsorName(initialSponsorName);
  }, [initialSponsorName]);

  // Extract constraints from asset requirements
  const assetReqs = product.asset_requirements || [];
  const headlineReq = assetReqs.find((r) => r.kind === "headline");
  const bodyReq = assetReqs.find((r) => r.kind === "body");
  const imageReq = assetReqs.find((r) => r.kind === "image");
  const linkReq = assetReqs.find((r) => r.kind === "link");

  const headlineLimit = headlineReq?.constraints?.maxChars || 60;
  const bodyLimit = bodyReq?.constraints?.maxChars || 280;
  // If requirement exists, it is required unless is_required is explicitly false
  const imageRequired = imageReq?.is_required !== false && !!imageReq;
  const headlineRequired = headlineReq?.is_required !== false && !!headlineReq;
  const bodyRequired = bodyReq?.is_required !== false && !!bodyReq;
  const linkRequired = linkReq?.is_required !== false && !!linkReq;

  // Check if all requirements are met
  const isFormValid = () => {
    // Check all required fields are filled
    if (!sponsorName.trim() || !email.trim()) {
      return false;
    }

    if (linkRequired && !link.trim()) {
      return false;
    }

    if (headlineRequired && !headline.trim()) {
      return false;
    }

    if (bodyRequired && !body.trim()) {
      return false;
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return false;
    }

    // Check character limits are not exceeded (if field exists)
    if (headlineReq && headline.length > headlineLimit) {
      return false;
    }

    if (bodyReq && body.length > bodyLimit) {
      return false;
    }

    // Check image is uploaded if required
    if (imageRequired && !imagePath) {
      return false;
    }

    return true;
  };

  const handleContinue = async () => {
    // Basic validation before sending
    if (!isFormValid()) {
      alert("Please fill in all fields correctly.");
      return;
    }

    // Validate character limits
    const errors: string[] = [];

    if (headlineReq && headline.length > headlineLimit) {
      errors.push(
        `Headline exceeds limit: ${headline.length}/${headlineLimit} characters`
      );
    }

    if (bodyReq && body.length > bodyLimit) {
      errors.push(
        `Body text exceeds limit: ${body.length}/${bodyLimit} characters`
      );
    }

    // Validate image requirements
    if (imageRequired && !imagePath) {
      errors.push("An image is required for this ad type.");
    }

    if (errors.length > 0) {
      alert("Please fix the following errors:\n\n" + errors.join("\n"));
      return;
    }

    setLoading(true);

    const result = await createBookingWithAssets(
      bookingId,
      slotId,
      product,
      newsletterSlug,
      {
        name: sponsorName,
        email,
        link
      },
      {
        headline,
        body,
        imagePath
      }
    );

    if (result.success) {
      onContinue({
        headline,
        body,
        link,
        sponsorName,
        email,
        imagePath,
      });
    } else {
      alert("Error: " + result.error);
    }
    setLoading(false);
  };

  return (
    <StepCreativeContext.Provider
      value={{
        headline,
        setHeadline,
        body,
        setBody,
        link,
        setLink,
        sponsorName,
        setSponsorName,
        email,
        setEmail,
        imagePath,
        setImagePath,
        loading,
        handleContinue,
        isFormValid,
      }}
    >
      {children}
    </StepCreativeContext.Provider>
  );
}

function useStepCreative() {
  const context = useContext(StepCreativeContext);
  if (!context) {
    throw new Error("useStepCreative must be used within StepCreativeProvider");
  }
  return context;
}

// Helper to check aspect ratio label
function getImageRatioLabel(ratio: string) {
  switch (ratio) {
    case "1:1":
      return "Square (1:1)";
    case "1.91:1":
      return "Landscape (1.91:1)";
    default:
      return "Any Size";
  }
}

interface StepCreativeLeftProps {
  product: Product;
  bookingId: string;
  stepIndicator?: ReactNode;
}

export function StepCreativeLeft({
  product,
  bookingId,
  stepIndicator,
}: StepCreativeLeftProps) {
  const {
    headline,
    setHeadline,
    body,
    setBody,
    link,
    setLink,
    sponsorName,
    setSponsorName,
    email,
    setEmail,
    imagePath,
    setImagePath,
    loading,
    handleContinue,
    isFormValid,
  } = useStepCreative();

  // Extract constraints
  const assetReqs = product.asset_requirements || [];
  const headlineReq = assetReqs.find((r) => r.kind === "headline");
  const bodyReq = assetReqs.find((r) => r.kind === "body");
  const imageReq = assetReqs.find((r) => r.kind === "image");
  const linkReq = assetReqs.find((r) => r.kind === "link");

  const headlineLimit = headlineReq?.constraints?.maxChars || 60;
  const bodyLimit = bodyReq?.constraints?.maxChars || 280;
  const imageRequired = imageReq?.is_required !== false && !!imageReq;
  const imageAspectRatio: any = imageReq?.constraints?.aspectRatio || "any";

  return (
    <div className={styles.contentArea}>
      <h2 className={styles.cardTitle}>Creative & Assets</h2>
      <p className={styles.subtitle}>
        Upload the copy and images for your <span className={styles.tierName}>{product.name}</span> slot.
      </p>

      <div className={styles.formFields}>
        {/* Identity Section */}
        <div className={styles.identitySection}>
          <div className={styles.fieldGroup}>
            <label htmlFor="sponsor" className={styles.label}>
              Sponsor Name
            </label>
            <InputText
              id="sponsor"
              value={sponsorName}
              onChange={(e) => setSponsorName(e.target.value)}
              placeholder="e.g. Acme Corp"
              className={styles.input}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="email" className={styles.label}>
              Contact Email
            </label>
            <InputText
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className={styles.input}
              type="email"
            />
          </div>

          {linkReq && (
            <div className={styles.fieldGroup}>
              <label htmlFor="link" className={styles.label}>
                {linkReq.label || "Link URL"}
              </label>
              <InputText
                id="link"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://..."
                className={styles.input}
              />
            </div>
          )}
        </div>

        {/* Visual Section */}
        {imageReq ? (
          <div className={styles.imageSection}>
            <div className={styles.imageSectionTitle}>
              {imageReq.label || "Ad Image"} {imageRequired ? "(Required)" : "(Optional)"}
            </div>
            <div className={styles.imageSectionHelp}>
              Required Ratio: {getImageRatioLabel(imageAspectRatio)}
            </div>
            <ImageUpload
              bookingId={bookingId}
              onUploadComplete={(path) => setImagePath(path)}
              requiredAspectRatio={imageAspectRatio}
            />
          </div>
        ) : (
          <Message
            severity="info"
            text="This format is text-only. No image required."
            style={{ margin: 0 }}
          />
        )}

        {/* Copy Section */}
        {(headlineReq || bodyReq) && (
          <div className={styles.copySection}>
            {headlineReq && (
              <div className={styles.fieldGroup}>
                <div className={styles.labelRow}>
                  <label htmlFor="headline" className={styles.label}>
                    {headlineReq.label || "Headline"}
                  </label>
                  <small
                    className={`${styles.charCount} ${headline.length >= headlineLimit
                      ? styles.charCountWarning
                      : ""
                      }`}
                  >
                    {headline.length}/{headlineLimit}
                  </small>
                </div>
                <InputText
                  id="headline"
                  value={headline}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= headlineLimit) {
                      setHeadline(value);
                    }
                  }}
                  placeholder="Catchy title"
                  className={`${styles.input} ${headline.length > headlineLimit ? "p-invalid" : ""
                    }`}
                />
                {headline.length > headlineLimit && (
                  <small className={styles.errorText}>
                    Headline exceeds limit by{" "}
                    {headline.length - headlineLimit} characters
                  </small>
                )}
              </div>
            )}

            {bodyReq && (
              <div className={styles.fieldGroup}>
                <div className={styles.labelRow}>
                  <label htmlFor="body" className={styles.label}>
                    {bodyReq.label || "Body Text"}
                  </label>
                  <small
                    className={`${styles.charCount} ${body.length >= bodyLimit
                      ? styles.charCountWarning
                      : ""
                      }`}
                  >
                    {body.length}/{bodyLimit}
                  </small>
                </div>
                <InputTextarea
                  id="body"
                  value={body}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= bodyLimit) {
                      setBody(value);
                    }
                  }}
                  rows={4}
                  placeholder="Your main message..."
                  className={`w-full ${styles.textarea}`}
                />
                {body.length > bodyLimit && (
                  <small className={styles.errorText}>
                    Body text exceeds limit by {body.length - bodyLimit}{" "}
                    characters
                  </small>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Button Container */}
      <div className={styles.buttonContainer}>
        <Button
          label="Continue"
          icon="pi pi-arrow-right"
          iconPos="right"
          onClick={handleContinue}
          loading={loading}
          disabled={!isFormValid()}
          className={`w-full ${styles.submitButton}`}
        />

        {/* Step Indicator */}
        {stepIndicator && (
          <div className={styles.stepIndicatorContainer}>{stepIndicator}</div>
        )}
      </div>
    </div>
  );
}

interface StepCreativeRightProps {
  newsletterName: string;
  product: Product;
  brandColor: string;
}

export function StepCreativeRight({
  newsletterName,
  product,
  brandColor,
}: StepCreativeRightProps) {
  const { headline, body, link, sponsorName, imagePath } = useStepCreative();

  // Extract constraints
  const assetReqs = product.asset_requirements || [];
  const imageReq = assetReqs.find((r) => r.kind === "image");
  const imageRequired = imageReq?.is_required !== false && !!imageReq;

  return (
    <div className={styles.previewContainer}>
      <div className={styles.previewHeader}>
        <h3 className={styles.previewTitle}>Live Preview</h3>
        <p className={styles.previewSubtitle}>
          See how your ad will look in the newsletter
        </p>
      </div>

      <div className={styles.browserWindow}>
        <div className={styles.browserHeader}>
          <div className={styles.trafficLights}>
            <div
              className={`${styles.trafficLight} ${styles.trafficLightRed}`}
            />
            <div
              className={`${styles.trafficLight} ${styles.trafficLightYellow}`}
            />
            <div
              className={`${styles.trafficLight} ${styles.trafficLightGreen}`}
            />
          </div>
          <div className={styles.addressBar}>
            <i
              className={`pi pi-lock ${styles.addressBarIcon} ${styles.addressBarIconLock}`}
            />
            <span className={styles.addressBarText}>
              {newsletterName.toLowerCase().replace(/\s+/g, "")}
              .com/newsletter
            </span>
          </div>
        </div>
        <div className={styles.browserContent}>
          <NewsletterMockup
            brandColor={brandColor}
            newsletterName={newsletterName}
            content={{
              sponsorName: sponsorName || "Your Sponsor",
              headline: headline || "Your Headline Here",
              body: body || "Your ad body text will appear here...",
              link: link,
              imagePath:
                imagePath || null,
            }}
          />
        </div>
      </div>

      <div className={styles.helperText}>
        <i className={`pi pi-eye ${styles.helperIcon}`} />
        <span>Updates in real-time as you type</span>
      </div>
    </div>
  );
}

// Default export is the provider component
export default StepCreativeProvider;
