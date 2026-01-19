import { PatternType, ScheduleType, PublicationSchedule, AvailabilitySchedule } from "@/app/types/inventory";

/**
 * Props for SchedulePatternSelector component
 */
export interface SchedulePatternSelectorProps {
  patternType: PatternType | null;
  onPatternTypeChange: (type: PatternType | null) => void;
  daysOfWeek: number[];
  onDaysOfWeekChange: (days: number[]) => void;
  dayOfMonth: number | null;
  onDayOfMonthChange: (day: number | null) => void;
  monthlyWeekNumber: number | null;
  onMonthlyWeekNumberChange: (week: number | null) => void;
}

/**
 * Props for SchedulePreview component
 */
export interface SchedulePreviewProps {
  schedule: PublicationSchedule | AvailabilitySchedule | null;
  startDate?: Date;
  count?: number;
  isLoading?: boolean;
}

