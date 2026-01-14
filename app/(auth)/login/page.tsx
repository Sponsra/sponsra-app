"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Divider } from "primereact/divider";
import { Message } from "primereact/message";

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
      // NEW:
      router.push("/dashboard");
    }
  };

  const handleSignUp = async () => {
    setLoading(true);
    setError(null);

    // This creates the user AND triggers our SQL function to make a profile
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
      // User is auto-confirmed (local dev) - redirect immediately
      router.push("/");
    } else {
      // Email confirmation required (production)
      setError("Check your email for the confirmation link!");
      setLoading(false);
    }
  };

  return (
    <div className="flex align-items-center justify-content-center min-h-screen surface-ground">
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background: "var(--surface-ground)",
        }}
      >
        <Card
          title="Welcome to Sponsra"
          subTitle="The Creator Infrastructure Platform"
          style={{ width: "400px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
        >
          {error && (
            <Message
              severity={error.includes("Check") ? "success" : "error"}
              text={error}
              style={{ width: "100%", marginBottom: "1rem" }}
            />
          )}

          <form onSubmit={handleLogin} className="flex flex-column gap-3">
            <div
              className="flex flex-column gap-2"
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <span className="p-float-label">
                <InputText
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: "100%" }}
                />
                <label htmlFor="email">Email</label>
              </span>

              <span className="p-float-label">
                <Password
                  inputId="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  toggleMask
                  feedback={false}
                  inputStyle={{ width: "100%" }}
                  style={{ width: "100%" }}
                />
                <label htmlFor="password">Password</label>
              </span>
            </div>

            <Button
              label="Sign In"
              icon="pi pi-sign-in"
              loading={loading}
              type="submit"
              style={{ marginTop: "1rem", width: "100%" }}
            />
          </form>

          <Divider align="center">
            <span className="p-tag">OR</span>
          </Divider>

          <Button
            label="Create New Account"
            icon="pi pi-user-plus"
            severity="secondary"
            outlined
            style={{ width: "100%" }}
            onClick={handleSignUp}
            loading={loading}
          />
        </Card>
      </div>
    </div>
  );
}
