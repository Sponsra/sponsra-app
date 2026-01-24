"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Message } from "primereact/message";
import styles from "./login.module.css"; // Import the CSS module

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  const handleSignUp = async () => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else if (data.session) {
      router.push("/");
    } else {
      setError("Check your email for the confirmation link!");
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Brand Section - Left Side */}
      <div className={styles.brandSection}>
        <div className={styles.brandPattern} />
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
            Infrastructure for Newsletters
          </h1>
          <p className={styles.brandDescription}>
            Manage inventory, track bookings, and automate payouts—all in one place.
          </p>
        </div>
        <div style={{ opacity: 0.7, fontSize: "0.875rem" }}>
          © {new Date().getFullYear()} Sponsra Inc.
        </div>
      </div>

      {/* Form Section - Right Side */}
      <div className={styles.formSection}>
        <div className={styles.formContainer}>
          <div className={styles.header}>
            <h2 className={styles.title}>Welcome back</h2>
            <p className={styles.subtitle}>
              Enter your credentials to access your dashboard
            </p>
          </div>

          {error && (
            <Message
              severity={error.includes("Check") ? "success" : "error"}
              text={error}
              className={styles.message}
            />
          )}

          <form onSubmit={handleLogin} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>
                Email address
              </label>
              <InputText
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className={styles["w-full"]}
              />
            </div>

            <div className={styles.inputGroup}>
              <div className={styles.labelRow}>
                <label htmlFor="password" className={styles.label}>
                  Password
                </label>
                <a href="#" className={`${styles.link} ${styles.forgotPassword}`}>
                  Forgot password?
                </a>
              </div>
              <div className={styles.passwordWrapper}>
                <Password
                  inputId="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  toggleMask
                  feedback={false}
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <Button
              label={loading ? "Signing in..." : "Sign In"}
              icon={loading ? "pi pi-spin pi-spinner" : "pi pi-arrow-right"}
              iconPos="right"
              loading={loading}
              type="submit"
              className={styles.submitButton}
            />
          </form>

          <div className={styles.divider}>
            <span className={styles.dividerText}>or continue with</span>
          </div>

          <Button
            label="Create New Account"
            icon="pi pi-user-plus"
            severity="secondary"
            outlined
            className={styles.createAccountButton}
            onClick={handleSignUp}
            disabled={loading}
          />
        </div>
      </div>
    </div>
  );
}
