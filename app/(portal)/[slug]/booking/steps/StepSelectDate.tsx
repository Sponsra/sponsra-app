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
import { getAvailableDates, holdSlot } from "@/app/actions/inventory-slots";
import {
  Product,
  InventorySlot,
  SlotAvailability,
  ProductType,
  FREQUENCY_LABELS,
  PRODUCT_TYPE_LABELS,
  ASSET_KIND_LABELS
} from "@/app/types/product";
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
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  date: Date | null;
  setDate: (date: Date | null) => void;
  loading: boolean;
  disabledDates: Date[];
  availabilityMap: Map<string, SlotAvailability>;
  dateRange: { start: string; end: string };
  handleSubmit: () => Promise<void>;
  hasFetched: boolean;
}

const StepSelectDateContext = createContext<StepSelectDateContextType | null>(
  null
);

interface StepSelectDateProviderProps {
  products: Product[];
  slug: string;
  onContinue: (
    product: Product,
    date: Date,
    slotId: string
  ) => void;
  children: ReactNode;
}

function StepSelectDateProvider({
  products,
  slug,
  onContinue,
  children,
}: StepSelectDateProviderProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(
    null
  );
  const [date, setDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [disabledDates, setDisabledDates] = useState<Date[]>([]);
  const [availabilityMap, setAvailabilityMap] = useState<
    Map<string, SlotAvailability>
  >(new Map());

  // Session ID for holding slots (generated once per session)
  const [sessionId] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('booking_session_id') || crypto.randomUUID();
    }
    return ''; // Server-side fallback (though this runs client-side usually)
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('booking_session_id', sessionId);
    }
  }, [sessionId]);

  // Calculate date range (1-3 months from today)
  const dateRange = useMemo(() => {
    const start = new Date();
    // start.setDate(1); // Start of current month - actually start from today
    const end = new Date();
    end.setMonth(end.getMonth() + 4); // 4 months ahead to be safe
    end.setDate(0); // Last day of that month
    return {
      start: formatDateString(start),
      end: formatDateString(end),
    };
  }, []);

  // Fetch availability dates whenever the user picks a product
  useEffect(() => {
    if (!selectedProduct) {
      setAvailabilityMap(new Map());
      setDisabledDates([]);
      setHasFetched(false);
      return;
    }

    const fetchAvailability = async () => {
      try {
        const availability = await getAvailableDates(
          selectedProduct.id,
          dateRange.start,
          dateRange.end
        );

        // Build availability map (map date string to SlotAvailability object)
        const map = new Map<string, SlotAvailability>();
        availability.forEach((item) => {
          map.set(item.date, item);
        });

        // Build disabled dates array (sold out dates)
        const disabled: Date[] = [];
        availability.forEach((item) => {
          // Disable if 0 available slots
          if (item.available_slots === 0) {
            disabled.push(toDateFromString(item.date));
          }
        });

        setAvailabilityMap(map);
        setDisabledDates(disabled);
        setHasFetched(true);

        // If the currently selected date is no longer available/valid, clear it
        if (date) {
          const dateStr = formatDateString(date);
          const availabilityItem = map.get(dateStr);
          // If date not in map (not a valid slot date) or no available slots
          if (!availabilityItem || availabilityItem.available_slots === 0) {
            setDate(null);
          }
        }
      } catch (error) {
        console.error("Error fetching availability:", error);
        setAvailabilityMap(new Map());
        setDisabledDates([]);
        setHasFetched(true);
      }
    };

    // Initial fetch
    setLoading(true);
    fetchAvailability().finally(() => setLoading(false));

    // Poll every 10 seconds to catch real-time bookings
    const pollInterval = setInterval(fetchAvailability, 10000);

    return () => clearInterval(pollInterval);
  }, [selectedProduct, dateRange, date]);

  const handleSubmit = async () => {
    if (!date || !selectedProduct) return;

    // Validate date has available slots
    const dateStr = formatDateString(date);
    const availabilityItem = availabilityMap.get(dateStr);

    if (!availabilityItem || availabilityItem.available_slots === 0) {
      alert("This date is no longer available.");
      setDate(null);
      return;
    }

    // Find the first available slot
    // We prioritize 'available' status. If held by us (same session), we can also use it.
    const availableSlot = availabilityItem.slots.find(s => s.status === 'available');

    if (!availableSlot) {
      alert("No available slots found for this date.");
      return;
    }

    setLoading(true);

    // Hold the slot
    const result = await holdSlot(availableSlot.id, sessionId);

    if (result.success) {
      onContinue(selectedProduct, date, availableSlot.id);
    } else {
      // Show error - the polling mechanism will refresh availability automatically
      alert(
        result.error || "Unable to hold this date. It may have just been taken."
      );
      setDate(null);
    }

    setLoading(false);
  };

  return (
    <StepSelectDateContext.Provider
      value={{
        selectedProduct,
        setSelectedProduct,
        date,
        setDate,
        loading,
        disabledDates,
        availabilityMap,
        dateRange,
        handleSubmit,
        hasFetched,
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
  products: Product[];
  newsletterName: string;
  stepIndicator?: ReactNode;
}

export function StepSelectDateLeft({
  products,
  newsletterName,
  stepIndicator,
}: StepSelectDateLeftProps) {
  const { selectedProduct, setSelectedProduct, date, loading, handleSubmit } =
    useStepSelectDate();

  return (
    <div className={styles.contentArea || ""}>
      <div className={styles.formContent || ""}>
        <h2 className={styles.cardTitle || ""}>Advertise with {newsletterName}</h2>
        <div className={styles.fieldGroup || ""}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionSubtitle}>
              Select the ad format that fits your campaign goals.
            </p>
          </div>
          <div className={styles.tierCards || ""}>
            {products.map((product) => {
              const isSelected = selectedProduct?.id === product.id;
              const cardClassName = [
                styles.tierCard,
                isSelected
                  ? styles.tierCardSelected
                  : styles.tierCardUnselected,
              ]
                .filter(Boolean)
                .join(" ");

              const assetReqs = product.asset_requirements || [];
              const hasImage = assetReqs.some(r => r.kind === 'image');
              const headlineReq = assetReqs.find(r => r.kind === 'headline');
              const bodyReq = assetReqs.find(r => r.kind === 'body');

              return (
                <button
                  key={product.id}
                  type="button"
                  className={cardClassName}
                  onClick={() => setSelectedProduct(product)}
                >
                  <div className={styles.tierCardHeader || ""}>
                    <div className={styles.tierCardName || ""}>{product.name}</div>
                    {isSelected && (
                      <i
                        className={`pi pi-check ${styles.tierCardCheck || ""}`}
                      />
                    )}
                  </div>
                  <div className={styles.tierCardPrice || ""}>
                    ${(product.price / 100).toFixed(2)}
                  </div>
                  {isSelected && product.description && (
                    <div className={styles.tierCardDescription || ""}>
                      {product.description}
                    </div>
                  )}
                  {isSelected && (
                    <div className={styles.tierCardRequirements || ""}>
                      <div className={styles.requirementsTitle || ""}>
                        {PRODUCT_TYPE_LABELS[product.product_type]} Format
                      </div>
                      <div className={styles.requirementsList || ""}>
                        <div>
                          • {FREQUENCY_LABELS[product.frequency]}
                        </div>
                        {headlineReq && (
                          <div>
                            • Headline: {headlineReq.constraints.maxChars} chars
                          </div>
                        )}
                        {bodyReq && (
                          <div>
                            • Body: {bodyReq.constraints.maxChars} chars
                          </div>
                        )}
                        <div>
                          {hasImage
                            ? "• Image required"
                            : "• Text only (no image)"}
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
          disabled={!date || !selectedProduct}
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
    selectedProduct,
    date,
    setDate,
    disabledDates,
    availabilityMap,
    dateRange,
    hasFetched,
  } = useStepSelectDate();

  // Calculate max date from date range
  const maxDate = useMemo(() => {
    return toDateFromString(dateRange.end);
  }, [dateRange.end]);

  // Check if there are any available dates (excluding disabled ones)
  const hasAvailability = useMemo(() => {
    if (availabilityMap.size === 0) return false;

    // Check if any date has available_slots > 0
    for (const item of availabilityMap.values()) {
      if (item.available_slots > 0) return true;
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

    // Check if this date is a VALID slot date (exists in map)
    const availabilityItem = availabilityMap.get(dateStr);

    if (availabilityItem) {
      if (availabilityItem.available_slots > 0) {
        // Check if sparse availability (e.g. 1 left)
        const isLow = availabilityItem.available_slots === 1; // Example logic
        return <span className={`${styles.availableDate} ${isLow ? styles.lowStock : ''}`}>{event.day}</span>;
      } else {
        return <span className={styles.bookedDate}>{event.day}</span>;
      }
    }

    // Default (not a slot date)
    return event.day;
  };

  if (!selectedProduct) {
    return (
      <div className={styles.calendarEmptyState}>
        <p>Please select a product to view availability.</p>
      </div>
    );
  }

  // If we have fetched availability (map has size > 0) and found no available dates
  // OR if we have fetched and map is empty (no slots generated)
  const isSoldOut = hasFetched && !hasAvailability;

  return (
    <div className={styles.calendarWrapper}>
      <div className={styles.rightHeader}>
        <h3 className={styles.sectionTitle}>2. Select a Date</h3>
        <p className={styles.sectionSubtitle}>
          Available slots for <strong>{selectedProduct.name}</strong>:
        </p>
      </div>

      <div className={styles.calendarContainer}>
        {isSoldOut ? (
          <div className={styles.soldOutState}>
            <h4 className={styles.soldOutTitle}>Sold Out</h4>
            <p className={styles.soldOutText}>There are no available slots for this product right now. Please check back later.</p>
          </div>
        ) : (
          <Calendar
            value={date}
            onChange={(e) => setDate(e.value as Date)}
            inline
            minDate={new Date()}
            maxDate={maxDate}
            disabledDates={disabledDates}
            disabled={!selectedProduct}
            dateTemplate={dateTemplate}
          />
        )}
      </div>
    </div>
  );
}

// Default export is the provider component
export default StepSelectDateProvider;
