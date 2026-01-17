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
import { saveAdCreative } from "@/app/actions/bookings";
import { InventoryTierPublic, NewsletterTheme } from "@/app/types/inventory";
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
  tier: InventoryTierPublic;
  theme: NewsletterTheme;
  initialSponsorName?: string;
  onBack: () => void;
  onContinue: (creative: {
    headline: string;
    body: string;
    link: string;
    sponsorName: string;
    imagePath: string | null;
  }) => void;
  children: ReactNode;
}

function StepCreativeProvider({
  newsletterName,
  bookingId,
  tier,
  theme,
  initialSponsorName = "",
  onBack,
  onContinue,
  children,
}: StepCreativeProviderProps) {
  const [headline, setHeadline] = useState("");
  const [body, setBody] = useState("");
  const [link, setLink] = useState("");
  const [sponsorName, setSponsorName] = useState(initialSponsorName);
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSponsorName(initialSponsorName);
  }, [initialSponsorName]);

  // Check if all requirements are met
  const isFormValid = () => {
    // Check all required fields are filled
    if (
      !headline.trim() ||
      !body.trim() ||
      !link.trim() ||
      !sponsorName.trim()
    ) {
      return false;
    }

    // Check character limits are not exceeded
    if (headline.length > tier.specs_headline_limit) {
      return false;
    }

    if (body.length > tier.specs_body_limit) {
      return false;
    }

    // Check image is uploaded if required
    if (tier.specs_image_ratio !== "no_image" && !imagePath) {
      return false;
    }

    return true;
  };

  const handleContinue = async () => {
    // Basic validation before sending
    if (!headline || !body || !link || !sponsorName) {
      alert("Please fill in all fields.");
      return;
    }

    // Validate character limits
    const errors: string[] = [];

    if (headline.length > tier.specs_headline_limit) {
      errors.push(
        `Headline exceeds limit: ${headline.length}/${tier.specs_headline_limit} characters`
      );
    }

    if (body.length > tier.specs_body_limit) {
      errors.push(
        `Body text exceeds limit: ${body.length}/${tier.specs_body_limit} characters`
      );
    }

    // Validate image requirements
    if (tier.specs_image_ratio !== "no_image" && !imagePath) {
      errors.push("An image is required for this ad type.");
    }

    if (errors.length > 0) {
      alert("Please fix the following errors:\n\n" + errors.join("\n"));
      return;
    }

    setLoading(true);

    const result = await saveAdCreative(bookingId, {
      headline,
      body,
      link,
      sponsorName,
      imagePath,
    });

    if (result.success) {
      onContinue({
        headline,
        body,
        link,
        sponsorName,
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
  tier: InventoryTierPublic;
  bookingId: string;
  stepIndicator?: ReactNode;
}

export function StepCreativeLeft({
  tier,
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
    imagePath,
    setImagePath,
    loading,
    handleContinue,
    isFormValid,
  } = useStepCreative();

  return (
    <div className={styles.contentArea}>
      <h2 className={styles.cardTitle}>The Studio</h2>
      <p className={styles.subtitle}>
        Customizing for: <span className={styles.tierName}>{tier.name}</span>
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
            <label htmlFor="link" className={styles.label}>
              Link URL
            </label>
            <InputText
              id="link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://..."
              className={styles.input}
            />
          </div>
        </div>

        {/* Visual Section */}
        {tier.specs_image_ratio !== "no_image" ? (
          <div className={styles.imageSection}>
            <div className={styles.imageSectionTitle}>Ad Image</div>
            <div className={styles.imageSectionHelp}>
              Required Ratio: {getImageRatioLabel(tier.specs_image_ratio)}
            </div>
            <ImageUpload
              bookingId={bookingId}
              onUploadComplete={(path) => setImagePath(path)}
              requiredAspectRatio={tier.specs_image_ratio}
            />
          </div>
        ) : (
          <Message
            severity="info"
            text="This tier is text-only. No image required."
            style={{ margin: 0 }}
          />
        )}

        {/* Copy Section */}
        <div className={styles.copySection}>
          <div className={styles.fieldGroup}>
            <div className={styles.labelRow}>
              <label htmlFor="headline" className={styles.label}>
                Headline
              </label>
              <small
                className={`${styles.charCount} ${
                  headline.length >= tier.specs_headline_limit
                    ? styles.charCountWarning
                    : ""
                }`}
              >
                {headline.length}/{tier.specs_headline_limit}
              </small>
            </div>
            <InputText
              id="headline"
              value={headline}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= tier.specs_headline_limit) {
                  setHeadline(value);
                }
              }}
              placeholder="Catchy title"
              className={`${styles.input} ${
                headline.length > tier.specs_headline_limit ? "p-invalid" : ""
              }`}
            />
            {headline.length > tier.specs_headline_limit && (
              <small className={styles.errorText}>
                Headline exceeds limit by{" "}
                {headline.length - tier.specs_headline_limit} characters
              </small>
            )}
          </div>

          <div className={styles.fieldGroup}>
            <div className={styles.labelRow}>
              <label htmlFor="body" className={styles.label}>
                Body Text
              </label>
              <small
                className={`${styles.charCount} ${
                  body.length >= tier.specs_body_limit
                    ? styles.charCountWarning
                    : ""
                }`}
              >
                {body.length}/{tier.specs_body_limit}
              </small>
            </div>
            <InputTextarea
              id="body"
              value={body}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= tier.specs_body_limit) {
                  setBody(value);
                }
              }}
              rows={4}
              placeholder="Your main message..."
              className={`w-full ${styles.textarea}`}
            />
            {body.length > tier.specs_body_limit && (
              <small className={styles.errorText}>
                Body text exceeds limit by {body.length - tier.specs_body_limit}{" "}
                characters
              </small>
            )}
          </div>
        </div>
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
  tier: InventoryTierPublic;
  theme: NewsletterTheme;
}

export function StepCreativeRight({
  newsletterName,
  tier,
  theme,
}: StepCreativeRightProps) {
  const { headline, body, link, sponsorName, imagePath } = useStepCreative();

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
            theme={theme}
            newsletterName={newsletterName}
            content={{
              sponsorName: sponsorName || "Your Sponsor",
              headline: headline || "Your Headline Here",
              body: body || "Your ad body text will appear here...",
              link: link,
              imagePath:
                tier.specs_image_ratio !== "no_image" ? imagePath : null,
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
