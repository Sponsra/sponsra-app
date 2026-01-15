"use client";

import { useContext } from "react";
import { ThemeContext, ThemeColor } from "@/lib/ThemeContext";
import { ToggleButton } from "primereact/togglebutton";
import styles from "./settings.module.css"; // We will create this next

export default function AppearanceSettings() {
  const { isDark, themeColor, toggleTheme, setThemeColor } =
    useContext(ThemeContext);

  const themeColors: { label: string; value: ThemeColor; color: string }[] = [
    { label: "Indigo", value: "indigo", color: "#6366f1" },
    { label: "Blue", value: "blue", color: "#3b82f6" },
    { label: "Purple", value: "purple", color: "#a855f7" },
    { label: "Teal", value: "teal", color: "#14b8a6" },
    { label: "Amber", value: "amber", color: "#f59e0b" },
    { label: "Cyan", value: "cyan", color: "#06b6d4" },
    { label: "Pink", value: "pink", color: "#ec4899" },
  ];

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2>Appearance</h2>
        <p>Customize the look and feel of your dashboard</p>
      </div>

      {/* Dark Mode Toggle */}
      <div className={styles.row}>
        <div>
          <div className={styles.label}>Dark Mode</div>
          <div className={styles.sublabel}>
            Switch between light and dark themes
          </div>
        </div>
        <ToggleButton
          checked={isDark}
          onChange={toggleTheme}
          onLabel="On"
          offLabel="Off"
          className="w-24" // using PrimeFlex utility class if avail, or custom
        />
      </div>

      {/* Theme Color Selection */}
      <div className="mt-4">
        <div className={styles.label + " mb-3"}>Theme Color</div>
        <div className={styles.colorGrid}>
          {themeColors.map((colorOption) => (
            <button
              key={colorOption.value}
              onClick={() => setThemeColor(colorOption.value)}
              className={`${styles.colorBtn} ${
                themeColor === colorOption.value ? styles.active : ""
              }`}
              style={
                {
                  "--btn-color": colorOption.color,
                  background:
                    themeColor === colorOption.value
                      ? `${colorOption.color}15`
                      : "var(--surface-0)",
                } as React.CSSProperties
              }
            >
              <div
                className={styles.colorDot}
                style={{ background: colorOption.color }}
              />
              <span>{colorOption.label}</span>
            </button>
          ))}
        </div>
        <p className={styles.helperText}>
          Available Lara theme colors. Theme files located in{" "}
          <code>/public/themes/</code>.
        </p>
      </div>
    </div>
  );
}
