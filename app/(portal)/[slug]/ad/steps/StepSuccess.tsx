"use client";

import { Button } from "primereact/button";
import Link from "next/link";
import styles from "./StepSuccess.module.css";

interface StepSuccessProps {
  sessionId?: string | null;
}

export default function StepSuccess({ sessionId }: StepSuccessProps) {
  return (
    <>
      {/* Left Section - Success Message */}
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

      {/* Right Section - Gradient Background */}
      <div className={styles.rightSection}>
        <div className={styles.gradientBackground} />
      </div>
    </>
  );
}
