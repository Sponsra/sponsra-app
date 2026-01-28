// app/types/product.ts
// Type definitions for the Products system

// ============================================
// ENUMS
// ============================================

export type ProductFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type ProductType = 'primary' | 'secondary' | 'classified';
export type AssetKind = 'headline' | 'body' | 'image' | 'link';
export type SlotStatus = 'available' | 'held' | 'booked' | 'locked';

// ============================================
// ASSET REQUIREMENTS
// ============================================

// Constraints for different asset types
export interface AssetConstraints {
    // For headline/body text
    maxChars?: number;
    minChars?: number;

    // For images
    aspectRatio?: string; // e.g., "16:9", "1:1", "1.91:1"
    maxSizeMB?: number;
    allowedFormats?: string[]; // e.g., ["jpg", "png", "webp"]

    // For links
    pattern?: string; // Regex pattern for validation

    // General
    required?: boolean;
}

export interface AssetRequirement {
    id: string; // UUID
    created_at: string;
    product_id: string;
    kind: AssetKind;
    label: string; // Display label, e.g., "Headline", "Company Logo"
    helper_text?: string; // Help text shown to sponsor
    is_required: boolean;
    display_order: number;
    constraints: AssetConstraints;
}

// For creating/updating asset requirements
export interface AssetRequirementFormData {
    id?: string;
    kind: AssetKind;
    label: string;
    helper_text?: string;
    is_required: boolean;
    display_order: number;
    constraints: AssetConstraints;
}

// ============================================
// PRODUCTS
// ============================================

export interface Product {
    id: string; // UUID
    created_at: string;
    updated_at: string;
    newsletter_id: string;
    creator_id: string;

    // Product details
    name: string;
    description?: string;
    product_type: ProductType;
    price: number; // In cents
    is_active: boolean;
    is_archived: boolean;

    // Schedule configuration
    frequency: ProductFrequency;
    active_days: number[]; // 0=Sunday, 6=Saturday
    start_date: string; // YYYY-MM-DD
    placements_per_issue: number;

    // Relationships (when included in query)
    asset_requirements?: AssetRequirement[];
}

// Public-facing product (for sponsor booking flow)
export interface ProductPublic {
    id: string;
    name: string;
    description?: string;
    product_type: ProductType;
    price: number;
    is_active: boolean;
    frequency: ProductFrequency;
    active_days: number[];
    asset_requirements: AssetRequirement[];
}

// For product creation/editing wizard
export interface ProductFormData {
    id?: string;
    name: string;
    description?: string;
    product_type: ProductType;
    price: number; // In cents
    is_active: boolean;

    // Schedule
    frequency: ProductFrequency;
    active_days: number[];
    start_date: string; // YYYY-MM-DD
    placements_per_issue: number;

    // Asset requirements (configured in Step 3)
    asset_requirements: AssetRequirementFormData[];
}

// ============================================
// INVENTORY SLOTS
// ============================================

export interface InventorySlot {
    id: string; // UUID
    created_at: string;
    product_id: string;
    slot_date: string; // YYYY-MM-DD
    slot_index: number; // 1-based index for multiple placements
    status: SlotStatus;

    // Hold management
    held_at?: string;
    held_by_session_id?: string;

    // Booking reference
    booking_id?: string;

    // Relationships (when included)
    product?: Product;
}

// For calendar UI
export interface SlotAvailability {
    date: string; // YYYY-MM-DD
    total_slots: number;
    booked_slots: number;
    available_slots: number;
    held_slots: number;
    slots: InventorySlot[];
}

// ============================================
// BOOKING ASSETS
// ============================================

export interface BookingAsset {
    id: string;
    created_at: string;
    booking_id: string;
    asset_requirement_id: string;
    value: string; // URL for images, text for other types

    // Relationships
    asset_requirement?: AssetRequirement;
}

// For submitting assets during booking
export interface BookingAssetSubmission {
    asset_requirement_id: string;
    value: string;
}

// ============================================
// DEFAULT CONFIGURATIONS
// ============================================

// Default asset requirements for different product types
export const DEFAULT_ASSET_REQUIREMENTS: Record<ProductType, AssetRequirementFormData[]> = {
    primary: [
        {
            kind: 'headline',
            label: 'Headline',
            helper_text: 'Eye-catching headline for your sponsorship',
            is_required: true,
            display_order: 0,
            constraints: { maxChars: 60, minChars: 10 }
        },
        {
            kind: 'body',
            label: 'Description',
            helper_text: 'Detailed description of your product or service',
            is_required: true,
            display_order: 1,
            constraints: { maxChars: 280, minChars: 50 }
        },
        {
            kind: 'image',
            label: 'Logo/Image',
            helper_text: 'Upload your company logo or product image',
            is_required: true,
            display_order: 2,
            constraints: {
                aspectRatio: '1.91:1',
                maxSizeMB: 2,
                allowedFormats: ['jpg', 'png', 'webp']
            }
        },
        {
            kind: 'link',
            label: 'Call-to-Action URL',
            helper_text: 'Where should readers go when they click?',
            is_required: true,
            display_order: 3,
            constraints: { pattern: '^https?://.*' }
        }
    ],
    secondary: [
        {
            kind: 'headline',
            label: 'Headline',
            helper_text: 'Short headline for your ad',
            is_required: true,
            display_order: 0,
            constraints: { maxChars: 80, minChars: 10 }
        },
        {
            kind: 'body',
            label: 'Description',
            helper_text: 'Description of your offering',
            is_required: true,
            display_order: 1,
            constraints: { maxChars: 400, minChars: 30 }
        },
        {
            kind: 'link',
            label: 'Link URL',
            helper_text: 'Link to your website',
            is_required: true,
            display_order: 2,
            constraints: { pattern: '^https?://.*' }
        }
    ],
    classified: [
        {
            kind: 'headline',
            label: 'Classified Text',
            helper_text: 'Brief description with link',
            is_required: true,
            display_order: 0,
            constraints: { maxChars: 100, minChars: 10 }
        },
        {
            kind: 'link',
            label: 'Link URL',
            helper_text: 'Where should this classified link to?',
            is_required: true,
            display_order: 1,
            constraints: { pattern: '^https?://.*' }
        }
    ]
};

// Frequency display labels
export const FREQUENCY_LABELS: Record<ProductFrequency, string> = {
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    yearly: 'Yearly'
};

// Product type display labels
export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
    primary: 'Primary Sponsor',
    secondary: 'Secondary Sponsor',
    classified: 'Classified Ad'
};

// Asset kind display labels
export const ASSET_KIND_LABELS: Record<AssetKind, string> = {
    headline: 'Headline',
    body: 'Body Text',
    image: 'Image',
    link: 'Link'
};

// Days of week for schedule configuration
export const DAYS_OF_WEEK = [
    { label: 'Sun', value: 0 },
    { label: 'Mon', value: 1 },
    { label: 'Tue', value: 2 },
    { label: 'Wed', value: 3 },
    { label: 'Thu', value: 4 },
    { label: 'Fri', value: 5 },
    { label: 'Sat', value: 6 }
];
