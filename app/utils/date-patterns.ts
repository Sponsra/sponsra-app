// app/utils/date-patterns.ts
// UTC-based date logic to prevent timezone shifts

/**
 * Force UTC interpretation to prevent off-by-one errors
 * Appends 'T00:00:00Z' to force UTC midnight
 */
export function getCanonicalDate(dateStr: string): Date {
  // If the date string already has a time component, don't append
  if (dateStr.includes("T")) return new Date(dateStr);
  return new Date(`${dateStr}T00:00:00Z`);
}

/**
 * Iterate through dates in a range (inclusive), calling callback for each date
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
