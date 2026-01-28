"use client";

import {
  useState,
  ReactNode,
  createContext,
  useContext,
} from "react";
import { Button } from "primereact/button";
import { createBookingCheckout } from "@/app/actions/bookings";
import { Product } from "@/app/types/product";
import NewsletterMockup from "@/app/components/NewsletterMockup";
import styles from "./StepReview.module.css";

interface StepReviewContextType {
  headline: string;
  body: string;
  link: string;
  sponsorName: string;
  imagePath: string | null;
  loading: boolean;
  handlePayment: () => Promise<void>;
}

const StepReviewContext = createContext<StepReviewContextType | null>(null);

interface StepReviewProviderProps {
  newsletterName: string;
  bookingId: string;
  product: Product;
  date: Date;
  brandColor: string;
  creative: {
    headline: string;
    body: string;
    link: string;
    sponsorName: string;
    imagePath: string | null;
  };
  onPayment: () => void;
  children: ReactNode;
}

function StepReviewProvider({
  newsletterName,
  bookingId,
  product,
  date,
  brandColor,
  creative,
  onPayment,
  children,
}: StepReviewProviderProps) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);

    const result = await createBookingCheckout(bookingId);

    if (result.success && result.url) {
      onPayment();
      window.location.href = result.url;
    } else {
      alert("Error: " + result.error);
      setLoading(false);
    }
  };

  return (
    <StepReviewContext.Provider
      value={{
        headline: creative.headline,
        body: creative.body,
        link: creative.link,
        sponsorName: creative.sponsorName,
        imagePath: creative.imagePath,
        loading,
        handlePayment,
      }}
    >
      {children}
    </StepReviewContext.Provider>
  );
}

function useStepReview() {
  const context = useContext(StepReviewContext);
  if (!context) {
    throw new Error("useStepReview must be used within StepReviewProvider");
  }
  return context;
}

interface StepReviewLeftProps {
  product: Product;
  date: Date;
  stepIndicator?: ReactNode;
}

export function StepReviewLeft({
  product,
  date,
  stepIndicator,
}: StepReviewLeftProps) {
  const { loading, handlePayment } = useStepReview();

  const formatDateWithOrdinal = (date: Date) => {
    const day = date.getDate();
    const ordinal = (n: number) => {
      const s = ["th", "st", "nd", "rd"];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };
    const month = new Intl.DateTimeFormat("en-US", { month: "long" }).format(date);
    const year = date.getFullYear();
    return `${month} ${ordinal(day)}, ${year}`;
  };

  return (
    <div className={styles.contentArea}>
      <h2 className={styles.cardTitle}>Review & Pay</h2>
      <p className={styles.subtitle}>
        Review your booking details and complete payment.
      </p>

      <div className={styles.orderSummary}>
        <div className={styles.orderItem}>
          <div className={styles.orderItemLabel}>Main Slot</div>
          <div className={styles.orderItemValue}>
            <div className={styles.orderItemName}>{product.name}</div>
            <div className={styles.orderItemPrice}>
              ${(product.price / 100).toFixed(2)}
            </div>
          </div>
        </div>

        <div className={styles.orderItem}>
          <div className={styles.orderItemLabel}>Date</div>
          <div className={styles.orderItemValue}>
            <div className={styles.orderItemDate}>
              {formatDateWithOrdinal(date)}
            </div>
          </div>
        </div>

        <div className={styles.orderTotal}>
          <div className={styles.orderTotalLabel}>Total Due</div>
          <div className={styles.orderTotalAmount}>
            ${(product.price / 100).toFixed(2)}
          </div>
        </div>
      </div>

      <div className={styles.buttonContainer}>
        <Button
          label={loading ? "Securing your slot..." : "Pay & Book"}
          icon={loading ? undefined : "pi pi-lock"}
          iconPos="right"
          onClick={handlePayment}
          loading={loading}
          className={`w-full ${styles.submitButton}`}
        />

        {stepIndicator && (
          <div className={styles.stepIndicatorContainer}>{stepIndicator}</div>
        )}
      </div>
    </div>
  );
}

interface StepReviewRightProps {
  newsletterName: string;
  product: Product;
  brandColor: string;
}

export function StepReviewRight({
  newsletterName,
  product,
  brandColor,
}: StepReviewRightProps) {
  const { headline, body, link, sponsorName, imagePath } = useStepReview();

  // Extract constraints
  const assetReqs = product.asset_requirements || [];
  const imageReq = assetReqs.find((r) => r.kind === "image");
  const imageRequired = imageReq?.is_required !== false && !!imageReq;

  return (
    <div className={styles.previewContainer}>
      <div className={styles.previewHeader}>
        <h3 className={styles.previewTitle}>This is exactly what will appear</h3>
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
              imagePath: imagePath,
            }}
          />
        </div>
      </div>
    </div>
  );
}

// Default export is the provider component
export default StepReviewProvider;
