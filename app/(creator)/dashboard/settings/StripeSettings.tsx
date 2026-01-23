"use client";

import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { createStripeLoginLink } from "@/app/actions/stripe-connect";
import sharedStyles from "./shared.module.css";

interface StripeSettingsProps {
    stripeStatus: "none" | "restricted" | "active";
    stripeAccountId: string | null;
}

export default function StripeSettings({
    stripeStatus,
    stripeAccountId,
}: StripeSettingsProps) {
    const handleOpenStripeDashboard = async () => {
        const url = await createStripeLoginLink();
        if (url) {
            window.open(url, "_blank", "noopener,noreferrer");
        }
    };

    return (
        <Card className={sharedStyles.card}>
            <div className={sharedStyles.header}>
                <div>
                    <h2 className={sharedStyles.title}>Payment Settings</h2>
                    <p className={sharedStyles.subtitle}>
                        Manage your Stripe account and payout settings
                    </p>
                </div>
            </div>

            <div className={sharedStyles.section}>
                <div style={{ marginBottom: "1.5rem" }}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                            marginBottom: "0.5rem",
                        }}
                    >
                        <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                            Account Status:
                        </span>
                        {stripeStatus === "active" && (
                            <span
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    padding: "0.25rem 0.75rem",
                                    backgroundColor: "#dcfce7",
                                    color: "#166534",
                                    borderRadius: "9999px",
                                    fontSize: "0.875rem",
                                    fontWeight: 600,
                                }}
                            >
                                <i className="pi pi-check-circle"></i>
                                Active
                            </span>
                        )}
                        {stripeStatus === "restricted" && (
                            <span
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    padding: "0.25rem 0.75rem",
                                    backgroundColor: "#fed7aa",
                                    color: "#9a3412",
                                    borderRadius: "9999px",
                                    fontSize: "0.875rem",
                                    fontWeight: 600,
                                }}
                            >
                                <i className="pi pi-exclamation-triangle"></i>
                                Restricted
                            </span>
                        )}
                        {stripeStatus === "none" && (
                            <span
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    padding: "0.25rem 0.75rem",
                                    backgroundColor: "#e5e7eb",
                                    color: "#374151",
                                    borderRadius: "9999px",
                                    fontSize: "0.875rem",
                                    fontWeight: 600,
                                }}
                            >
                                <i className="pi pi-times-circle"></i>
                                Not Connected
                            </span>
                        )}
                    </div>

                    {stripeStatus === "active" && (
                        <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                            Your Stripe account is fully set up and ready to accept payments.
                        </p>
                    )}
                    {stripeStatus === "restricted" && (
                        <p style={{ fontSize: "0.875rem", color: "#9a3412" }}>
                            Your account needs attention (e.g., verify bank info) before you
                            can receive payouts.
                        </p>
                    )}
                    {stripeStatus === "none" && (
                        <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                            Connect your Stripe account to start accepting sponsorships and
                            receiving payments.
                        </p>
                    )}
                </div>

                {stripeAccountId && (
                    <div style={{ marginBottom: "1.5rem" }}>
                        <span
                            style={{
                                fontSize: "0.875rem",
                                color: "#6b7280",
                                fontFamily: "monospace",
                            }}
                        >
                            Account ID: {stripeAccountId}
                        </span>
                    </div>
                )}

                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                    {stripeStatus !== "none" && (
                        <Button
                            label="Open Stripe Dashboard"
                            icon="pi pi-external-link"
                            className="modern-button"
                            severity="secondary"
                            onClick={handleOpenStripeDashboard}
                        />
                    )}
                </div>
            </div>
        </Card>
    );
}
