'use server';

import { createClient } from '@/utils/supabase/server';
import {
    Product,
    ProductFormData,
    AssetRequirement,
    AssetRequirementFormData
} from '@/app/types/product';

// ============================================
// PRODUCT CRUD OPERATIONS
// ============================================

/**
 * Create a new product with asset requirements
 */
export async function createProduct(data: ProductFormData) {
    const supabase = await createClient();

    // Verify authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    // Get user's newsletter
    const { data: newsletter, error: newsletterError } = await supabase
        .from('newsletters')
        .select('id')
        .eq('owner_id', user.id)
        .single();

    if (newsletterError || !newsletter) {
        return { success: false, error: 'Newsletter not found' };
    }

    // Create product
    const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
            newsletter_id: newsletter.id,
            creator_id: user.id,
            name: data.name,
            description: data.description,
            product_type: data.product_type,
            price: data.price,
            is_active: data.is_active,
            frequency: data.frequency,
            active_days: data.active_days,
            start_date: data.start_date,
            placements_per_issue: data.placements_per_issue,
        })
        .select()
        .single();

    if (productError) {
        console.error('Error creating product:', productError);
        return { success: false, error: productError.message };
    }

    // Create asset requirements
    if (data.asset_requirements.length > 0) {
        const assetRequirementsData = data.asset_requirements.map(req => ({
            product_id: product.id,
            kind: req.kind,
            label: req.label,
            helper_text: req.helper_text,
            is_required: req.is_required,
            display_order: req.display_order,
            constraints: req.constraints,
        }));

        const { error: assetsError } = await supabase
            .from('asset_requirements')
            .insert(assetRequirementsData);

        if (assetsError) {
            console.error('Error creating asset requirements:', assetsError);
            // Rollback: delete the product
            await supabase.from('products').delete().eq('id', product.id);
            return { success: false, error: 'Failed to create asset requirements' };
        }
    }

    return { success: true, productId: product.id };
}

/**
 * Update an existing product
 */
export async function updateProduct(id: string, data: ProductFormData) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    // Update product
    const { error: productError } = await supabase
        .from('products')
        .update({
            name: data.name,
            description: data.description,
            product_type: data.product_type,
            price: data.price,
            is_active: data.is_active,
            frequency: data.frequency,
            active_days: data.active_days,
            start_date: data.start_date,
            placements_per_issue: data.placements_per_issue,
        })
        .eq('id', id)
        .eq('creator_id', user.id);

    if (productError) {
        console.error('Error updating product:', productError);
        return { success: false, error: productError.message };
    }

    // Delete existing asset requirements
    await supabase
        .from('asset_requirements')
        .delete()
        .eq('product_id', id);

    // Re-create asset requirements
    if (data.asset_requirements.length > 0) {
        const assetRequirementsData = data.asset_requirements.map(req => ({
            product_id: id,
            kind: req.kind,
            label: req.label,
            helper_text: req.helper_text,
            is_required: req.is_required,
            display_order: req.display_order,
            constraints: req.constraints,
        }));

        const { error: assetsError } = await supabase
            .from('asset_requirements')
            .insert(assetRequirementsData);

        if (assetsError) {
            console.error('Error updating asset requirements:', assetsError);
            return { success: false, error: 'Failed to update asset requirements' };
        }
    }

    return { success: true };
}

/**
 * Delete (archive) a product
 */
export async function deleteProduct(id: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    // Soft delete by archiving
    const { error } = await supabase
        .from('products')
        .update({ is_archived: true, is_active: false })
        .eq('id', id)
        .eq('creator_id', user.id);

    if (error) {
        console.error('Error deleting product:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

/**
 * Get all products for a newsletter
 */
export async function getProducts(newsletterId: string): Promise<Product[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('products')
        .select(`
      *,
      asset_requirements (*)
    `)
        .eq('newsletter_id', newsletterId)
        .eq('is_archived', false)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching products:', error);
        return [];
    }

    return data as Product[];
}

/**
 * Get a single product with asset requirements
 */
export async function getProduct(id: string): Promise<Product | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('products')
        .select(`
      *,
      asset_requirements (*)
    `)
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching product:', error);
        return null;
    }

    return data as Product;
}

/**
 * Get active products for public booking (no auth required)
 */
export async function getActiveProducts(newsletterId: string): Promise<Product[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('products')
        .select(`
      *,
      asset_requirements (*)
    `)
        .eq('newsletter_id', newsletterId)
        .eq('is_active', true)
        .eq('is_archived', false)
        .order('product_type', { ascending: true })
        .order('price', { ascending: false });

    if (error) {
        console.error('Error fetching active products:', error);
        return [];
    }

    return data as Product[];
}

/**
 * Get product statistics (total slots, booked slots, revenue)
 */
export async function getProductStats(productId: string) {
    const supabase = await createClient();

    // Get slot counts
    const { data: slots, error: slotsError } = await supabase
        .from('inventory_slots')
        .select('status')
        .eq('product_id', productId);

    if (slotsError) {
        console.error('Error fetching slot stats:', slotsError);
        return null;
    }

    const totalSlots = slots.length;
    const bookedSlots = slots.filter(s => s.status === 'booked').length;
    const availableSlots = slots.filter(s => s.status === 'available').length;
    const heldSlots = slots.filter(s => s.status === 'held').length;

    // Get revenue
    const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('amount_paid')
        .eq('product_id', productId)
        .in('status', ['paid', 'approved', 'completed']);

    const totalRevenue = bookings?.reduce((sum, b) => sum + (b.amount_paid || 0), 0) || 0;

    return {
        totalSlots,
        bookedSlots,
        availableSlots,
        heldSlots,
        totalRevenue,
        fillRate: totalSlots > 0 ? (bookedSlots / totalSlots) * 100 : 0,
    };
}
