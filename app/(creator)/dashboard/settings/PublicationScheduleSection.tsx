// app/(creator)/dashboard/settings/PublicationScheduleSection.tsx
// Newsletter publication schedule configuration

"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { RadioButton } from "primereact/radiobutton";
import { Calendar } from "primereact/calendar";
import { Checkbox } from "primereact/checkbox";
import { InputNumber } from "primereact/inputnumber";
import {
  updateNewsletterSchedule,
  getNewsletterSchedule,
} from "@/app/actions/inventory";
import {
  PublicationSchedule,
  ScheduleType,
  PatternType,
} from "@/app/types/inventory";
import { validateSchedule } from "@/app/utils/schedule-helpers";
import SchedulePatternSelector from "./SchedulePatternSelector";
import SchedulePreview from "./SchedulePreview";
import styles from "./settings.module.css";

interface PublicationScheduleSectionProps {
  newsletterId: string;
}

export default function PublicationScheduleSection({
  newsletterId,
}: PublicationScheduleSectionProps) {
  const toast = useRef<Toast>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [schedule, setSchedule] = useState<PublicationSchedule | null>(null);

  // Form state
  const [scheduleType, setScheduleType] = useState<ScheduleType>("recurring");
  const [patternType, setPatternType] = useState<PatternType | null>(null);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]);
  const [dayOfMonth, setDayOfMonth] = useState<number | null>(null);
  const [monthlyWeekNumber, setMonthlyWeekNumber] = useState<number | null>(
    null
  );
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [specificDates, setSpecificDates] = useState<Date[]>([]);

  // Fetch initial schedule
  useEffect(() => {
    async function fetchSchedule() {
      setFetching(true);
      try {
        const data = await getNewsletterSchedule(newsletterId);
        if (data) {
          setSchedule(data);
          setScheduleType(data.schedule_type);
          setPatternType(data.pattern_type || null);
          setDaysOfWeek(data.days_of_week || []);
          setDayOfMonth(data.day_of_month || null);
          setMonthlyWeekNumber(data.monthly_week_number || null);
          setStartDate(data.start_date ? new Date(`${data.start_date}T00:00:00Z`) : null);
          setEndDate(data.end_date ? new Date(`${data.end_date}T00:00:00Z`) : null);
          if (data.specific_dates && data.specific_dates.length > 0) {
            setSpecificDates(
              data.specific_dates.map((d) => new Date(`${d}T00:00:00Z`))
            );
          }
        }
      } catch (error) {
        console.error("Error fetching schedule:", error);
      } finally {
        setFetching(false);
      }
    }
    if (newsletterId) {
      fetchSchedule();
    }
  }, [newsletterId]);

  const handleSave = async () => {
    if (!newsletterId) return;

    // Build schedule object
    let computedStartDate: string;
    if (scheduleType === "one_off" && specificDates.length > 0) {
      // For one_off, use the earliest specific date as start_date
      const sortedDates = [...specificDates].sort((a, b) => a.getTime() - b.getTime());
      computedStartDate = sortedDates[0].toISOString().split("T")[0];
    } else {
      computedStartDate = startDate
        ? startDate.toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];
    }

    const scheduleData: PublicationSchedule = {
      id: schedule?.id,
      newsletter_id: newsletterId,
      schedule_type: scheduleType,
      pattern_type: scheduleType === "recurring" ? patternType : null,
      days_of_week:
        scheduleType === "recurring" &&
        (patternType === "weekly" ||
          patternType === "biweekly" ||
          patternType === "monthly_day" ||
          patternType === "custom")
          ? daysOfWeek
          : null,
      day_of_month:
        scheduleType === "recurring" && patternType === "monthly_date"
          ? dayOfMonth
          : null,
      monthly_week_number:
        scheduleType === "recurring" && patternType === "monthly_day"
          ? monthlyWeekNumber
          : null,
      start_date: computedStartDate,
      end_date: endDate ? endDate.toISOString().split("T")[0] : null,
      specific_dates:
        scheduleType === "one_off" && specificDates.length > 0
          ? specificDates.map((d) => d.toISOString().split("T")[0])
          : scheduleType === "recurring" && schedule?.specific_dates
          ? schedule.specific_dates
          : null,
    };

    // Validate
    const validation = validateSchedule(scheduleData);
    if (!validation.valid) {
      toast.current?.show({
        severity: "error",
        summary: "Validation Error",
        detail: validation.errors.join(", "),
      });
      return;
    }

    setLoading(true);
    try {
      const result = await updateNewsletterSchedule(scheduleData);
      if (result.success) {
        setSchedule(scheduleData);
        toast.current?.show({
          severity: "success",
          summary: "Saved",
          detail: "Publication schedule updated successfully",
        });
      } else {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: result.error || "Failed to save schedule",
        });
      }
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "An unexpected error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  // Build current schedule for preview
  const previewSchedule: PublicationSchedule | null = (() => {
    // If we have required fields, build a preview schedule
    if (scheduleType === "one_off") {
      if (specificDates.length === 0) return null;
      return {
        id: schedule?.id,
        newsletter_id: newsletterId,
        schedule_type: scheduleType,
        pattern_type: null,
        days_of_week: null,
        day_of_month: null,
        monthly_week_number: null,
        start_date: new Date().toISOString().split("T")[0], // Required field
        end_date: null,
        specific_dates: specificDates.map((d) => d.toISOString().split("T")[0]),
      };
    }
    
    if (scheduleType === "recurring") {
      if (!patternType || !startDate) return null;
      return {
        id: schedule?.id,
        newsletter_id: newsletterId,
        schedule_type: scheduleType,
        pattern_type: patternType,
        days_of_week:
          patternType === "weekly" ||
          patternType === "biweekly" ||
          patternType === "monthly_day" ||
          patternType === "custom"
            ? daysOfWeek
            : null,
        day_of_month: patternType === "monthly_date" ? dayOfMonth : null,
        monthly_week_number:
          patternType === "monthly_day" ? monthlyWeekNumber : null,
        start_date: startDate.toISOString().split("T")[0],
        end_date: endDate ? endDate.toISOString().split("T")[0] : null,
        specific_dates: schedule?.specific_dates || null, // Preserve existing one-offs
      };
    }
    
    return null;
  })();

  if (fetching) {
    return (
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Publication Schedule</h2>
          <p>Configure when your newsletter is published</p>
        </div>
        <p className="text-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className={styles.section}>
      <Toast ref={toast} />
      <div className={styles.sectionHeader}>
        <h2>Publication Schedule</h2>
        <p>Configure when your newsletter is published</p>
      </div>

      <div className={styles.formGrid}>
        {/* Schedule Type */}
        <div className={styles.field}>
          <label>Schedule Type</label>
          <div className="flex flex-column gap-2 mt-2">
            <div className="flex align-items-center">
              <RadioButton
                inputId="recurring"
                name="scheduleType"
                value="recurring"
                checked={scheduleType === "recurring"}
                onChange={(e) => setScheduleType(e.value)}
              />
              <label htmlFor="recurring" className="ml-2">
                Recurring Pattern
              </label>
            </div>
            <div className="flex align-items-center">
              <RadioButton
                inputId="one_off"
                name="scheduleType"
                value="one_off"
                checked={scheduleType === "one_off"}
                onChange={(e) => setScheduleType(e.value)}
              />
              <label htmlFor="one_off" className="ml-2">
                One-off Dates
              </label>
            </div>
          </div>
        </div>
      </div>

      {scheduleType === "recurring" && (
        <>
          <SchedulePatternSelector
            patternType={patternType}
            onPatternTypeChange={setPatternType}
            daysOfWeek={daysOfWeek}
            onDaysOfWeekChange={setDaysOfWeek}
            dayOfMonth={dayOfMonth}
            onDayOfMonthChange={setDayOfMonth}
            monthlyWeekNumber={monthlyWeekNumber}
            onMonthlyWeekNumberChange={setMonthlyWeekNumber}
          />

          <div className={styles.formGrid} style={{ marginTop: "1rem" }}>
            <div className={styles.field}>
              <label htmlFor="startDate">Start Date</label>
              <Calendar
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.value as Date)}
                dateFormat="yy-mm-dd"
                showIcon
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="endDate">End Date (Optional)</label>
              <Calendar
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.value as Date)}
                dateFormat="yy-mm-dd"
                showIcon
              />
              <small className="text-500 mt-1">
                Leave empty for indefinite schedule
              </small>
            </div>
          </div>
        </>
      )}

      {scheduleType === "one_off" && (
        <div className={styles.field} style={{ marginTop: "1rem" }}>
          <label htmlFor="specificDates">Specific Dates</label>
          <Calendar
            id="specificDates"
            value={specificDates}
            onChange={(e) => setSpecificDates(e.value as Date[])}
            selectionMode="multiple"
            dateFormat="yy-mm-dd"
            showIcon
          />
          <small className="text-500 mt-1">
            Select one or more specific dates for publication
          </small>
        </div>
      )}

      {/* Preview */}
      <div style={{ marginTop: "2rem" }}>
        <SchedulePreview schedule={previewSchedule} />
      </div>

      {/* Actions */}
      <div className={styles.actions} style={{ marginTop: "1.5rem" }}>
        <Button
          label="Save Schedule"
          icon="pi pi-save"
          loading={loading}
          onClick={handleSave}
        />
      </div>
    </div>
  );
}
