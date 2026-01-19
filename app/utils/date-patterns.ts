// app/utils/date-patterns.ts
// UTC-based date pattern matching functions to prevent timezone shifts

/**
 * Force UTC interpretation to prevent off-by-one errors
 * Appends 'T00:00:00Z' to force UTC midnight
 */
export function getCanonicalDate(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00Z`);
}

/**
 * Check if a date matches a weekly pattern (specific days of week)
 * Uses .getUTCDay() to ensure Monday is Monday, regardless of server location
 */
export function matchesWeekly(date: Date, days: number[]): boolean {
  return days.includes(date.getUTCDay());
}

/**
 * Check if a date matches a bi-weekly pattern
 * For biweekly with multiple days, matches all specified days in the first week,
 * then repeats every 14 days.
 * 
 * Example: biweekly on [Monday, Wednesday] starting 2026-01-19:
 * - First cycle (days 0-6): Monday 2026-01-19, Wednesday 2026-01-21
 * - Second cycle (days 14-20): Monday 2026-02-02, Wednesday 2026-02-04
 * - Third cycle (days 28-34): Monday 2026-02-16, Wednesday 2026-02-18
 */
export function matchesBiweekly(
  date: Date,
  startDate: Date,
  days: number[]
): boolean {
  if (!matchesWeekly(date, days)) return false;
  
  // Calculate days difference in UTC
  const diffMs = date.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  // For each day in the pattern, find its first occurrence from start_date
  // and check if this date matches that occurrence or is 14*n days later
  const startDayOfWeek = startDate.getUTCDay();
  const dateDayOfWeek = date.getUTCDay();
  
  for (const targetDay of days) {
    // Calculate days from start_date to first occurrence of this target day
    let daysToFirstTarget = (targetDay - startDayOfWeek + 7) % 7;
    // If start_date is not the target day, and the calculation gives 0, 
    // it means the target day is 7 days later
    if (daysToFirstTarget === 0 && startDayOfWeek !== targetDay) {
      daysToFirstTarget = 7;
    }
    
    // Check if this date matches the target day AND is at the right offset
    if (dateDayOfWeek === targetDay) {
      // Check if diffDays matches: first occurrence + (14 * cycleNumber)
      const remainder = (diffDays - daysToFirstTarget) % 14;
      if (remainder === 0 && diffDays >= daysToFirstTarget) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Check if a date matches a monthly date pattern (e.g., 15th of every month)
 * Uses .getUTCDate() to ensure correct day regardless of timezone
 */
export function matchesMonthlyDate(date: Date, dayOfMonth: number): boolean {
  return date.getUTCDate() === dayOfMonth;
}

/**
 * Get the first occurrence of a day-of-week in a month
 * Helper for monthly_day pattern matching
 */
function getFirstDayOfWeekInMonth(
  firstOfMonth: Date,
  dayOfWeek: number
): number {
  const firstDayOfWeek = firstOfMonth.getUTCDay();
  const daysUntilTarget = (dayOfWeek - firstDayOfWeek + 7) % 7;
  return daysUntilTarget + 1; // +1 because day 1 is the first of the month
}

/**
 * Check if a date matches a monthly day pattern (e.g., 2nd Tuesday of every month)
 * Calculates which occurrence of this day-of-week in the month (1-5)
 */
export function matchesMonthlyDay(
  date: Date,
  daysOfWeek: number[],
  weekNumber: number
): boolean {
  if (!matchesWeekly(date, daysOfWeek)) return false;
  
  const firstOfMonth = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1)
  );
  const firstOccurrence = getFirstDayOfWeekInMonth(
    firstOfMonth,
    daysOfWeek[0]
  );
  const dateDay = date.getUTCDate();
  const occurrence = Math.floor((dateDay - firstOccurrence) / 7) + 1;
  return occurrence === weekNumber;
}

/**
 * Check if a date matches a custom pattern (same as weekly for now)
 */
export function matchesCustom(date: Date, days: number[]): boolean {
  return matchesWeekly(date, days);
}

/**
 * Iterate through dates in a range, calling callback for each date
 */
export function iterateDates(
  startDate: string,
  endDate: string,
  callback: (date: Date) => void
): void {
  const start = getCanonicalDate(startDate);
  const end = getCanonicalDate(endDate);
  const current = new Date(start);

  while (current <= end) {
    callback(new Date(current));
    current.setUTCDate(current.getUTCDate() + 1);
  }
}

/**
 * Check if a date matches a pattern based on schedule configuration
 */
export function matchesPattern(
  date: Date,
  schedule: {
    schedule_type: "recurring" | "one_off" | "all_dates";
    pattern_type?: "weekly" | "biweekly" | "monthly_date" | "monthly_day" | "custom" | null;
    days_of_week?: number[] | null;
    day_of_month?: number | null;
    monthly_week_number?: number | null;
    start_date?: string | null;
    end_date?: string | null;
  },
  debug?: boolean
): boolean {
  const dateStr = date.toISOString().split("T")[0];
  
  if (schedule.schedule_type === "all_dates") {
    // Check date range if specified
    if (schedule.start_date || schedule.end_date) {
      if (schedule.start_date && dateStr < schedule.start_date) {
        if (debug) console.log(`[matchesPattern] Date ${dateStr} before start_date ${schedule.start_date}`);
        return false;
      }
      if (schedule.end_date && dateStr > schedule.end_date) {
        if (debug) console.log(`[matchesPattern] Date ${dateStr} after end_date ${schedule.end_date}`);
        return false;
      }
    }
    if (debug) console.log(`[matchesPattern] Date ${dateStr} matches all_dates schedule`);
    return true;
  }

  if (schedule.schedule_type === "one_off") {
    // One-off dates are handled separately via specific_dates array
    if (debug) console.log(`[matchesPattern] Date ${dateStr} is one_off type, handled via specific_dates`);
    return false;
  }

  // Recurring pattern
  if (!schedule.pattern_type || !schedule.start_date) {
    if (debug) console.log(`[matchesPattern] Date ${dateStr} - missing pattern_type or start_date`, {
      pattern_type: schedule.pattern_type,
      start_date: schedule.start_date,
    });
    return false;
  }

  const startDate = getCanonicalDate(schedule.start_date);

  // Check date range
  if (dateStr < schedule.start_date) {
    if (debug) console.log(`[matchesPattern] Date ${dateStr} before start_date ${schedule.start_date}`);
    return false;
  }
  if (schedule.end_date && dateStr > schedule.end_date) {
    if (debug) console.log(`[matchesPattern] Date ${dateStr} after end_date ${schedule.end_date}`);
    return false;
  }

  // Pattern matching
  let result = false;
  switch (schedule.pattern_type) {
    case "weekly":
      result = schedule.days_of_week
        ? matchesWeekly(date, schedule.days_of_week)
        : false;
      if (debug) console.log(`[matchesPattern] Date ${dateStr} weekly match:`, result, {
        dayOfWeek: date.getUTCDay(),
        days_of_week: schedule.days_of_week,
      });
      return result;

    case "biweekly":
      result = schedule.days_of_week
        ? matchesBiweekly(date, startDate, schedule.days_of_week)
        : false;
      if (debug) console.log(`[matchesPattern] Date ${dateStr} biweekly match:`, result);
      return result;

    case "monthly_date":
      result = schedule.day_of_month
        ? matchesMonthlyDate(date, schedule.day_of_month)
        : false;
      if (debug) console.log(`[matchesPattern] Date ${dateStr} monthly_date match:`, result, {
        dayOfMonth: date.getUTCDate(),
        targetDay: schedule.day_of_month,
      });
      return result;

    case "monthly_day":
      result = schedule.days_of_week && schedule.monthly_week_number
        ? matchesMonthlyDay(
            date,
            schedule.days_of_week,
            schedule.monthly_week_number
          )
        : false;
      if (debug) console.log(`[matchesPattern] Date ${dateStr} monthly_day match:`, result);
      return result;

    case "custom":
      result = schedule.days_of_week
        ? matchesCustom(date, schedule.days_of_week)
        : false;
      if (debug) console.log(`[matchesPattern] Date ${dateStr} custom match:`, result);
      return result;

    default:
      if (debug) console.log(`[matchesPattern] Date ${dateStr} - unknown pattern_type:`, schedule.pattern_type);
      return false;
  }
}
