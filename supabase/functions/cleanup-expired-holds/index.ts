// supabase/functions/cleanup-expired-holds/index.ts
// Cron job Edge Function to release expired slot holds (15-min TTL)

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const HOLD_EXPIRATION_MINUTES = 15;

Deno.serve(async (req: Request) => {
    try {
        // Create Supabase client with service role for admin access
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Calculate expiration threshold (15 minutes ago)
        const expirationThreshold = new Date();
        expirationThreshold.setMinutes(expirationThreshold.getMinutes() - HOLD_EXPIRATION_MINUTES);
        const thresholdISO = expirationThreshold.toISOString();

        // Find and release expired holds
        const { data: expiredSlots, error: selectError } = await supabase
            .from('inventory_slots')
            .select('id, held_at, held_by_session_id')
            .eq('status', 'held')
            .lt('held_at', thresholdISO);

        if (selectError) {
            console.error('Error finding expired holds:', selectError);
            return new Response(
                JSON.stringify({ error: 'Failed to find expired holds', details: selectError }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const expiredCount = expiredSlots?.length || 0;

        if (expiredCount === 0) {
            console.log('No expired holds to clean up');
            return new Response(
                JSON.stringify({ success: true, releasedCount: 0, message: 'No expired holds' }),
                { status: 200, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Release expired holds
        const expiredIds = expiredSlots!.map(s => s.id);

        const { error: updateError } = await supabase
            .from('inventory_slots')
            .update({
                status: 'available',
                held_at: null,
                held_by_session_id: null,
            })
            .in('id', expiredIds);

        if (updateError) {
            console.error('Error releasing expired holds:', updateError);
            return new Response(
                JSON.stringify({ error: 'Failed to release holds', details: updateError }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        console.log(`Released ${expiredCount} expired holds`);

        // Log session IDs for debugging
        const sessionIds = [...new Set(expiredSlots!.map(s => s.held_by_session_id))];
        console.log('Affected sessions:', sessionIds);

        return new Response(
            JSON.stringify({
                success: true,
                releasedCount: expiredCount,
                affectedSessions: sessionIds.length,
                threshold: thresholdISO,
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('Error in cleanup-expired-holds function:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error', details: String(error) }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
});
