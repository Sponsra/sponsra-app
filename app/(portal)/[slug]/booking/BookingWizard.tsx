"use client";

import { useState, useEffect, useRef, ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { Steps } from "primereact/steps";
import { Product } from "@/app/types/product";
import StepSelectDateProvider, {
  StepSelectDateLeft,
  StepSelectDateRight,
} from "./steps/StepSelectDate";
import StepCreativeProvider, {
  StepCreativeLeft,
  StepCreativeRight,
} from "./steps/StepCreative";
import StepReviewProvider, {
  StepReviewLeft,
  StepReviewRight,
} from "./steps/StepReview";
import StepSuccessProvider, { StepSuccessLeft, StepSuccessRight } from "./steps/StepSuccess";
import styles from "./BookingWizard.module.css";

interface BookingWizardProps {
  products: Product[];
  newsletterName: string;
  slug: string;
  brandColor: string;
}

export default function BookingWizard({
  products,
  newsletterName,
  slug,
  brandColor,
}: BookingWizardProps) {
  const searchParams = useSearchParams();
  const [activeStep, setActiveStep] = useState(0);

  // Booking State - persisted across steps
  const [bookingId, setBookingId] = useState<string>("");
  const [slotId, setSlotId] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(
    null
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Creative State
  const [creativeData, setCreativeData] = useState<{
    headline: string;
    body: string;
    link: string;
    sponsorName: string;
    imagePath: string | null;
  } | null>(null);

  // Initialize booking ID if empty
  useEffect(() => {
    if (!bookingId) {
      if (typeof window !== 'undefined') {
        setBookingId(crypto.randomUUID());
      }
    }
  }, [bookingId]);

  // Check for success param
  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setActiveStep(3); // Success Step
    }
  }, [searchParams]);

  const items = [
    { label: "Date" },
    { label: "Creative" },
    { label: "Review" },
  ];

  // 1. Handle Date Selection (Step 1 -> 2)
  const handleStep1Continue = (
    product: Product,
    date: Date,
    slotId: string
  ) => {
    setSelectedProduct(product);
    setSelectedDate(date);
    setSlotId(slotId);
    setActiveStep(1); // Go to Creative
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 2. Handle Creative Submission (Step 2 -> 3)
  const handleStep2Continue = (creative: {
    headline: string;
    body: string;
    link: string;
    sponsorName: string;
    imagePath: string | null;
  }) => {
    setCreativeData(creative);
    setActiveStep(2); // Go to Review
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 3. Handle Payment Initiation (Step 3 -> Stripe)
  const handlePayment = () => {
    // Logic handled in StepReview (redirects)
    if (!bookingId) {
      alert("Booking ID invalid.");
      return;
    }
  };

  const renderSteps = () => {
    return (
      <Steps
        model={items}
        activeIndex={activeStep}
        onSelect={(e) => {
          // Only allow navigating back
          if (e.index < activeStep && activeStep !== 3) {
            setActiveStep(e.index);
          }
        }}
        readOnly={false}
        className={styles.steps}
      />
    );
  };

  const renderContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <StepSelectDateProvider
            products={products}
            slug={slug}
            onContinue={handleStep1Continue}
          >
            <div className={styles.formSection}>
              <div className={styles.leftSection}>
                <div className={styles.leftContent}>
                  <StepSelectDateLeft
                    products={products}
                    newsletterName={newsletterName}
                    stepIndicator={renderSteps()}
                  />
                </div>
              </div>
              <div className={styles.rightSection}>
                <div className={styles.rightContent}>
                  <StepSelectDateRight />
                </div>
              </div>
            </div>
          </StepSelectDateProvider>
        );
      case 1:
        if (!selectedProduct) return null;
        return (
          <StepCreativeProvider
            newsletterName={newsletterName}
            bookingId={bookingId}
            slotId={slotId}
            product={selectedProduct}
            newsletterSlug={slug}
            brandColor={brandColor}
            onBack={() => setActiveStep(activeStep - 1)}
            onContinue={handleStep2Continue}
          >
            <div className={styles.formSection}>
              <div className={styles.leftSection}>
                <div className={styles.leftContent}>
                  <StepCreativeLeft
                    product={selectedProduct}
                    bookingId={bookingId}
                    stepIndicator={renderSteps()}
                  />
                </div>
              </div>
              <div className={styles.rightSection}>
                <div className={styles.rightContent}>
                  <StepCreativeRight
                    newsletterName={newsletterName}
                    product={selectedProduct}
                    brandColor={brandColor}
                  />
                </div>
              </div>
            </div>
          </StepCreativeProvider>
        );
      case 2:
        if (!selectedProduct || !selectedDate || !creativeData) return null;
        return (
          <StepReviewProvider
            newsletterName={newsletterName}
            bookingId={bookingId}
            product={selectedProduct}
            date={selectedDate}
            brandColor={brandColor}
            creative={creativeData}
            onPayment={handlePayment}
          >
            <div className={styles.formSection}>
              <div className={styles.leftSection}>
                <div className={styles.leftContent}>
                  <StepReviewLeft
                    product={selectedProduct}
                    date={selectedDate}
                    stepIndicator={renderSteps()}
                  />
                </div>
              </div>
              <div className={styles.rightSection}>
                <div className={styles.rightContent}>
                  <StepReviewRight
                    newsletterName={newsletterName}
                    product={selectedProduct}
                    brandColor={brandColor}
                  />
                </div>
              </div>
            </div>
          </StepReviewProvider>
        );
      case 3:
        return (
          <StepSuccessProvider>
            <div className={styles.formSection}>
              <div className={styles.leftSection}>
                <div className={styles.leftContent}>
                  <StepSuccessLeft />
                </div>
              </div>
              <div className={styles.rightSection}>
                <div className={styles.rightContent}>
                  <StepSuccessRight />
                </div>
              </div>
            </div>
          </StepSuccessProvider>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {renderContent()}
      </div>
    </div>
  );
}
