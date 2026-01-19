import { PatternType } from "@/app/types/inventory";

export interface PatternOption {
  label: string;
  value: PatternType | "custom";
}

export interface WeekOption {
  label: string;
  value: number;
}

/**
 * Pattern type options for schedule configuration
 */
export const patternOptions: PatternOption[] = [
  { label: "Weekly", value: "weekly" },
  { label: "Bi-weekly", value: "biweekly" },
  { label: "Monthly (Day of Month)", value: "monthly_date" },
  { label: "Monthly (Day of Week)", value: "monthly_day" },
  { label: "Custom", value: "custom" },
];

/**
 * Week number options for monthly day patterns
 */
export const weekOptions: WeekOption[] = [
  { label: "1st", value: 1 },
  { label: "2nd", value: 2 },
  { label: "3rd", value: 3 },
  { label: "4th", value: 4 },
  { label: "5th", value: 5 },
];

/**
 * All days of week (0 = Sunday, 6 = Saturday)
 */
export const allDaysOfWeek = [0, 1, 2, 3, 4, 5, 6];
