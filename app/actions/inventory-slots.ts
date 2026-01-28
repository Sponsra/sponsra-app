'use server';

import { createClient } from '@/utils/supabase/server';
import { InventorySlot, SlotAvailability } from '@/app/types/product';

// ============================================
// INVENTORY SLOT GENERATION
// ============================================

/**
 * Generate inventory slots for a product by calling the Edge Function
 * @param productId - The product to generate slots for
 * @param months - Number of months ahead to generate (default: 12)
 */
/**
 * Generate inventory slots for a product by calling the Edge Function
 * @param productId - The product to generate slots for
 * @param months - Number of months ahead to generate (default: 12)
 */
export async function generateSlotsForProduct(productId: string, months: number = 12) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    try {
        console.log(`[generateSlotsForProduct] Invoking Edge Function for ${productId}`);
        const { data, error } = await supabase.functions.invoke('generate-slots', {
            body: { productId, months }
        });

        if (error) {
            console.error('Error calling generate-slots function:', error);
            return { success: false, error: error.message };
        }

        console.log(`[generateSlotsForProduct] Success:`, data);
        return { success: true, slotsGenerated: data?.count || 0 };
    } catch (error) {
        console.error('Error generating slots:', error);
        return { success: false, error: 'Failed to generate slots' };
    }
}

/**
 * Get all slots for a product with booking status
 */
export async function getSlotsForProduct(productId: string): Promise<InventorySlot[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('inventory_slots')
        .select('*')
        .eq('product_id', productId)
        .order('slot_date', { ascending: true })
        .order('slot_index', { ascending: true });

    if (error) {
        console.error('Error fetching slots:', error);
        return [];
    }

    return data as InventorySlot[];
}

/**
 * Get available dates for a product within a date range (for calendar UI)
 */
export async function getAvailableDates(
    productId: string,
    startDate: string,
    endDate: string
): Promise<SlotAvailability[]> {
    const supabase = await createClient();

    const { data: slots, error } = await supabase
        .from('inventory_slots')
        .select('*')
        .eq('product_id', productId)
        .gte('slot_date', startDate)
        .lte('slot_date', endDate)
        .order('slot_date', { ascending: true });

    if (error) {
        console.error('Error fetching available dates:', error);
        return [];
    }

    // Group slots by date
    const slotsByDate = (slots as InventorySlot[]).reduce((acc, slot) => {
        if (!acc[slot.slot_date]) {
            acc[slot.slot_date] = [];
        }
        acc[slot.slot_date].push(slot);
        return acc;
    }, {} as Record<string, InventorySlot[]>);

    // Calculate availability for each date
    const availability = Object.entries(slotsByDate).map(([date, dateSlots]) => {
        const totalSlots = dateSlots.length;
        const bookedSlots = dateSlots.filter(s => s.status === 'booked').length;
        const heldSlots = dateSlots.filter(s => s.status === 'held').length;
        const availableSlots = dateSlots.filter(s => s.status === 'available').length;

        return {
            date,
            total_slots: totalSlots,
            booked_slots: bookedSlots,
            held_slots: heldSlots,
            available_slots: availableSlots,
            slots: dateSlots,
        };
    });

    return availability;
}

// ============================================
// SLOT HOLD MANAGEMENT (15-MINUTE TTL)
// ============================================

/**
 * Hold a slot during checkout (15-minute TTL)
 */
export async function holdSlot(slotId: string, sessionId: string) {
    const supabase = await createClient();

    // Check if slot is available
    const { data: slot, error: fetchError } = await supabase
        .from('inventory_slots')
        .select('*')
        .eq('id', slotId)
        .single();

    if (fetchError || !slot) {
        return { success: false, error: 'Slot not found' };
    }

    if (slot.status !== 'available') {
        return { success: false, error: 'Slot not available' };
    }

    // Hold the slot
    const { error } = await supabase
        .from('inventory_slots')
        .update({
            status: 'held',
            held_at: new Date().toISOString(),
            held_by_session_id: sessionId,
        })
        .eq('id', slotId)
        .eq('status', 'available'); // Ensure it's still available (race condition protection)

    if (error) {
        console.error('Error holding slot:', error);
        return { success: false, error: 'Failed to hold slot' };
    }

    return { success: true };
}

/**
 * Release a held slot (cancel checkout)
 */
export async function releaseSlot(slotId: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('inventory_slots')
        .update({
            status: 'available',
            held_at: null,
            held_by_session_id: null,
        })
        .eq('id', slotId)
        .eq('status', 'held');

    if (error) {
        console.error('Error releasing slot:', error);
        return { success: false, error: 'Failed to release slot' };
    }

    return { success: true };
}

/**
 * Release all holds for a session (e.g., when user leaves checkout)
 */
export async function releaseSessionHolds(sessionId: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('inventory_slots')
        .update({
            status: 'available',
            held_at: null,
            held_by_session_id: null,
        })
        .eq('held_by_session_id', sessionId)
        .eq('status', 'held');

    if (error) {
        console.error('Error releasing session holds:', error);
        return { success: false, error: 'Failed to release holds' };
    }

    return { success: true };
}

/**
 * Get slots held by a session
 */
export async function getSessionHolds(sessionId: string): Promise<InventorySlot[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('inventory_slots')
        .select('*')
        .eq('held_by_session_id', sessionId)
        .eq('status', 'held');

    if (error) {
        console.error('Error fetching session holds:', error);
        return [];
    }

    return data as InventorySlot[];
}

/**
 * Confirm a slot booking (mark as booked after payment)
 */
export async function confirmSlotBooking(slotId: string, bookingId: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('inventory_slots')
        .update({
            status: 'booked',
            booking_id: bookingId,
            held_at: null,
            held_by_session_id: null,
        })
        .eq('id', slotId);

    if (error) {
        console.error('Error confirming slot booking:', error);
        return { success: false, error: 'Failed to confirm booking' };
    }

    return { success: true };
}
