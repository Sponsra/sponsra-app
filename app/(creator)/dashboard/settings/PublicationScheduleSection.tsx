"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { SelectButton } from "primereact/selectbutton";
import { Calendar } from "primereact/calendar";
import { Divider } from "primereact/divider";
import { Message } from "primereact/message";
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
import sharedStyles from "./shared.module.css";

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

  // Options for the toggle switch
  const typeOptions = [
    { label: 'Recurring Pattern', value: 'recurring' },
    { label: 'Specific Dates (One-off)', value: 'one_off' }
  ];

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
        ["weekly", "biweekly", "monthly_day", "custom"].includes(patternType || "")
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
        toast.current?.show({ severity: "success", summary: "Saved", detail: "Schedule updated" });
      } else {
        toast.current?.show({ severity: "error", summary: "Error", detail: result.error || "Failed" });
      }
    } catch (error) {
      toast.current?.show({ severity: "error", summary: "Error", detail: "Unexpected error" });
    } finally {
      setLoading(false);
    }
  };

  // Build preview object
  const previewSchedule: PublicationSchedule | null = (() => {
    if (scheduleType === "one_off") {
      if (specificDates.length === 0) return null;
      return {
        // ... default props
        id: schedule?.id,
        newsletter_id: newsletterId,
        schedule_type: scheduleType,
        pattern_type: null,
        days_of_week: null,
        day_of_month: null,
        monthly_week_number: null,
        start_date: new Date().toISOString().split("T")[0],
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
        days_of_week: ["weekly", "biweekly", "monthly_day", "custom"].includes(patternType) ? daysOfWeek : null,
        day_of_month: patternType === "monthly_date" ? dayOfMonth : null,
        monthly_week_number: patternType === "monthly_day" ? monthlyWeekNumber : null,
        start_date: startDate.toISOString().split("T")[0],
        end_date: endDate ? endDate.toISOString().split("T")[0] : null,
        specific_dates: schedule?.specific_dates || null,
      };
    }
    return null;
  })();

  if (fetching) {
    return (
      <div className={sharedStyles.section}>
         <div className="flex flex-column gap-3">
            <div className="h-2rem w-10rem bg-gray-200 border-round"></div>
            <div className="h-4rem w-full bg-gray-100 border-round"></div>
         </div>
      </div>
    );
  }

  return (
    <div className={sharedStyles.section}>
      <Toast ref={toast} />
      
      <div className={sharedStyles.sectionHeader}>
        <h2>Publication Schedule</h2>
        <p>Define when your newsletter is sent out. This determines the base availability for all ad tiers.</p>
      </div>

      {/* 1. Main Toggle */}
      <div className="mb-4">
        <label className="font-bold block mb-2">How often do you publish?</label>
        <SelectButton 
            value={scheduleType} 
            onChange={(e) => e.value && setScheduleType(e.value)} 
            options={typeOptions} 
            className="w-full sm:w-auto"
        />
      </div>

      {/* 2. Configuration Container */}
      <div className="surface-ground p-4 border-round-lg border-1 border-gray-200 mb-4">
        
        {/* Recurring View */}
        {scheduleType === "recurring" && (
            <div className="animation-fade-in">
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

                <Divider />

                <div className="formgrid grid">
                    <div className="field col-12 sm:col-6">
                        <label htmlFor="startDate" className="font-semibold">Start Date</label>
                        <Calendar
                            id="startDate"
                            value={startDate}
                            onChange={(e) => setStartDate(e.value as Date)}
                            dateFormat="yy-mm-dd"
                            showIcon
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 sm:col-6">
                        <label htmlFor="endDate" className="font-semibold">End Date (Optional)</label>
                        <Calendar
                            id="endDate"
                            value={endDate}
                            onChange={(e) => setEndDate(e.value as Date)}
                            dateFormat="yy-mm-dd"
                            showIcon
                            placeholder="Indefinite"
                            className="w-full"
                        />
                    </div>
                </div>
            </div>
        )}

        {/* One-off View */}
        {scheduleType === "one_off" && (
            <div className="animation-fade-in">
                <Message 
                    severity="info" 
                    text="Select specific dates from the calendar below. Useful for quarterlies or irregular publications." 
                    className="w-full mb-3"
                    pt={{ icon: { className: 'hidden' } }}
                />
                <div className="field">
                    <label htmlFor="specificDates" className="font-semibold">Publication Dates</label>
                    <Calendar
                        id="specificDates"
                        value={specificDates}
                        onChange={(e) => setSpecificDates(e.value as Date[])}
                        selectionMode="multiple"
                        dateFormat="yy-mm-dd"
                        inline
                        className="w-full border-none shadow-none"
                    />
                </div>
            </div>
        )}
      </div>

      {/* 3. Preview & Action */}
      <div className="flex flex-column gap-4">
        <SchedulePreview schedule={previewSchedule} />
        
        <div className="flex justify-content-end border-top-1 border-gray-200 pt-3">
             <Button
                label="Save Configuration"
                icon="pi pi-check"
                loading={loading}
                onClick={handleSave}
            />
        </div>
      </div>

    </div>
  );
}
