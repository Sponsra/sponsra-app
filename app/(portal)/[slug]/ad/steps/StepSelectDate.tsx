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
  FORMAT_DEFAULTS,
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
        <h2 className={styles.cardTitle || ""}>Advertise with {newsletterName}</h2>
        {/* <p className={styles.subtitle || ""}>
          Reach 15,000 engaged readers in the Tech/Software industry.
        </p> */}
        <div className={styles.fieldGroup || ""}>
          <div className={styles.sectionHeader}>
            {/* <h3 className={styles.sectionTitle}>1. Choose a Placement</h3> */}
            <p className={styles.sectionSubtitle}>
              Select the ad format that fits your campaign goals.
            </p>
          </div>
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
                        {FORMAT_DEFAULTS[tier.format]?.label || "Hero"} Format
                      </div>
                      <div className={styles.requirementsList || ""}>
                        <div>
                          • Headline: {tier.specs_headline_limit} chars
                        </div>
                        {tier.specs_body_limit > 0 && (
                          <div>
                            • Body: {tier.specs_body_limit} chars
                          </div>
                        )}
                        <div>
                          {tier.specs_image_ratio === "no_image"
                            ? "• Text only (no image)"
                            : `• Image required`}
                        </div>
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

  // Check if there are any available dates (excluding disabled ones)
  const hasAvailability = useMemo(() => {
    // If loading, assume availability (or show loading state)
    // If map is empty, we might not have fetched yet or there are no slots.
    // relying on availabilityMap to contain all dates in range with status.
    // If map has entries, check if any are 'available'.
    if (availabilityMap.size === 0) return false;

    // We also need to check if the dates are in validity range?
    // The map contains statuses for the fetched range.
    for (const status of availabilityMap.values()) {
      if (status.status === "available") return true;
    }
    return false;
  }, [availabilityMap]);

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

  if (!selectedTier) {
    return (
      <div className={styles.calendarEmptyState}>
        <p>Please select a placement to view availability.</p>
      </div>
    );
  }

  // If we have fetched availability (map has size > 0) and found no available dates
  // AND we are not selected on a valid date (in case map update lagged)
  // Actually, simpler: if availabilityMap is populated and hasAvailability is false.
  const isSoldOut = availabilityMap.size > 0 && !hasAvailability;

  return (
    <div className={styles.calendarWrapper}>
      <div className={styles.rightHeader}>
        <h3 className={styles.sectionTitle}>2. Select a Date</h3>
        <p className={styles.sectionSubtitle}>
          Available slots for <strong>{selectedTier.name}</strong>:
        </p>
      </div>

      <div className={styles.calendarContainer}>
        {isSoldOut ? (
          <div className={styles.soldOutState}>
            <h4 className={styles.soldOutTitle}>Sold Out</h4>
            <p className={styles.soldOutText}>There are no available slots for this placement right now. Please check back later.</p>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}

// Default export is the provider component
export default StepSelectDateProvider;
