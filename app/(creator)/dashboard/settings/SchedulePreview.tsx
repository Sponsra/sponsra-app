// app/(creator)/dashboard/settings/SchedulePreview.tsx
// Reusable component for displaying upcoming dates preview

"use client";

import React, { useMemo } from "react";
import {
  PublicationSchedule,
  AvailabilitySchedule,
} from "@/app/types/inventory";
import { generatePreviewDates } from "@/app/utils/schedule-helpers";
import styles from "./settings.module.css";

interface SchedulePreviewProps {
  schedule: PublicationSchedule | AvailabilitySchedule | null;
  startDate?: Date; // Default: today
  count?: number; // Default: 15
  isLoading?: boolean;
}

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

  const formatDate = (dateStr: string): string => {
    const date = new Date(`${dateStr}T00:00:00Z`);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

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
            {formatDate(dateStr)}
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
