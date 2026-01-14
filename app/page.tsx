"use client";
import { useContext } from "react";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { ThemeContext } from "@/lib/ThemeContext";

export default function Home() {
  const { isDark, toggleTheme } = useContext(ThemeContext);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        gap: "2rem",
        transition: "background-color 0.3s",
      }}
    >
      <Card
        title="Sponsra Phase 0: Complete"
        subTitle="Foundation Check"
        style={{ width: "25rem" }}
      >
        <p className="m-0" style={{ marginBottom: "2rem", lineHeight: "1.6" }}>
          Current Vibe: <strong>{isDark ? "Dark Mode" : "Light Mode"}</strong>
        </p>

        <div style={{ display: "flex", gap: "1rem" }}>
          <Button
            label="Toggle Theme"
            icon="pi pi-palette"
            onClick={toggleTheme}
          />
          <Button
            label="System Ready"
            icon="pi pi-check"
            severity="success"
            outlined
          />
        </div>
      </Card>
    </div>
  );
}
