"use client";

import styles from "./StepIndicator.module.css";

interface StepIndicatorProps {
  currentStep: number | "success";
  onStepClick: (step: number) => void;
}

export default function StepIndicator({
  currentStep,
  onStepClick,
}: StepIndicatorProps) {
  const steps = [1, 2, 3];
  const currentStepNum = currentStep === "success" ? 3 : currentStep;

  const getStepStatus = (step: number) => {
    if (step < currentStepNum) return "completed";
    if (step === currentStepNum) return "active";
    return "pending";
  };

  const handleStepClick = (step: number) => {
    // Only allow clicking on completed steps (going backward)
    if (step < currentStepNum) {
      onStepClick(step);
    }
  };

  return (
    <div className={styles.container}>
      {steps.map((step) => {
        const status = getStepStatus(step);
        const isClickable = status === "completed";

        return (
          <button
            key={step}
            className={`${styles.dot} ${styles[status]} ${
              isClickable ? styles.clickable : ""
            }`}
            onClick={() => handleStepClick(step)}
            disabled={!isClickable}
            aria-label={`Step ${step}${status === "active" ? " (current)" : status === "completed" ? " (completed)" : ""}`}
          >
            {status === "completed" ? (
              <i className="pi pi-check" />
            ) : (
              <span className={styles.stepNumber}>{step}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
