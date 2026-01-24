"use client";

import { useContext } from "react";
import { ThemeContext } from "@/lib/ThemeContext";
import { ToggleButton } from "primereact/togglebutton";
import sharedStyles from "./shared.module.css";
import styles from "./AppearanceSettings.module.css";

export default function AppearanceSettings() {
  const { isDark, toggleTheme } = useContext(ThemeContext);

  return (
    <div className={sharedStyles.section}>
      <div className={sharedStyles.sectionHeader}>
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
          className="w-24"
        />
      </div>
    </div>
  );
}
