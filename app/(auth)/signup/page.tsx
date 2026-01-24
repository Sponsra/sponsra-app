"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Checkbox } from "primereact/checkbox";
import { Message } from "primereact/message";
import { signupWithNewsletter } from "@/app/actions/signup";
import styles from "./signup.module.css";

export default function SignupPage() {
    const [newsletterName, setNewsletterName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [agreed, setAgreed] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!newsletterName.trim()) return setError("Newsletter name is required");
        if (!email.trim()) return setError("Email is required");
        if (!password) return setError("Password is required");
        if (password !== confirmPassword) return setError("Passwords do not match");
        if (!agreed) return setError("You must agree to the terms and conditions");

        setLoading(true);

        const res = await signupWithNewsletter({
            email,
            password,
            newsletterName,
        });

        if (res.success) {
            // In a real app with email confirmation off, we could redirect to dashboard.
            // If email confirmation is on, we should show a specific success message.
            // Assuming default Supabase behavior (often requires confirmation or auto-confirms in dev).
            // We'll redirect to dashboard, hoping session is established or allow the auth listener to handle it.
            router.push("/dashboard");
        } else {
            setError(res.error || "Signup failed");
            setLoading(false);
        }
    };

    // Helper to generic slug preview
    const getSlugPreview = () => {
        if (!newsletterName) return "your-newsletter";
        return newsletterName
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_-]+/g, "-")
            .replace(/^-+|-+$/g, "");
    };

    return (
        <div className={styles.container}>
            {/* Left Side: Brand Visual */}
            <div className={styles.brandSection}>
                {/* Background Image */}
                <div className={styles.brandImageWrapper}>
                    <Image
                        src="/signup-bg.png"
                        alt="Background"
                        fill
                        style={{ objectFit: 'cover' }}
                        sizes="50vw"
                        priority
                    />
                    <div className={styles.brandOverlay} />
                </div>

                <div className={styles.brandContent}>
                    <div className={styles.logo}>
                        <Image
                            src="/logo.svg"
                            alt="Sponsra Logo"
                            width={48}
                            height={48}
                            priority
                            style={{ objectFit: 'contain' }}
                        />
                        <span>Sponsra</span>
                    </div>
                    <h1 className={styles.brandTitle}>
                        Sponsorships on Autopilot.
                    </h1>
                    <p className={styles.brandDescription}>
                        The easiest way to sell ads on your newsletter. Stop chasing invoices and PDF attachments—give sponsors a seamless booking experience so you can get back to writing.
                    </p>

                    <div className={styles.stepsContainer}>
                        <p className={styles.stepsTitle}>How to get paid:</p>
                        <div className={styles.step}>
                            <span className={styles.checkmark}>✓</span>
                            <p><strong>Define:</strong> Set your ad slots and prices.</p>
                        </div>
                        <div className={styles.step}>
                            <span className={styles.checkmark}>✓</span>
                            <p><strong>Share:</strong> Drop your Sponsra link in your footer.</p>
                        </div>
                        <div className={styles.step}>
                            <span className={styles.checkmark}>✓</span>
                            <p><strong>Earn:</strong> Wake up to paid bookings and ready-to-use assets.</p>
                        </div>
                    </div>

                </div>
            </div>

            {/* Right Side: Signup Form */}
            <div className={styles.formSection}>
                <div className={styles.formCard}>
                    <div className={styles.header}>
                        <h2 className={styles.title}>Sign Up</h2>
                        <p className={styles.subtitle}>Get started with Sponsra today</p>
                    </div>

                    {error && (
                        <Message
                            severity="error"
                            text={error}
                            className={styles.message}
                        />
                    )}

                    <form onSubmit={handleSignup} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="newsletter" className={styles.label}>
                                Newsletter Name
                            </label>
                            <InputText
                                id="newsletter"
                                value={newsletterName}
                                onChange={(e) => setNewsletterName(e.target.value)}
                                placeholder="e.g. Daily Tech Digest"
                                className={styles["w-full"]}
                            />
                            {newsletterName && (
                                <p className={styles.helper}>
                                    sponsra.com/<strong>{getSlugPreview()}</strong>
                                </p>
                            )}
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="email" className={styles.label}>
                                Email Address
                            </label>
                            <InputText
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className={styles["w-full"]}
                            />
                        </div>

                        <div className={styles.passwordRow}>
                            <div className={styles.inputGroup}>
                                <label htmlFor="password" className={styles.label}>
                                    Password
                                </label>
                                <Password
                                    inputId="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    toggleMask
                                    feedback={false}
                                    placeholder="Create password"
                                    inputClassName={styles["w-full"]}
                                    className={styles["w-full"]}
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label htmlFor="confirm" className={styles.label}>
                                    Confirm Password
                                </label>
                                <Password
                                    inputId="confirm"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    toggleMask
                                    feedback={false}
                                    placeholder="Confirm password"
                                    inputClassName={styles["w-full"]}
                                    className={styles["w-full"]}
                                />
                            </div>
                        </div>

                        <div className={styles.termsWrapper}>
                            <Checkbox
                                inputId="terms"
                                checked={agreed}
                                onChange={e => setAgreed(e.checked || false)}
                            />
                            <label htmlFor="terms" className={styles.termsLabel}>
                                I agree to the <Link href="/terms" className="text-indigo-600 hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</Link>.
                            </label>
                        </div>

                        <Button
                            label={loading ? "Creating Account..." : "Sign Up"}
                            icon={loading ? "pi pi-spin pi-spinner" : "pi pi-arrow-right"}
                            iconPos="right"
                            loading={loading}
                            type="submit"
                            className={styles.submitButton}
                        />
                    </form>

                    <div className={styles.loginLink}>
                        Already have an account?
                        <Link href="/login" className={styles.link}>
                            Log in here
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
