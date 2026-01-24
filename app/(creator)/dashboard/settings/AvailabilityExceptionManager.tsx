"use client";

import React, { useState, useEffect, useRef } from "react";
import { Calendar } from "primereact/calendar";
import { Toast } from "primereact/toast";
import { Message } from "primereact/message";
import {
    toggleAvailabilityException,
    getAvailabilityExceptions,
} from "@/app/actions/inventory";
import { AvailabilityException } from "@/app/types/inventory";
import sharedStyles from "./shared.module.css";

interface AvailabilityExceptionManagerProps {
    newsletterId: string;
}

export default function AvailabilityExceptionManager({
    newsletterId,
}: AvailabilityExceptionManagerProps) {
    const toast = useRef<Toast>(null);
    const [exceptions, setExceptions] = useState<AvailabilityException[]>([]);
    const [loading, setLoading] = useState(false);

    // Fetch exceptions on mount
    useEffect(() => {
        async function fetchExceptions() {
            if (!newsletterId) return;

            const data = await getAvailabilityExceptions(newsletterId);
            setExceptions(data);
        }
        fetchExceptions();
    }, [newsletterId]);

    const handleDateSelect = async (e: any) => {
        // The calendar component returns a Date object or array of dates
        const selectedDate = e.value as Date;
        if (!selectedDate) return;

        // Convert to YYYY-MM-DD string (local time)
        // We use SV's offset trick or just manual formatting to ensure we get the clicked date
        const offset = selectedDate.getTimezoneOffset();
        const dateLocal = new Date(selectedDate.getTime() - offset * 60 * 1000);
        const dateStr = dateLocal.toISOString().split("T")[0];

        // Optimistically update
        const exists = exceptions.find((ex) => ex.date === dateStr);
        let newExceptions;

        if (exists) {
            newExceptions = exceptions.filter((ex) => ex.date !== dateStr);
        } else {
            newExceptions = [
                ...exceptions,
                { id: "optimistic", newsletter_id: newsletterId, date: dateStr },
            ];
        }
        setExceptions(newExceptions);

        // Call server action
        try {
            const result = await toggleAvailabilityException(newsletterId, dateStr);
            if (!result.success) {
                // Revert on failure
                setExceptions(exceptions); // reset to previous state (would need to keep prev state if consistent)
                // Actually simpler to just re-fetch or show error
                toast.current?.show({
                    severity: "error",
                    summary: "Error",
                    detail: result.error || "Failed to update availability",
                });
            } else {
                // success - maybe re-fetch to get real IDs, but not strictly necessary for viewing
            }
        } catch (error) {
            console.error(error);
            setExceptions(exceptions);
            toast.current?.show({
                severity: "error",
                summary: "Error",
                detail: "Unexpected error",
            });
        }
    };

    // Template for date cells
    const dateTemplate = (dateMeta: any) => {
        // dateMeta: { day, month, year, ... }
        // Construct YYYY-MM-DD
        // Note: month is 0-indexed in JS Date but might be 0 or 1 indexed in PrimeReact meta?
        // Usually dateMeta.month is 0-indexed.
        const year = dateMeta.year;
        const month = String(dateMeta.month + 1).padStart(2, "0");
        const day = String(dateMeta.day).padStart(2, "0");
        const dateStr = `${year}-${month}-${day}`;

        const isException = exceptions.some((ex) => ex.date === dateStr);

        if (isException) {
            return (
                <div
                    style={{
                        backgroundColor: "#ffe0e0",
                        color: "#d32f2f",
                        borderRadius: "50%",
                        width: "2rem",
                        height: "2rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        textDecoration: "line-through",
                        fontWeight: "bold",
                        margin: "0 auto",
                    }}
                >
                    {dateMeta.day}
                </div>
            );
        }

        return dateMeta.day;
    };

    return (
        <div className={sharedStyles.section}>
            <Toast ref={toast} />
            <div className={sharedStyles.sectionHeader}>
                <h2>Availability Exceptions</h2>
                <p>
                    Click on any date to mark it as <strong>closed</strong> (red). Available dates are white.
                </p>
            </div>

            <div className="surface-ground p-4 border-round-lg border-1 border-gray-200">
                <Message
                    severity="info"
                    text="Blackout dates prevent advertisers from booking any ad slot on that day."
                    className="w-full mb-3"
                />
                <div className="flex justify-content-center">
                    <Calendar
                        value={null}
                        onChange={handleDateSelect}
                        inline
                        dateTemplate={dateTemplate}
                        className="border-none w-full max-w-30rem"
                    />
                </div>
            </div>
        </div>
    );
}
