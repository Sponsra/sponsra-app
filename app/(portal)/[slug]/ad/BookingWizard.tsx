"use client";

import { useState, useEffect, useRef, ReactNode } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "next/navigation";
import { InventoryTierPublic, NewsletterTheme } from "@/app/types/inventory";
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
import StepSuccess from "./steps/StepSuccess";
import StepIndicator from "./components/StepIndicator";
import styles from "./BookingWizard.module.css";

interface BookingWizardProps {
  tiers: InventoryTierPublic[];
  newsletterName: string;
  slug: string;
  theme: NewsletterTheme;
}

// Portal component that renders children into a target element
function Portal({
  children,
  target,
}: {
  children: ReactNode;
  target: HTMLElement | null;
}) {
  if (!target) return null;
  return createPortal(children, target);
}

export default function BookingWizard({
  tiers,
  newsletterName,
  slug,
  theme,
}: BookingWizardProps) {
  const [currentStep, setCurrentStep] = useState<number | "success">(1);
  const [displayedStep, setDisplayedStep] = useState<number | "success">(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [selectedTier, setSelectedTier] = useState<InventoryTierPublic | null>(
    null
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [bookingId, setBookingId] = useState<string>("");
  const [prefilledSponsor, setPrefilledSponsor] = useState("");
  const [creative, setCreative] = useState<{
    headline: string;
    body: string;
    link: string;
    sponsorName: string;
    imagePath: string | null;
  } | null>(null);
  const [mounted, setMounted] = useState(false);

  const searchParams = useSearchParams();
  const rightContentRef = useRef<HTMLDivElement>(null);

  // Ensure portals only render after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check for success state from Stripe redirect
  useEffect(() => {
    const success = searchParams.get("success");
    const sessionId = searchParams.get("session_id");
    if (success === "true" || sessionId) {
      setCurrentStep("success");
      setDisplayedStep("success");
    }
  }, [searchParams]);

  // Handle prefilled data from URL params
  useEffect(() => {
    const tierId = searchParams.get("tier");
    if (tierId && tiers.length > 0) {
      const foundTier = tiers.find((tier) => tier.id === tierId);
      if (foundTier) {
        setSelectedTier(foundTier);
      }
    }

    const sponsor = searchParams.get("sponsor");
    if (sponsor) {
      setPrefilledSponsor(sponsor);
    }
  }, [searchParams, tiers]);

  const transitionToStep = (
    newStep: number | "success",
    dir: "forward" | "backward"
  ) => {
    setDirection(dir);
    setIsAnimating(true);
    setDisplayedStep(newStep);

    setTimeout(() => {
      setCurrentStep(newStep);
      setIsAnimating(false);
    }, 400);
  };

  const handleStep1Continue = (
    tier: InventoryTierPublic,
    date: Date,
    newBookingId: string
  ) => {
    setSelectedTier(tier);
    setSelectedDate(date);
    setBookingId(newBookingId);
    transitionToStep(2, "forward");
  };

  const handleStep2Back = () => transitionToStep(1, "backward");

  const handleStep2Continue = (creativeData: {
    headline: string;
    body: string;
    link: string;
    sponsorName: string;
    imagePath: string | null;
  }) => {
    setCreative(creativeData);
    transitionToStep(3, "forward");
  };

  const handleStep3Back = () => transitionToStep(2, "backward");

  const handleStep3Payment = () => {
    // Redirects to Stripe - success state handled by URL params
  };

  const handleStepClick = (step: number) => {
    const numericCurrent = currentStep === "success" ? 3 : currentStep;
    if (step < numericCurrent) {
      transitionToStep(step, "backward");
    }
  };

  // Determine which steps to render
  const showStep1 =
    currentStep === 1 ||
    (isAnimating && (displayedStep === 1 || currentStep === 1));
  const showStep2 =
    currentStep === 2 ||
    (isAnimating && (displayedStep === 2 || currentStep === 2));
  const showStep3 =
    currentStep === 3 ||
    (isAnimating && (displayedStep === 3 || currentStep === 3));
  const showSuccess = currentStep === "success" || displayedStep === "success";

  // Get animation class for left content (slide)
  const getLeftClass = (step: number | "success") => {
    if (!isAnimating) {
      return step === currentStep ? styles.contentActive : styles.contentHidden;
    }

    if (step === displayedStep) {
      return direction === "forward"
        ? styles.slideInFromRight
        : styles.slideInFromLeft;
    }
    if (step === currentStep) {
      return direction === "forward"
        ? styles.slideOutToLeft
        : styles.slideOutToRight;
    }
    return styles.contentHidden;
  };

  // Get animation class for right content (crossfade)
  const getRightClass = (step: number) => {
    if (!isAnimating) {
      return step === currentStep ? styles.contentActive : styles.contentHidden;
    }

    if (step === displayedStep) {
      return styles.fadeIn;
    }
    if (step === currentStep) {
      return styles.fadeOut;
    }
    return styles.contentHidden;
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.formSection}>
          {/* Left Section */}
          <div className={styles.leftSection}>
            <div className={styles.leftContent}>
              {/* Step 1 - Provider wraps both left and portaled right content */}
              {showStep1 && (
                <StepSelectDateProvider
                  tiers={tiers}
                  slug={slug}
                  onContinue={handleStep1Continue}
                >
                  {/* Left content renders here */}
                  <div className={getLeftClass(1)}>
                    <StepSelectDateLeft
                      tiers={tiers}
                      newsletterName={newsletterName}
                      stepIndicator={
                        <StepIndicator
                          currentStep={1}
                          onStepClick={handleStepClick}
                        />
                      }
                    />
                  </div>

                  {/* Right content portals to rightContent div */}
                  {mounted && (
                    <Portal target={rightContentRef.current}>
                      <div className={getRightClass(1)}>
                        <StepSelectDateRight />
                      </div>
                    </Portal>
                  )}
                </StepSelectDateProvider>
              )}

              {/* Step 2 */}
              {showStep2 && selectedTier && (
                <StepCreativeProvider
                  newsletterName={newsletterName}
                  bookingId={bookingId}
                  tier={selectedTier}
                  theme={theme}
                  initialSponsorName={prefilledSponsor}
                  onBack={handleStep2Back}
                  onContinue={handleStep2Continue}
                >
                  {/* Left content renders here */}
                  <div className={getLeftClass(2)}>
                    <StepCreativeLeft
                      tier={selectedTier}
                      bookingId={bookingId}
                      stepIndicator={
                        <StepIndicator
                          currentStep={2}
                          onStepClick={handleStepClick}
                        />
                      }
                    />
                  </div>

                  {/* Right content portals to rightContent div */}
                  {mounted && (
                    <Portal target={rightContentRef.current}>
                      <div className={getRightClass(2)}>
                        <StepCreativeRight
                          newsletterName={newsletterName}
                          tier={selectedTier}
                          theme={theme}
                        />
                      </div>
                    </Portal>
                  )}
                </StepCreativeProvider>
              )}

              {/* Step 3 */}
              {showStep3 && selectedTier && selectedDate && creative && (
                <StepReviewProvider
                  newsletterName={newsletterName}
                  bookingId={bookingId}
                  tier={selectedTier}
                  date={selectedDate}
                  theme={theme}
                  creative={creative}
                  onPayment={handleStep3Payment}
                >
                  {/* Left content renders here */}
                  <div className={getLeftClass(3)}>
                    <StepReviewLeft
                      tier={selectedTier}
                      date={selectedDate}
                      stepIndicator={
                        <StepIndicator
                          currentStep={3}
                          onStepClick={handleStepClick}
                        />
                      }
                    />
                  </div>

                  {/* Right content portals to rightContent div */}
                  {mounted && (
                    <Portal target={rightContentRef.current}>
                      <div className={getRightClass(3)}>
                        <StepReviewRight
                          newsletterName={newsletterName}
                          tier={selectedTier}
                          theme={theme}
                        />
                      </div>
                    </Portal>
                  )}
                </StepReviewProvider>
              )}

              {/* Success */}
              {showSuccess && (
                <div className={getLeftClass("success")}>
                  <StepSuccess sessionId={searchParams.get("session_id")} />
                </div>
              )}
            </div>
          </div>

          {/* Right Section - content rendered via portals */}
          <div className={styles.rightSection}>
            <div className={styles.rightContent} ref={rightContentRef}>
              {/* Portal target - content rendered by step providers above */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
