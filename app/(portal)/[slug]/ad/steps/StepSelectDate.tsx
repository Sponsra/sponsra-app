"use client";

import {
  useState,
  useEffect,
  ReactNode,
  createContext,
  useContext,
} from "react";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { createBooking, getBookedDates } from "@/app/actions/bookings";
import { InventoryTierPublic } from "@/app/types/inventory";
import styles from "./StepSelectDate.module.css";

type BookedDateItem = { target_date?: string | null } | string;

const toDateFromBookedItem = (item: BookedDateItem) => {
  const dateStr = typeof item === "string" ? item : item.target_date || "";
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
};

interface StepSelectDateContextType {
  selectedTier: InventoryTierPublic | null;
  setSelectedTier: (tier: InventoryTierPublic | null) => void;
  date: Date | null;
  setDate: (date: Date | null) => void;
  loading: boolean;
  disabledDates: Date[];
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

  // Fetch blocked dates whenever the user picks a tier
  useEffect(() => {
    if (selectedTier) {
      setLoading(true);
      getBookedDates(selectedTier.id)
        .then((data: BookedDateItem[]) => {
          const dateObjects = data.map(toDateFromBookedItem);
          setDisabledDates(dateObjects);
        })
        .finally(() => setLoading(false));
    }
  }, [selectedTier]);

  const handleSubmit = async () => {
    if (!date || !selectedTier) return;
    setLoading(true);

    const result = await createBooking(selectedTier.id, date, slug);

    if (result.success && result.bookingId) {
      onContinue(selectedTier, date, result.bookingId);
    } else {
      alert(
        result.message || "This date was just taken. Please choose another."
      );

      // Refresh blocked dates
      const dates = (await getBookedDates(selectedTier.id)) as BookedDateItem[];
      const dateObjects = dates.map(toDateFromBookedItem);
      setDisabledDates(dateObjects);
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
  const { selectedTier, date, setDate, disabledDates } = useStepSelectDate();

  return (
    <div className={styles.calendarContainer}>
      <Calendar
        value={date}
        onChange={(e) => setDate(e.value as Date)}
        inline
        minDate={new Date()}
        disabledDates={disabledDates}
        disabled={!selectedTier}
      />
    </div>
  );
}

// Default export is the provider component
export default StepSelectDateProvider;
