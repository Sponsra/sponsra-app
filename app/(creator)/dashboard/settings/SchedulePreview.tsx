"use client";

import React, { useMemo } from "react";
import { generatePreviewDates } from "@/app/utils/schedule-helpers";
import { formatPreviewDate } from "./utils/date-formatters";
import { SchedulePreviewProps } from "./types/schedule";
import styles from "./SchedulePreview.module.css";

export default function SchedulePreview({
  schedule,
  startDate = new Date(),
  count = 15,
  isLoading = false,
}: SchedulePreviewProps) {
  const previewDates = useMemo(() => {
    if (!schedule) return [];
    return generatePreviewDates(schedule, startDate, count);
  }, [schedule, startDate, count]);

  if (isLoading) {
    return (
      <div className={styles.schedulePreview}>
        <h4>Upcoming Dates</h4>
        <p className="text-500">Loading preview...</p>
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className={styles.schedulePreview}>
        <h4>Upcoming Dates</h4>
        <p className="text-500">No schedule configured</p>
      </div>
    );
  }

  if (previewDates.length === 0) {
    return (
      <div className={styles.schedulePreview}>
        <h4>Upcoming Dates</h4>
        <p className="text-500">No dates found in the next 3 months</p>
      </div>
    );
  }

  return (
    <div className={styles.schedulePreview}>
      <h4>Upcoming Dates ({previewDates.length})</h4>
      <div className={styles.previewDateList}>
        {previewDates.map((dateStr) => (
          <div key={dateStr} className={styles.previewDate}>
            {formatPreviewDate(dateStr)}
          </div>
        ))}
      </div>
      {previewDates.length === count && (
        <small className="text-500 mt-2">
          Showing first {count} dates. More dates may be available.
        </small>
      )}
    </div>
  );
}
