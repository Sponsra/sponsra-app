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
import { Tooltip } from "primereact/tooltip";
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
    if (selectedTier) {
      setLoading(true);
      getAvailableDates(selectedTier.id, dateRange.start, dateRange.end)
        .then((availability: DateAvailabilityStatus[]) => {
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

          // Note: Dates outside the range will be handled by maxDate and dateTemplate
          // They will be styled as unavailable and prevented from selection

          setAvailabilityMap(map);
          setDisabledDates(disabled);
        })
        .catch((error) => {
          setAvailabilityMap(new Map());
          setDisabledDates([]);
        })
        .finally(() => setLoading(false));
    } else {
      setAvailabilityMap(new Map());
      setDisabledDates([]);
    }
  }, [selectedTier, dateRange]);

  const handleSubmit = async () => {
    if (!date || !selectedTier) return;

    // Validate date is within calculated range
    const dateStr = formatDateString(date);
    if (dateStr < dateRange.start || dateStr > dateRange.end) {
      alert(
        "This date is outside the available booking range. Please select a date within the next 3 months."
      );
      setDate(null);
      return;
    }

    // Validate date is actually available
    const status = availabilityMap.get(dateStr);
    if (!status || status.status !== "available") {
      alert("This date is not available. Please select an available date.");
      setDate(null);
      return;
    }

    setLoading(true);

    const result = await createBooking(selectedTier.id, date, slug);

    if (result.success && result.bookingId) {
      onContinue(selectedTier, date, result.bookingId);
    } else {
      alert(
        result.message || "This date was just taken. Please choose another."
      );

      // Refresh availability
      const availability = await getAvailableDates(
        selectedTier.id,
        dateRange.start,
        dateRange.end
      );
      const map = new Map<string, DateAvailabilityStatus>();
      const disabled: Date[] = [];
      availability.forEach((item) => {
        map.set(item.date, item);
        if (item.status !== "available") {
          disabled.push(toDateFromString(item.date));
        }
      });
      setAvailabilityMap(map);
      setDisabledDates(disabled);
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

  // Custom date template to style dates based on availability status
  const dateTemplate = (event: CalendarDateTemplateEvent) => {
    // Build date string from event properties
    const year = event.year;
    const month = String(event.month + 1).padStart(2, "0");
    const day = String(event.day).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;
    const status = availabilityMap.get(dateStr);

    // Check if date is outside the calculated range
    const isOutsideRange = dateStr < dateRange.start || dateStr > dateRange.end;

    // If date is outside range or not in map, mark as unavailable
    if (!status || isOutsideRange) {
      return (
        <span
          className={styles.unavailableDate}
          title={isOutsideRange ? "Date range not calculated" : "Unavailable"}
          data-pr-tooltip={
            isOutsideRange ? "Date range not calculated" : "Unavailable"
          }
          data-pr-position="top"
        >
          {event.day}
        </span>
      );
    }

    let className = "";
    let title = "";

    switch (status.status) {
      case "available":
        className = styles.availableDate;
        title = "Available";
        break;
      case "booked":
        className = styles.bookedDate;
        title = status.reason || "Sold Out";
        break;
      case "unavailable":
        className = styles.unavailableDate;
        title = status.reason || "Unavailable";
        break;
    }

    return (
      <span
        className={className}
        title={title}
        data-pr-tooltip={title}
        data-pr-position="top"
      >
        {event.day}
      </span>
    );
  };

  return (
    <div className={styles.calendarContainer}>
      <Tooltip target=".p-datepicker table td span" />
      <Calendar
        value={date}
        onChange={(e) => {
          const selectedDate = e.value as Date;
          const selectedDateStr = formatDateString(selectedDate);

          // Prevent selecting dates outside the calculated range
          if (
            selectedDateStr < dateRange.start ||
            selectedDateStr > dateRange.end
          ) {
            return;
          }

          // Also check if date is available
          const status = availabilityMap.get(selectedDateStr);
          if (status && status.status === "available") {
            setDate(selectedDate);
          }
        }}
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
