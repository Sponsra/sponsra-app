"use client";

import {
  useState,
  useEffect,
  ReactNode,
  createContext,
  useContext,
  useMemo,
} from "react";
import { Calendar } from "primereact/calendar";
import type { CalendarDateTemplateEvent } from "primereact/calendar";
import { Button } from "primereact/button";
import { createBooking, getAvailableDates } from "@/app/actions/bookings";
import {
  InventoryTierPublic,
  DateAvailabilityStatus,
} from "@/app/types/inventory";
import styles from "./StepSelectDate.module.css";

// Helper to convert date string to Date object
const toDateFromString = (dateStr: string): Date => {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
};

// Helper to format date as YYYY-MM-DD
const formatDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

interface StepSelectDateContextType {
  selectedTier: InventoryTierPublic | null;
  setSelectedTier: (tier: InventoryTierPublic | null) => void;
  date: Date | null;
  setDate: (date: Date | null) => void;
  loading: boolean;
  disabledDates: Date[];
  availabilityMap: Map<string, DateAvailabilityStatus>;
  dateRange: { start: string; end: string };
  handleSubmit: () => Promise<void>;
}

const StepSelectDateContext = createContext<StepSelectDateContextType | null>(
  null
);

interface StepSelectDateProviderProps {
  tiers: InventoryTierPublic[];
  slug: string;
  onContinue: (
    tier: InventoryTierPublic,
    date: Date,
    bookingId: string
  ) => void;
  children: ReactNode;
}

function StepSelectDateProvider({
  tiers,
  slug,
  onContinue,
  children,
}: StepSelectDateProviderProps) {
  const [selectedTier, setSelectedTier] = useState<InventoryTierPublic | null>(
    null
  );
  const [date, setDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [disabledDates, setDisabledDates] = useState<Date[]>([]);
  const [availabilityMap, setAvailabilityMap] = useState<
    Map<string, DateAvailabilityStatus>
  >(new Map());

  // Calculate date range (1-3 months from today)
  const dateRange = useMemo(() => {
    const start = new Date();
    start.setDate(1); // Start of current month
    const end = new Date();
    end.setMonth(end.getMonth() + 3); // 3 months ahead
    end.setDate(0); // Last day of that month
    return {
      start: formatDateString(start),
      end: formatDateString(end),
    };
  }, []);

  // Fetch availability dates whenever the user picks a tier
  useEffect(() => {
    if (!selectedTier) {
      setAvailabilityMap(new Map());
      setDisabledDates([]);
      return;
    }

    const fetchAvailability = async () => {
      try {
        const availability = await getAvailableDates(
          selectedTier.id,
          dateRange.start,
          dateRange.end
        );

        // Build availability map
        const map = new Map<string, DateAvailabilityStatus>();
        availability.forEach((item) => {
          map.set(item.date, item);
        });

        // Build disabled dates array (booked + unavailable)
        const disabled: Date[] = [];
        availability.forEach((item) => {
          if (item.status !== "available") {
            disabled.push(toDateFromString(item.date));
          }
        });

        setAvailabilityMap(map);
        setDisabledDates(disabled);

        // If the currently selected date is no longer available, clear it
        if (date) {
          const dateStr = formatDateString(date);
          const status = map.get(dateStr);
          if (!status || status.status !== "available") {
            setDate(null);
          }
        }
      } catch (error) {
        console.error("Error fetching availability:", error);
        setAvailabilityMap(new Map());
        setDisabledDates([]);
      }
    };

    // Initial fetch
    setLoading(true);
    fetchAvailability().finally(() => setLoading(false));

    // Poll every 10 seconds to catch real-time bookings
    const pollInterval = setInterval(fetchAvailability, 10000);

    return () => clearInterval(pollInterval);
  }, [selectedTier, dateRange, date]);

  const handleSubmit = async () => {
    if (!date || !selectedTier) return;

    // Validate date is within calculated range (safety check)
    const dateStr = formatDateString(date);
    if (dateStr < dateRange.start || dateStr > dateRange.end) {
      alert(
        "This date is outside the available booking range. Please select a date within the next 3 months."
      );
      setDate(null);
      return;
    }

    setLoading(true);

    const result = await createBooking(selectedTier.id, date, slug);

    if (result.success && result.bookingId) {
      onContinue(selectedTier, date, result.bookingId);
    } else {
      // Show error - the polling mechanism will refresh availability automatically
      alert(
        result.message || "Unable to book this date. Please select another."
      );
      setDate(null);
    }

    setLoading(false);
  };

  return (
    <StepSelectDateContext.Provider
      value={{
        selectedTier,
        setSelectedTier,
        date,
        setDate,
        loading,
        disabledDates,
        availabilityMap,
        dateRange,
        handleSubmit,
      }}
    >
      {children}
    </StepSelectDateContext.Provider>
  );
}

function useStepSelectDate() {
  const context = useContext(StepSelectDateContext);
  if (!context) {
    throw new Error(
      "useStepSelectDate must be used within StepSelectDateProvider"
    );
  }
  return context;
}

interface StepSelectDateLeftProps {
  tiers: InventoryTierPublic[];
  newsletterName: string;
  stepIndicator?: ReactNode;
}

export function StepSelectDateLeft({
  tiers,
  newsletterName,
  stepIndicator,
}: StepSelectDateLeftProps) {
  const { selectedTier, setSelectedTier, date, loading, handleSubmit } =
    useStepSelectDate();

  return (
    <div className={styles.contentArea || ""}>
      <div className={styles.formContent || ""}>
        <h2 className={styles.cardTitle || ""}>The Market</h2>
        <p className={styles.subtitle || ""}>Choose your placement and date</p>
        <div className={styles.fieldGroup || ""}>
          <label className={styles.label || ""}>Select Ad Type</label>
          <div className={styles.tierCards || ""}>
            {tiers.map((tier) => {
              const isSelected = selectedTier?.id === tier.id;
              const cardClassName = [
                styles.tierCard,
                isSelected
                  ? styles.tierCardSelected
                  : styles.tierCardUnselected,
              ]
                .filter(Boolean)
                .join(" ");
              return (
                <button
                  key={tier.id}
                  type="button"
                  className={cardClassName}
                  onClick={() => setSelectedTier(tier)}
                >
                  <div className={styles.tierCardHeader || ""}>
                    <div className={styles.tierCardName || ""}>{tier.name}</div>
                    {isSelected && (
                      <i
                        className={`pi pi-check ${styles.tierCardCheck || ""}`}
                      />
                    )}
                  </div>
                  <div className={styles.tierCardPrice || ""}>
                    ${(tier.price / 100).toFixed(2)}
                  </div>
                  {isSelected && tier.description && (
                    <div className={styles.tierCardDescription || ""}>
                      {tier.description}
                    </div>
                  )}
                  {isSelected && (
                    <div className={styles.tierCardRequirements || ""}>
                      <div className={styles.requirementsTitle || ""}>
                        Ad Requirements:
                      </div>
                      <div className={styles.requirementsList || ""}>
                        <div>
                          • Headline: {tier.specs_headline_limit} characters max
                        </div>
                        <div>
                          • Body: {tier.specs_body_limit} characters max
                        </div>
                        {tier.specs_image_ratio === "no_image" ? (
                          <div>• No image required</div>
                        ) : tier.specs_image_ratio === "1:1" ? (
                          <div>• Image: Square (1:1) aspect ratio required</div>
                        ) : tier.specs_image_ratio === "1.91:1" ? (
                          <div>
                            • Image: Landscape (1.91:1) aspect ratio required
                          </div>
                        ) : (
                          <div>• Image: Any aspect ratio</div>
                        )}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className={styles.buttonContainer || ""}>
        <Button
          label={loading ? "Checking Availability..." : "Continue"}
          icon="pi pi-arrow-right"
          iconPos="right"
          onClick={handleSubmit}
          loading={loading}
          disabled={!date || !selectedTier}
          className={`w-full ${styles.submitButton}`}
        />

        {/* Step Indicator */}
        {stepIndicator && (
          <div className={styles.stepIndicatorContainer}>{stepIndicator}</div>
        )}
      </div>
    </div>
  );
}

export function StepSelectDateRight() {
  const {
    selectedTier,
    date,
    setDate,
    disabledDates,
    availabilityMap,
    dateRange,
  } = useStepSelectDate();

  // Calculate max date from date range
  const maxDate = useMemo(() => {
    return toDateFromString(dateRange.end);
  }, [dateRange.end]);

  // Custom date template to style available and booked dates
  const dateTemplate = (event: CalendarDateTemplateEvent) => {
    // Build date string from event properties
    const year = event.year;
    const month = String(event.month + 1).padStart(2, "0");
    const day = String(event.day).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;
    const status = availabilityMap.get(dateStr);

    if (status && status.status === "available") {
      return <span className={styles.availableDate}>{event.day}</span>;
    }

    if (status && status.status === "booked") {
      return <span className={styles.bookedDate}>{event.day}</span>;
    }

    return event.day;
  };

  return (
    <div className={styles.calendarContainer}>
      <Calendar
        value={date}
        onChange={(e) => setDate(e.value as Date)}
        inline
        minDate={new Date()}
        maxDate={maxDate}
        disabledDates={disabledDates}
        disabled={!selectedTier}
        dateTemplate={dateTemplate}
      />
    </div>
  );
}

// Default export is the provider component
export default StepSelectDateProvider;
