// app/utils/schedule-helpers.ts
// Helper functions for schedule UI logic

import {
  getCanonicalDate,
  iterateDates,
  matchesPattern,
} from "./date-patterns";
import {
  PublicationSchedule,
  AvailabilitySchedule,
  PatternType,
} from "@/app/types/inventory";

/**
 * Generate N upcoming dates based on schedule configuration
 * Uses iterateDates() and matchesPattern() from date-patterns.ts
 * Handles both recurring patterns and one-off dates
 * Returns array of date strings (YYYY-MM-DD)
 */
export function generatePreviewDates(
  schedule: PublicationSchedule | AvailabilitySchedule | null,
  startDate: Date = new Date(),
  count: number = 15
): string[] {
  if (!schedule) return [];

  const results: string[] = [];
  const startDateStr = startDate.toISOString().split("T")[0];
  
  // Calculate end date (3 months from start for performance)
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 3);
  const endDateStr = endDate.toISOString().split("T")[0];

  if (schedule.schedule_type === "one_off") {
    // For one-off schedules, use specific_dates
    if (schedule.specific_dates && schedule.specific_dates.length > 0) {
      const sorted = [...schedule.specific_dates]
        .filter((d) => d >= startDateStr)
        .sort()
        .slice(0, count);
      return sorted;
    }
    return [];
  }

  if (schedule.schedule_type === "all_dates") {
    // For all_dates, generate dates within range
    const rangeStart = schedule.start_date || startDateStr;
    const rangeEnd = schedule.end_date || endDateStr;
    const effectiveEnd = rangeEnd < endDateStr ? rangeEnd : endDateStr;
    
    iterateDates(rangeStart, effectiveEnd, (date) => {
      if (results.length >= count) return;
      const dateStr = date.toISOString().split("T")[0];
      if (dateStr >= startDateStr) {
        results.push(dateStr);
      }
    });
    return results.slice(0, count);
  }

  // Recurring pattern
  if (!schedule.pattern_type || !schedule.start_date) return [];

  const effectiveEnd = schedule.end_date
    ? schedule.end_date < endDateStr
      ? schedule.end_date
      : endDateStr
    : endDateStr;

  iterateDates(schedule.start_date, effectiveEnd, (date) => {
    if (results.length >= count) return;
    const dateStr = date.toISOString().split("T")[0];
    
    // Skip dates before start
    if (dateStr < startDateStr) return;

    // Check if date matches pattern
    if (matchesPattern(date, schedule)) {
      results.push(dateStr);
    }
  });

  // Also add specific_dates (one-off dates) if they exist
  if (schedule.specific_dates && schedule.specific_dates.length > 0) {
    schedule.specific_dates.forEach((dateStr) => {
      if (results.length >= count) return;
      if (dateStr >= startDateStr && dateStr <= effectiveEnd) {
        if (!results.includes(dateStr)) {
          results.push(dateStr);
        }
      }
    });
  }

  // Sort and limit results
  return results.sort().slice(0, count);
}

/**
 * Validate schedule configuration before saving
 * Returns { valid: boolean, errors: string[] }
 */
export function validateSchedule(
  schedule: PublicationSchedule | AvailabilitySchedule
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!schedule.schedule_type) {
    errors.push("Schedule type is required");
  }

  if (schedule.schedule_type === "recurring") {
    if (!schedule.pattern_type) {
      errors.push("Pattern type is required for recurring schedules");
    }

    if (!schedule.start_date) {
      errors.push("Start date is required for recurring schedules");
    }

    if (schedule.end_date && schedule.start_date) {
      if (schedule.end_date < schedule.start_date) {
        errors.push("End date must be after start date");
      }
    }

    if (
      schedule.pattern_type === "weekly" ||
      schedule.pattern_type === "biweekly" ||
      schedule.pattern_type === "monthly_day" ||
      schedule.pattern_type === "custom"
    ) {
      if (
        !schedule.days_of_week ||
        schedule.days_of_week.length === 0
      ) {
        errors.push("At least one day of week is required");
      }
    }

    if (schedule.pattern_type === "monthly_date") {
      if (!schedule.day_of_month || schedule.day_of_month < 1 || schedule.day_of_month > 31) {
        errors.push("Day of month must be between 1 and 31");
      }
    }

    if (schedule.pattern_type === "monthly_day") {
      if (
        !schedule.monthly_week_number ||
        schedule.monthly_week_number < 1 ||
        schedule.monthly_week_number > 5
      ) {
        errors.push("Monthly week number must be between 1 and 5");
      }
    }
  }

  if (schedule.schedule_type === "one_off") {
    if (!schedule.specific_dates || schedule.specific_dates.length === 0) {
      errors.push("At least one specific date is required for one-off schedules");
    }
  }

  if (schedule.schedule_type === "all_dates") {
    if (schedule.start_date && schedule.end_date) {
      if (schedule.end_date < schedule.start_date) {
        errors.push("End date must be after start date");
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Generate human-readable description of schedule
 * Example: "Weekly on Monday, Wednesday, Friday"
 */
export function formatScheduleDescription(
  schedule: PublicationSchedule | AvailabilitySchedule | null
): string {
  if (!schedule) return "No schedule configured";

  if (schedule.schedule_type === "all_dates") {
    if (schedule.start_date && schedule.end_date) {
      return `All dates from ${schedule.start_date} to ${schedule.end_date}`;
    }
    if (schedule.start_date) {
      return `All dates from ${schedule.start_date}`;
    }
    if (schedule.end_date) {
      return `All dates until ${schedule.end_date}`;
    }
    return "All dates";
  }

  if (schedule.schedule_type === "one_off") {
    const count = schedule.specific_dates?.length || 0;
    return `${count} specific date${count !== 1 ? "s" : ""}`;
  }

  if (schedule.schedule_type === "recurring") {
    if (!schedule.pattern_type) return "Recurring (pattern not configured)";

    switch (schedule.pattern_type) {
      case "weekly":
        if (schedule.days_of_week && schedule.days_of_week.length > 0) {
          const days = schedule.days_of_week
            .map(getDayOfWeekLabel)
            .join(", ");
          return `Weekly on ${days}`;
        }
        return "Weekly (days not configured)";

      case "biweekly":
        if (schedule.days_of_week && schedule.days_of_week.length > 0) {
          const days = schedule.days_of_week
            .map(getDayOfWeekLabel)
            .join(", ");
          return `Bi-weekly on ${days}`;
        }
        return "Bi-weekly (days not configured)";

      case "monthly_date":
        if (schedule.day_of_month) {
          return `Monthly on the ${schedule.day_of_month}${getOrdinalSuffix(schedule.day_of_month)}`;
        }
        return "Monthly (day not configured)";

      case "monthly_day":
        if (
          schedule.days_of_week &&
          schedule.days_of_week.length > 0 &&
          schedule.monthly_week_number
        ) {
          const day = getDayOfWeekLabel(schedule.days_of_week[0]);
          const week = getWeekOrdinal(schedule.monthly_week_number);
          return `Monthly on the ${week} ${day}`;
        }
        return "Monthly (configuration incomplete)";

      case "custom":
        if (schedule.days_of_week && schedule.days_of_week.length > 0) {
          const days = schedule.days_of_week
            .map(getDayOfWeekLabel)
            .join(", ");
          return `Custom: ${days}`;
        }
        return "Custom (days not configured)";

      default:
        return "Recurring schedule";
    }
  }

  return "Unknown schedule type";
}

/**
 * Convert day number (0-6) to label ("Sunday", "Monday", etc.)
 */
export function getDayOfWeekLabel(dayNumber: number): string {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[dayNumber] || `Day ${dayNumber}`;
}

/**
 * Get ordinal suffix for day of month (1st, 2nd, 3rd, etc.)
 */
function getOrdinalSuffix(day: number): string {
  if (day >= 11 && day <= 13) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

/**
 * Get week ordinal (1st, 2nd, 3rd, 4th, 5th)
 */
function getWeekOrdinal(week: number): string {
  if (week >= 1 && week <= 5) {
    return `${week}${getOrdinalSuffix(week)}`;
  }
  return `${week}`;
}
