// app/(creator)/dashboard/settings/TierAvailabilitySection.tsx
// Tier availability schedule configuration

"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { RadioButton } from "primereact/radiobutton";
import { Calendar } from "primereact/calendar";
import { Checkbox } from "primereact/checkbox";
import { InputNumber } from "primereact/inputnumber";
import {
  getTierAvailability,
  getNewsletterSchedule,
} from "@/app/actions/inventory";
import {
  AvailabilitySchedule,
  PublicationSchedule,
  ScheduleType,
  PatternType,
} from "@/app/types/inventory";
import { validateSchedule } from "@/app/utils/schedule-helpers";
import SchedulePatternSelector from "./SchedulePatternSelector";
import SchedulePreview from "./SchedulePreview";
import styles from "./settings.module.css";

interface TierAvailabilitySectionProps {
  tierId: string | undefined; // undefined for new tiers
  newsletterId: string;
  onScheduleChange?: (schedule: AvailabilitySchedule | null) => void;
}

export default function TierAvailabilitySection({
  tierId,
  newsletterId,
  onScheduleChange,
}: TierAvailabilitySectionProps) {
  const toast = useRef<Toast>(null);
  const [fetching, setFetching] = useState(false);
  const [schedule, setSchedule] = useState<AvailabilitySchedule | null>(null);
  const [newsletterSchedule, setNewsletterSchedule] =
    useState<PublicationSchedule | null>(null);

  // Form state
  const [scheduleType, setScheduleType] = useState<ScheduleType>("all_dates");
  const [inheritFromNewsletter, setInheritFromNewsletter] = useState(false);
  const [patternType, setPatternType] = useState<PatternType | null>(null);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]);
  const [dayOfMonth, setDayOfMonth] = useState<number | null>(null);
  const [monthlyWeekNumber, setMonthlyWeekNumber] = useState<number | null>(
    null
  );
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [specificDates, setSpecificDates] = useState<Date[]>([]);
  const [isAvailable, setIsAvailable] = useState(true);
  const [capacity, setCapacity] = useState(1);

  // Fetch newsletter schedule
  useEffect(() => {
    async function fetchNewsletterSchedule() {
      try {
        const data = await getNewsletterSchedule(newsletterId);
        setNewsletterSchedule(data);
      } catch (error) {
        console.error("Error fetching newsletter schedule:", error);
      }
    }
    if (newsletterId) {
      fetchNewsletterSchedule();
    }
  }, [newsletterId]);

  // Fetch tier availability schedule
  useEffect(() => {
    async function fetchTierSchedule() {
      if (!tierId) {
        setSchedule(null);
        return;
      }
      setFetching(true);
      try {
        const data = await getTierAvailability(tierId);
        if (data) {
          setSchedule(data);
          setScheduleType(data.schedule_type);
          setInheritFromNewsletter(false); // Explicit schedule means not inheriting
          setPatternType(data.pattern_type || null);
          setDaysOfWeek(data.days_of_week || []);
          setDayOfMonth(data.day_of_month || null);
          setMonthlyWeekNumber(data.monthly_week_number || null);
          setStartDate(
            data.start_date ? new Date(`${data.start_date}T00:00:00Z`) : null
          );
          setEndDate(
            data.end_date ? new Date(`${data.end_date}T00:00:00Z`) : null
          );
          if (data.specific_dates && data.specific_dates.length > 0) {
            setSpecificDates(
              data.specific_dates.map((d) => new Date(`${d}T00:00:00Z`))
            );
          }
          setIsAvailable(data.is_available ?? true);
          setCapacity(data.capacity ?? 1);
        } else {
          // No schedule exists, default to inheriting from newsletter
          setInheritFromNewsletter(true);
        }
      } catch (error) {
        console.error("Error fetching tier schedule:", error);
      } finally {
        setFetching(false);
      }
    }
    if (tierId) {
      fetchTierSchedule();
    } else {
      // New tier, default to inheriting
      setInheritFromNewsletter(true);
    }
  }, [tierId]);

  // Update parent when schedule changes
  useEffect(() => {
    if (onScheduleChange) {
      if (inheritFromNewsletter) {
        onScheduleChange(null);
      } else {
        const scheduleData: AvailabilitySchedule = {
          id: schedule?.id,
          tier_id: tierId || "",
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
          start_date: startDate
            ? startDate.toISOString().split("T")[0]
            : null,
          end_date: endDate ? endDate.toISOString().split("T")[0] : null,
          specific_dates:
            scheduleType === "one_off" && specificDates.length > 0
              ? specificDates.map((d) => d.toISOString().split("T")[0])
              : null,
          is_available: isAvailable,
          capacity: capacity,
        };
        onScheduleChange(scheduleData);
      }
    }
  }, [
    scheduleType,
    inheritFromNewsletter,
    patternType,
    daysOfWeek,
    dayOfMonth,
    monthlyWeekNumber,
    startDate,
    endDate,
    specificDates,
    isAvailable,
    capacity,
    tierId,
    schedule?.id,
    onScheduleChange,
  ]);

  // Build preview schedule
  const previewSchedule: AvailabilitySchedule | PublicationSchedule | null =
    inheritFromNewsletter
      ? newsletterSchedule
      : schedule
      ? {
          ...schedule,
          schedule_type: scheduleType,
          pattern_type: scheduleType === "recurring" ? patternType : null,
          days_of_week:
            scheduleType === "recurring" &&
            (patternType === "weekly" ||
              patternType === "biweekly" ||
              patternType === "monthly_day" ||
              patternType === "custom")
              ? daysOfWeek
              : schedule.days_of_week || null,
          day_of_month:
            scheduleType === "recurring" && patternType === "monthly_date"
              ? dayOfMonth
              : schedule.day_of_month || null,
          monthly_week_number:
            scheduleType === "recurring" && patternType === "monthly_day"
              ? monthlyWeekNumber
              : schedule.monthly_week_number || null,
          start_date: startDate
            ? startDate.toISOString().split("T")[0]
            : schedule.start_date || null,
          end_date: endDate
            ? endDate.toISOString().split("T")[0]
            : schedule.end_date || null,
          specific_dates:
            scheduleType === "one_off" && specificDates.length > 0
              ? specificDates.map((d) => d.toISOString().split("T")[0])
              : schedule.specific_dates || null,
        }
      : null;

  if (fetching) {
    return <p className="text-500">Loading availability schedule...</p>;
  }

  return (
    <div>
      <Toast ref={toast} />

      {/* Inherit from Newsletter */}
      <div className="flex align-items-center mb-4">
        <Checkbox
          inputId="inheritFromNewsletter"
          checked={inheritFromNewsletter}
          onChange={(e) => setInheritFromNewsletter(e.checked || false)}
        />
        <label htmlFor="inheritFromNewsletter" className="ml-2">
          Inherit from Newsletter Schedule
        </label>
      </div>

      {inheritFromNewsletter ? (
        <div>
          {newsletterSchedule ? (
            <SchedulePreview schedule={newsletterSchedule} />
          ) : (
            <p className="text-500">
              No newsletter schedule configured. Please configure the newsletter
              publication schedule first.
            </p>
          )}
        </div>
      ) : (
        <>
          {/* Schedule Type */}
          <div className={styles.field}>
            <label>Availability Type</label>
            <div className="flex flex-column gap-2 mt-2">
              <div className="flex align-items-center">
                <RadioButton
                  inputId="all_dates"
                  name="availabilityType"
                  value="all_dates"
                  checked={scheduleType === "all_dates"}
                  onChange={(e) => setScheduleType(e.value)}
                />
                <label htmlFor="all_dates" className="ml-2">
                  All Newsletter Dates
                </label>
              </div>
              <div className="flex align-items-center">
                <RadioButton
                  inputId="recurring_avail"
                  name="availabilityType"
                  value="recurring"
                  checked={scheduleType === "recurring"}
                  onChange={(e) => setScheduleType(e.value)}
                />
                <label htmlFor="recurring_avail" className="ml-2">
                  Custom Recurring Pattern
                </label>
              </div>
              <div className="flex align-items-center">
                <RadioButton
                  inputId="one_off_avail"
                  name="availabilityType"
                  value="one_off"
                  checked={scheduleType === "one_off"}
                  onChange={(e) => setScheduleType(e.value)}
                />
                <label htmlFor="one_off_avail" className="ml-2">
                  Specific Dates Only
                </label>
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
                  <label htmlFor="startDate">Start Date (Optional)</label>
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
            </div>
          )}

          {scheduleType === "all_dates" && (
            <div className={styles.formGrid} style={{ marginTop: "1rem" }}>
              <div className={styles.field}>
                <label htmlFor="startDate">Start Date (Optional)</label>
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
              </div>
            </div>
          )}

          {/* Additional Fields */}
          <div className={styles.formGrid} style={{ marginTop: "1rem" }}>
            <div className={styles.field}>
              <div className="flex align-items-center gap-2">
                <Checkbox
                  inputId="is_available"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.checked || false)}
                />
                <label htmlFor="is_available">Available for Booking</label>
              </div>
            </div>
            <div className={styles.field}>
              <label htmlFor="capacity">Capacity</label>
              <InputNumber
                id="capacity"
                value={capacity}
                onValueChange={(e) => setCapacity(e.value || 1)}
                min={1}
                max={10}
              />
              <small className="text-500 mt-1">
                Number of bookings allowed per date
              </small>
            </div>
          </div>

          {/* Preview */}
          <div style={{ marginTop: "2rem" }}>
            <SchedulePreview schedule={previewSchedule} />
          </div>
        </>
      )}
    </div>
  );
}
