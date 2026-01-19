"use client";

import React from "react";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import { InputNumber } from "primereact/inputnumber";
import { getDayOfWeekLabel } from "@/app/utils/schedule-helpers";
import {
  patternOptions,
  weekOptions,
  allDaysOfWeek,
} from "./utils/schedule-options";
import { SchedulePatternSelectorProps } from "./types/schedule";
import sharedStyles from "./shared.module.css";
import styles from "./SchedulePatternSelector.module.css";

export default function SchedulePatternSelector({
  patternType,
  onPatternTypeChange,
  daysOfWeek,
  onDaysOfWeekChange,
  dayOfMonth,
  onDayOfMonthChange,
  monthlyWeekNumber,
  onMonthlyWeekNumberChange,
}: SchedulePatternSelectorProps) {
  const handleDayToggle = (day: number) => {
    if (daysOfWeek.includes(day)) {
      onDaysOfWeekChange(daysOfWeek.filter((d) => d !== day));
    } else {
      onDaysOfWeekChange([...daysOfWeek, day]);
    }
  };

  const showDaysOfWeek =
    patternType === "weekly" ||
    patternType === "biweekly" ||
    patternType === "monthly_day" ||
    patternType === "custom";

  const showDayOfMonth = patternType === "monthly_date";
  const showMonthlyWeekNumber = patternType === "monthly_day";

  return (
    <div className={styles.patternSelector}>
      <div className={sharedStyles.field}>
        <label htmlFor="patternType">Pattern Type</label>
        <Dropdown
          id="patternType"
          value={patternType}
          onChange={(e) => onPatternTypeChange(e.value)}
          options={patternOptions}
          optionLabel="label"
          placeholder="Select pattern type"
        />
      </div>

      {showDaysOfWeek && (
        <div className={sharedStyles.field} style={{ marginTop: "1rem" }}>
          <label>Days of Week</label>
          <div className={styles.dayOfWeekCheckboxes}>
            {allDaysOfWeek.map((day) => (
              <div key={day} className="flex align-items-center gap-2">
                <Checkbox
                  inputId={`day-${day}`}
                  checked={daysOfWeek.includes(day)}
                  onChange={() => handleDayToggle(day)}
                />
                <label
                  htmlFor={`day-${day}`}
                  style={{ cursor: "pointer", userSelect: "none" }}
                >
                  {getDayOfWeekLabel(day)}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {showDayOfMonth && (
        <div className={sharedStyles.field} style={{ marginTop: "1rem" }}>
          <label htmlFor="dayOfMonth">Day of Month</label>
          <InputNumber
            id="dayOfMonth"
            value={dayOfMonth || undefined}
            onValueChange={(e) => onDayOfMonthChange(e.value || null)}
            min={1}
            max={31}
            placeholder="1-31"
          />
          <small className="text-500 mt-1">
            Select which day of the month (1-31)
          </small>
        </div>
      )}

      {showMonthlyWeekNumber && (
        <div className={sharedStyles.field} style={{ marginTop: "1rem" }}>
          <label htmlFor="monthlyWeekNumber">Week of Month</label>
          <Dropdown
            id="monthlyWeekNumber"
            value={monthlyWeekNumber}
            onChange={(e) => onMonthlyWeekNumberChange(e.value)}
            options={weekOptions}
            optionLabel="label"
            placeholder="Select week"
          />
          <small className="text-500 mt-1">
            Select which occurrence of the day (e.g., 2nd Tuesday)
          </small>
        </div>
      )}
    </div>
  );
}
