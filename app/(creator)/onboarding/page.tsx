"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Message } from "primereact/message";
import { createStripeConnectAccount } from "@/app/actions/stripe-connect";
import { setupNewsletter, setupInitialInventory } from "@/app/actions/onboarding";
import styles from "./onboarding.module.css";

type Step = "newsletter" | "inventory" | "stripe";

export default function OnboardingPage() {
    const searchParams = useSearchParams();
    // Allow developers to jump to a step via ?step=inventory, etc.
    const initialStep = (searchParams.get("step") as Step) || "newsletter";

    const [step, setStep] = useState<Step>(initialStep);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // Step 1 Data
    const [newsletterName, setNewsletterName] = useState("");
    const [generatedSlug, setGeneratedSlug] = useState("");

    // Step 2 Data
    const [tierPrice, setTierPrice] = useState<number | null>(500); // Display as dollars

    // --- HANDLERS ---

    // Step 1: Newsletter Name
    const handleStep1Submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newsletterName.trim()) {
            setError("Please enter a name.");
            return;
        }
        setLoading(true);
        setError(null);

        const res = await setupNewsletter(newsletterName);

        if (res.success) {
            setGeneratedSlug(res.slug || "");
            setStep("inventory");
        } else {
            setError(res.error || "Failed to create newsletter.");
        }
        setLoading(false);
    };

    // Step 2: Inventory
    const handleStep2Submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Convert dollars to cents
        const priceInCents = (tierPrice || 0) * 100;

        const res = await setupInitialInventory({
            name: "Standard Sponsorship",
            price: priceInCents,
        });

        if (res.success) {
            setStep("stripe");
        } else {
            setError(res.error || "Failed to set up inventory.");
        }
        setLoading(false);
    };

    // Step 3: Stripe
    const handleStripeConnect = async () => {
        setLoading(true);
        // Server action redirects, so we might not need to set loading to false strictly
        await createStripeConnectAccount();
    };

    const handleSkipStripe = () => {
        // If they skip, "onboarding is complete" logic in layout will see the inventory/newsletter
        // and allow access to dashboard (where share link is disabled).
        router.push("/dashboard");
        // Force refresh to update layout state?
        // router.refresh();
        // Actually, RouteGuard doesn't re-check without refresh usually
        // We can do a hard navigation or router.refresh() + push
        window.location.href = "/dashboard";
    };

    // Helper
    const slugify = (text: string) => {
        return text
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_-]+/g, "-")
            .replace(/^-+|-+$/g, "");
    };

    const currentSlug = newsletterName ? slugify(newsletterName) : "your-newsletter";
    const previewUrl = `sponsra.com/${currentSlug}`;

    // --- RENDERERS ---

    const renderStepIndicator = () => (
        <div className={styles.stepsIndicator}>
            <div className={`${styles.stepDot} ${step === "newsletter" ? styles.stepDotActive : styles.stepDotCompleted}`} />
            <div className={`${styles.stepDot} ${step === "inventory" ? (styles.stepDotActive) : (step === "stripe" ? styles.stepDotCompleted : "")}`} />
            <div className={`${styles.stepDot} ${step === "stripe" ? styles.stepDotActive : ""}`} />
        </div>
    );

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                {renderStepIndicator()}

                {step === "newsletter" && (
                    <>
                        <div className={styles.header}>
                            <h1 className={styles.title}>What is your newsletter's name?</h1>
                            <p className={styles.subtitle}>
                                We'll create a unique booking page for you.
                            </p>
                        </div>

                        <form onSubmit={handleStep1Submit}>
                            <div className={styles.formContent}>
                                <label className={styles.label}>Newsletter Name</label>
                                <InputText
                                    value={newsletterName}
                                    onChange={(e) => setNewsletterName(e.target.value)}
                                    placeholder="e.g. Daily Tech Digest"
                                    className="w-full p-inputtext-lg"
                                    autoFocus
                                />
                                <p className={styles.inputHelper}>
                                    Your booking page will be at: <strong>{previewUrl}</strong>
                                </p>
                            </div>

                            {error && <Message severity="error" text={error} className="mb-4 w-full" />}

                            <div className={styles.actions}>
                                <Button
                                    label="Next: Inventory"
                                    icon="pi pi-arrow-right"
                                    iconPos="right"
                                    loading={loading}
                                    type="submit"
                                />
                            </div>
                        </form>
                    </>
                )}

                {step === "inventory" && (
                    <>
                        <div className={styles.header}>
                            <h1 className={styles.title}>Set your price</h1>
                            <p className={styles.subtitle}>
                                Create your first sponsorship usage tier. You can add more later.
                            </p>
                        </div>

                        <form onSubmit={handleStep2Submit}>
                            <div className={styles.formContent}>
                                <div className="flex flex-col gap-4">
                                    <div className="p-4 border rounded-xl border-indigo-100 bg-indigo-50/50">
                                        <h3 className="font-semibold text-slate-800 mb-1">Standard Sponsorship</h3>
                                        <p className="text-sm text-slate-600">
                                            Includes a Logo, Headline, Body Text, and Call-to-Action link.
                                        </p>
                                    </div>

                                    <div>
                                        <label className={styles.label}>Price per issue</label>
                                        <InputNumber
                                            inputId="currency-us"
                                            value={tierPrice}
                                            onValueChange={(e) => setTierPrice(e.value ?? null)}
                                            mode="currency"
                                            currency="USD"
                                            locale="en-US"
                                            className="w-full"
                                            inputClassName="p-inputtext-lg w-full"
                                        />
                                    </div>
                                </div>
                            </div>

                            {error && <Message severity="error" text={error} className="mb-4 w-full" />}

                            <div className={styles.actions} style={{ justifyContent: 'space-between' }}>
                                <Button
                                    label="Back"
                                    icon="pi pi-arrow-left"
                                    type="button"
                                    className="p-button-text p-button-secondary"
                                    onClick={() => setStep("newsletter")}
                                    disabled={loading}
                                />
                                <Button
                                    label="Next: Payouts"
                                    icon="pi pi-arrow-right"
                                    iconPos="right"
                                    loading={loading}
                                    type="submit"
                                />
                            </div>
                        </form>
                    </>
                )}

                {step === "stripe" && (
                    <>
                        <div className={styles.header}>
                            <h1 className={styles.title}>Let's get you paid</h1>
                            <p className={styles.subtitle}>
                                Connect Stripe to receive payments directly to your bank account.
                            </p>
                        </div>

                        <div className={styles.formContent}>
                            <div className="text-center p-6 bg-slate-50 rounded-xl mb-6">
                                <i className="pi pi-lock text-2xl text-slate-400 mb-3 block"></i>
                                <p className="text-slate-600 text-sm">
                                    We partner with Stripe for secure payments and automated payouts.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Button
                                label="Connect Stripe"
                                icon="pi pi-wallet"
                                loading={loading}
                                onClick={handleStripeConnect}
                                className="w-full p-button-lg"
                            />

                            <div className="flex justify-between items-center mt-2">
                                <Button
                                    label="Back"
                                    icon="pi pi-arrow-left"
                                    className="p-button-text p-button-secondary p-button-sm"
                                    onClick={() => setStep("inventory")}
                                    disabled={loading}
                                />
                                <Button
                                    label="I'll do this later"
                                    className="text-slate-500 hover:text-slate-700 p-button-text p-button-sm"
                                    onClick={handleSkipStripe}
                                />
                            </div>
                        </div>

                        <p className="text-xs text-center text-slate-400 mt-4">
                            Note: You must connect Stripe before sharing your booking link.
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
