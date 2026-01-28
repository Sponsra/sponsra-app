// supabase/functions/generate-slots/index.ts
// Edge Function to generate inventory slots for a product

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

interface Product {
    id: string;
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    active_days: number[]; // 0=Sunday, 6=Saturday
    start_date: string; // YYYY-MM-DD
    placements_per_issue: number;
}

interface SlotInsert {
    product_id: string;
    slot_date: string;
    slot_index: number;
    status: 'available';
}

/**
 * Check if a date matches the product's frequency configuration
 */
function matchesFrequency(
    date: Date,
    frequency: string,
    startDate: Date,
    activeDays: number[]
): boolean {
    const dayOfWeek = date.getDay(); // 0=Sunday, 6=Saturday

    // Check if this day of week is active
    if (!activeDays.includes(dayOfWeek)) {
        return false;
    }

    // Date must be on or after start date
    if (date < startDate) {
        return false;
    }

    switch (frequency) {
        case 'daily':
            // Every day in active_days matches
            return true;

        case 'weekly':
            // Once per week - use the first active day
            return true;

        case 'monthly':
            // First occurrence of active_day in each month
            // Check if this is the first occurrence of this day in the month
            const firstOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
            let firstOccurrence = new Date(firstOfMonth);

            // Find the first occurrence of this day of week
            while (firstOccurrence.getDay() !== dayOfWeek) {
                firstOccurrence.setDate(firstOccurrence.getDate() + 1);
            }

            return date.getDate() === firstOccurrence.getDate();

        case 'yearly':
            // Once per year - use the start_date's month and first active day
            const startMonth = startDate.getMonth();
            if (date.getMonth() !== startMonth) {
                return false;
            }
            // Use same logic as monthly for first occurrence
            const yearFirstOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
            let yearFirstOccurrence = new Date(yearFirstOfMonth);
            while (yearFirstOccurrence.getDay() !== dayOfWeek) {
                yearFirstOccurrence.setDate(yearFirstOccurrence.getDate() + 1);
            }
            return date.getDate() === yearFirstOccurrence.getDate();

        default:
            return false;
    }
}

/**
 * Generate all slot dates for a product over the specified period
 */
function generateSlotDates(
    product: Product,
    months: number
): string[] {
    const dates: string[] = [];
    const startDate = new Date(product.start_date);
    const today = new Date();

    // Start from today or product start date, whichever is later
    const effectiveStart = startDate > today ? startDate : today;

    // End date is months from now
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + months);

    // Iterate through each day
    const current = new Date(effectiveStart);
    current.setHours(0, 0, 0, 0);

    while (current <= endDate) {
        if (matchesFrequency(current, product.frequency, startDate, product.active_days)) {
            const dateStr = current.toISOString().split('T')[0];
            dates.push(dateStr);
        }
        current.setDate(current.getDate() + 1);
    }

    return dates;
}

Deno.serve(async (req: Request) => {
    try {
        // Get request body
        const { productId, months = 12 } = await req.json();
        console.log(`[generate-slots] Invoked for product ${productId}, months=${months}`);

        if (!productId) {
            return new Response(
                JSON.stringify({ error: 'productId is required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Create Supabase client with service role for admin access
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

        console.log(`[generate-slots] Connecting to Supabase at ${supabaseUrl}`);

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Fetch the product
        console.log('[generate-slots] Fetching product details...');
        const { data: product, error: productError } = await supabase
            .from('products')
            .select('id, frequency, active_days, start_date, placements_per_issue')
            .eq('id', productId)
            .single();

        if (productError || !product) {
            return new Response(
                JSON.stringify({ error: 'Product not found', details: productError }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Generate slot dates
        const slotDates = generateSlotDates(product as Product, months);

        // Get existing slots to avoid duplicates
        const { data: existingSlots } = await supabase
            .from('inventory_slots')
            .select('slot_date, slot_index')
            .eq('product_id', productId);

        const existingSet = new Set(
            (existingSlots || []).map(s => `${s.slot_date}-${s.slot_index}`)
        );

        // Create slot insert data
        const slotsToInsert: SlotInsert[] = [];

        for (const date of slotDates) {
            for (let i = 1; i <= product.placements_per_issue; i++) {
                const key = `${date}-${i}`;
                if (!existingSet.has(key)) {
                    slotsToInsert.push({
                        product_id: productId,
                        slot_date: date,
                        slot_index: i,
                        status: 'available',
                    });
                }
            }
        }

        // Insert slots in batches of 1000
        const batchSize = 1000;
        let insertedCount = 0;

        for (let i = 0; i < slotsToInsert.length; i += batchSize) {
            const batch = slotsToInsert.slice(i, i + batchSize);
            const { error: insertError } = await supabase
                .from('inventory_slots')
                .insert(batch);

            if (insertError) {
                console.error('Error inserting slots batch:', insertError);
                return new Response(
                    JSON.stringify({
                        error: 'Failed to insert slots',
                        details: insertError,
                        insertedSoFar: insertedCount
                    }),
                    { status: 500, headers: { 'Content-Type': 'application/json' } }
                );
            }

            insertedCount += batch.length;
        }

        console.log(`Generated ${insertedCount} slots for product ${productId}`);

        return new Response(
            JSON.stringify({
                success: true,
                productId,
                count: insertedCount,
                datesGenerated: slotDates.length,
                placementsPerIssue: product.placements_per_issue,
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('Error in generate-slots function:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error', details: String(error) }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
});
