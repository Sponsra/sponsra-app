"use client";

import { createContext, useContext, ReactNode } from "react";
import { Button } from "primereact/button";
import Link from "next/link";
import styles from "./StepSuccess.module.css";
import { useSearchParams } from "next/navigation";

// Context
interface StepSuccessContextType {
  sessionId: string | null;
}

const StepSuccessContext = createContext<StepSuccessContextType | null>(null);

function useStepSuccess() {
  const context = useContext(StepSuccessContext);
  if (!context) {
    throw new Error("useStepSuccess must be used within StepSuccessProvider");
  }
  return context;
}

// Provider
interface StepSuccessProviderProps {
  children: ReactNode;
}

export default function StepSuccessProvider({ children }: StepSuccessProviderProps) {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  return (
    <StepSuccessContext.Provider value={{ sessionId }}>
      {children}
    </StepSuccessContext.Provider>
  );
}

// Left Component
export function StepSuccessLeft() {
  const { sessionId } = useStepSuccess();

  return (
    <div className={styles.leftSection}>
      <div className={styles.successIcon}>
        <div className={styles.iconCircle}>
          <i className="pi pi-check" />
        </div>
      </div>

      <h2 className={styles.title}>Payment Successful!</h2>
      <p className={styles.message}>
        Your ad slot has been reserved. The creator has been notified and will
        review your assets shortly.
      </p>

      {sessionId && (
        <div className={styles.transactionInfo}>
          <span className={styles.transactionLabel}>Transaction ID:</span>
          <span className={styles.transactionId}>{sessionId}</span>
        </div>
      )}

      <Link href="/" style={{ textDecoration: "none", width: "100%" }}>
        <Button
          label="Return to Home"
          icon="pi pi-home"
          className={`w-full ${styles.homeButton}`}
        />
      </Link>
    </div>
  );
}

// Right Component
export function StepSuccessRight() {
  return (
    <div className={styles.rightSection}>
      <div className={styles.gradientBackground} />
    </div>
  );
}
