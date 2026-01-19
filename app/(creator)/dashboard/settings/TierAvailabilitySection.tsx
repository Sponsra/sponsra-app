// app/(creator)/dashboard/settings/TierAvailabilitySection.tsx
// Tier availability schedule configuration

"use client";

import React, { useState, useEffect, useRef } from "react";
import { Toast } from "primereact/toast";
import { SelectButton } from "primereact/selectbutton";
import { Calendar } from "primereact/calendar";
import { Checkbox } from "primereact/checkbox";
import { InputNumber } from "primereact/inputnumber";
import { Divider } from "primereact/divider";
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
import SchedulePatternSelector from "./SchedulePatternSelector";
import SchedulePreview from "./SchedulePreview";
import sharedStyles from "./shared.module.css";

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
  const [newsletterSchedule, setNewsletterSchedule] = useState<PublicationSchedule | null>(null);

  // Simplified Mode Selection: 'inherit' | 'custom'
  const [mode, setMode] = useState<"inherit" | "custom">("inherit");

  // Form state
  const [scheduleType, setScheduleType] = useState<ScheduleType>("all_dates");
  const [patternType, setPatternType] = useState<PatternType | null>(null);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]);
  const [dayOfMonth, setDayOfMonth] = useState<number | null>(null);
  const [monthlyWeekNumber, setMonthlyWeekNumber] = useState<number | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [specificDates, setSpecificDates] = useState<Date[]>([]);
  const [isAvailable, setIsAvailable] = useState(true);
  const [capacity, setCapacity] = useState(1);

  // --- Options for SelectButtons ---
  const modeOptions = [
    { label: 'Follow Newsletter Schedule', value: 'inherit' },
    { label: 'Custom Availability', value: 'custom' }
  ];

  const typeOptions = [
    { label: 'All Dates', value: 'all_dates' },
    { label: 'Recurring Pattern', value: 'recurring' },
    { label: 'Specific Dates', value: 'one_off' }
  ];

  // Fetch Logic (Kept mostly same, just mapped to 'mode' state)
  useEffect(() => {
    async function init() {
      if (newsletterId) {
        getNewsletterSchedule(newsletterId).then(setNewsletterSchedule).catch(console.error);
      }
      
      if (!tierId) {
        setMode("inherit");
        return;
      }

      setFetching(true);
      try {
        const data = await getTierAvailability(tierId);
        if (data) {
          setSchedule(data);
          setMode("custom"); // If data exists, it's custom
          setScheduleType(data.schedule_type);
          setPatternType(data.pattern_type || null);
          setDaysOfWeek(data.days_of_week || []);
          setDayOfMonth(data.day_of_month || null);
          setMonthlyWeekNumber(data.monthly_week_number || null);
          setStartDate(data.start_date ? new Date(`${data.start_date}T00:00:00Z`) : null);
          setEndDate(data.end_date ? new Date(`${data.end_date}T00:00:00Z`) : null);
          if (data.specific_dates) setSpecificDates(data.specific_dates.map((d) => new Date(`${d}T00:00:00Z`)));
          setIsAvailable(data.is_available ?? true);
          setCapacity(data.capacity ?? 1);
        } else {
          setMode("inherit");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setFetching(false);
      }
    }
    init();
  }, [tierId, newsletterId]);

  // Update Parent
  useEffect(() => {
    if (!onScheduleChange) return;

    if (mode === "inherit") {
      onScheduleChange(null);
    } else {
      // Reconstruct the object
      const scheduleData: AvailabilitySchedule = {
        id: schedule?.id,
        tier_id: tierId || "",
        schedule_type: scheduleType,
        pattern_type: scheduleType === "recurring" ? patternType : null,
        days_of_week: daysOfWeek, 
        day_of_month: dayOfMonth,
        monthly_week_number: monthlyWeekNumber,
        start_date: startDate?.toISOString().split("T")[0] || null,
        end_date: endDate?.toISOString().split("T")[0] || null,
        specific_dates: specificDates.map((d) => d.toISOString().split("T")[0]),
        is_available: isAvailable,
        capacity: capacity,
      };
      onScheduleChange(scheduleData);
    }
  }, [mode, scheduleType, patternType, daysOfWeek, dayOfMonth, monthlyWeekNumber, startDate, endDate, specificDates, isAvailable, capacity, tierId, schedule?.id, onScheduleChange]);

  // Preview Logic
  const previewSchedule = mode === "inherit" 
    ? newsletterSchedule 
    : {
        // Construct temporary object for preview
        schedule_type: scheduleType,
        pattern_type: patternType,
        days_of_week: daysOfWeek,
        day_of_month: dayOfMonth,
        monthly_week_number: monthlyWeekNumber,
        start_date: startDate?.toISOString().split("T")[0],
        end_date: endDate?.toISOString().split("T")[0],
        specific_dates: specificDates.map(d => d.toISOString().split("T")[0]),
    } as AvailabilitySchedule;

  if (fetching) return <div className="p-4 text-center"><i className="pi pi-spin pi-spinner mr-2"></i>Loading...</div>;

  return (
    <div className="pt-2">
      <Toast ref={toast} />

      {/* 1. High Level Mode Selector */}
      <div className="flex flex-column gap-2 mb-4">
        <label className="font-bold">Strategy</label>
        <SelectButton 
            value={mode} 
            onChange={(e) => e.value && setMode(e.value)} 
            options={modeOptions} 
            className="w-full"
            pt={{ button: { className: 'w-6' }}}
        />
      </div>

      {mode === "inherit" ? (
        <div className="bg-blue-50 p-3 border-round border-1 border-blue-100">
           <div className="text-blue-900 font-medium mb-2">Inheriting Newsletter Schedule</div>
           <p className="text-sm text-blue-700 m-0 mb-3">
             This tier will be available on every date the newsletter is published.
           </p>
           {newsletterSchedule ? (
             <SchedulePreview schedule={newsletterSchedule} />
           ) : (
             <small className="text-red-500">No newsletter schedule found.</small>
           )}
        </div>
      ) : (
        <div className="animation-fade-in">
          <Divider align="center"><span className="text-sm text-500">Configuration</span></Divider>
          
          {/* 2. Schedule Type Selector */}
          <div className="field mb-4">
             <label className="font-bold mb-2 block">Availability Pattern</label>
             <SelectButton 
                value={scheduleType} 
                onChange={(e) => e.value && setScheduleType(e.value)} 
                options={typeOptions} 
             />
          </div>

          {/* 3. Conditional Inputs based on Type */}
          <div className="surface-ground p-3 border-round mb-4">
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
                <div className="formgrid grid mt-3">
                    <div className="field col-6">
                        <label>Start Date (Optional)</label>
                        <Calendar value={startDate} onChange={(e) => setStartDate(e.value as Date)} showIcon />
                    </div>
                    <div className="field col-6">
                        <label>End Date (Optional)</label>
                        <Calendar value={endDate} onChange={(e) => setEndDate(e.value as Date)} showIcon />
                    </div>
                </div>
                </>
            )}

            {scheduleType === "one_off" && (
                <div className="field">
                    <label>Select Dates</label>
                    <Calendar 
                        value={specificDates} 
                        onChange={(e) => setSpecificDates(e.value as Date[])} 
                        selectionMode="multiple" 
                        readOnlyInput 
                        showIcon
                        placeholder="Click to select multiple dates"
                    />
                </div>
            )}
            
            {scheduleType === "all_dates" && (
                <div className="text-500 text-sm text-center p-2">
                    Available on all dates defined by date range below.
                    <div className="formgrid grid mt-3 text-left">
                        <div className="field col-6">
                            <label>Start Date</label>
                            <Calendar value={startDate} onChange={(e) => setStartDate(e.value as Date)} showIcon />
                        </div>
                        <div className="field col-6">
                            <label>End Date</label>
                            <Calendar value={endDate} onChange={(e) => setEndDate(e.value as Date)} showIcon />
                        </div>
                    </div>
                </div>
            )}
          </div>

          {/* 4. Capacity & Availability */}
          <div className="formgrid grid">
            <div className="field col-6">
                <label className="font-bold">Inventory Capacity</label>
                <InputNumber 
                    value={capacity} 
                    onValueChange={(e) => setCapacity(e.value || 1)} 
                    showButtons 
                    min={1} 
                    max={50}
                    suffix=" slots" 
                />
            </div>
             <div className="field col-6 flex align-items-end mb-3">
                <div className="flex align-items-center">
                    <Checkbox inputId="is_avail" checked={isAvailable} onChange={e => setIsAvailable(e.checked!)} />
                    <label htmlFor="is_avail" className="ml-2">Bookable by Sponsors</label>
                </div>
            </div>
          </div>

          <Divider />
          
          <SchedulePreview schedule={previewSchedule} />
        </div>
      )}
    </div>
  );
}
