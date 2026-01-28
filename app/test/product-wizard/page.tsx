'use client';

import React, { useState } from 'react';
import styles from './page.module.css';

// --- Icons (Inline SVGs) ---
const Plus = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);

const Trash2 = ({ size = 24 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line>
        <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
);

const Settings = ({ size = 24 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
);

const ChevronRight = ({ size = 24 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
);

const ChevronLeft = ({ size = 24 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
);

const Check = ({ size = 24 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);

const Eye = ({ size = 24 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
    </svg>
);

const TypeIcon = ({ size = 24 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4 7 4 4 20 4 20 7"></polyline>
        <line x1="9" y1="20" x2="15" y2="20"></line>
        <line x1="12" y1="4" x2="12" y2="20"></line>
    </svg>
);

const ImageIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <circle cx="8.5" cy="8.5" r="1.5"></circle>
        <polyline points="21 15 16 10 5 21"></polyline>
    </svg>
);

const LinkIcon = ({ size = 24 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
    </svg>
);

const AlignLeft = ({ size = 24 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="17" y1="10" x2="3" y2="10"></line>
        <line x1="21" y1="6" x2="3" y2="6"></line>
        <line x1="21" y1="14" x2="3" y2="14"></line>
        <line x1="17" y1="18" x2="3" y2="18"></line>
    </svg>
);


// --- Types ---

type ProductType = 'Primary' | 'Secondary' | 'Classified' | 'Takeover';
type Frequency = 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';
type AssetKind = 'headline' | 'body' | 'image' | 'link';

interface AssetConstraints {
    maxChars?: number;      // For headline/body
    aspectRatio?: string;   // For images (e.g., "1:1", "16:9")
    fileTypes?: string[];   // For images (e.g., ["png", "jpg"])
}

interface AssetRequirement {
    id: string;
    kind: AssetKind;
    label: string;
    helperText: string;
    required: boolean;
    constraints: AssetConstraints;
}

interface ProductFormData {
    name: string;
    description: string;
    price: number | '';
    bookingDetails: string;
    productType: ProductType;
    frequency: Frequency;
    startDate: string;
    activeDays: string[];
    placementsPerIssue: number;
    assets: AssetRequirement[];
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// --- Presets ---

const STANDARD_ASSETS: AssetRequirement[] = [
    {
        id: '1', kind: 'image', label: 'Ad Creative', helperText: 'Square logo', required: true,
        constraints: { aspectRatio: '1:1', fileTypes: ['png', 'jpg'] }
    },
    {
        id: '2', kind: 'headline', label: 'Headline', helperText: 'Catchy title', required: true,
        constraints: { maxChars: 60 }
    },
    {
        id: '3', kind: 'body', label: 'Ad Copy', helperText: 'Main text', required: true,
        constraints: { maxChars: 280 }
    },
    {
        id: '4', kind: 'link', label: 'CTA URL', helperText: 'Destination link', required: true,
        constraints: {}
    },
];

// --- Component ---

export default function CreateProductWizard() {
    const [currentStep, setCurrentStep] = useState(1);
    const [openSettingsId, setOpenSettingsId] = useState<string | null>(null);

    const [formData, setFormData] = useState<ProductFormData>({
        name: '',
        description: '',
        price: '',
        bookingDetails: '',
        productType: 'Primary',
        frequency: 'Weekly',
        startDate: new Date().toISOString().split('T')[0],
        activeDays: [],
        placementsPerIssue: 1,
        assets: STANDARD_ASSETS,
    });

    // --- Handlers ---

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleDayToggle = (day: string) => {
        setFormData((prev) => {
            const activeDays = prev.activeDays.includes(day)
                ? prev.activeDays.filter((d) => d !== day)
                : [...prev.activeDays, day];
            return { ...prev, activeDays };
        });
    };

    const updateAsset = (id: string, field: keyof AssetRequirement, value: any) => {
        setFormData((prev) => ({
            ...prev,
            assets: prev.assets.map((asset) => (asset.id === id ? { ...asset, [field]: value } : asset)),
        }));
    };

    const updateConstraint = (id: string, key: keyof AssetConstraints, value: any) => {
        setFormData((prev) => ({
            ...prev,
            assets: prev.assets.map((asset) =>
                asset.id === id ? { ...asset, constraints: { ...asset.constraints, [key]: value } } : asset
            ),
        }));
    };

    const removeAsset = (id: string) => {
        setFormData((prev) => ({
            ...prev,
            assets: prev.assets.filter((asset) => asset.id !== id),
        }));
    };

    const addAsset = (kind: AssetKind) => {
        const newAsset: AssetRequirement = {
            id: Math.random().toString(36).substr(2, 9),
            kind,
            label: `New ${kind.charAt(0).toUpperCase() + kind.slice(1)}`,
            helperText: '',
            required: false,
            constraints: kind === 'image' ? { aspectRatio: '16:9' } : { maxChars: 100 }
        };
        setFormData((prev) => ({ ...prev, assets: [...prev.assets, newAsset] }));
    };

    const toggleSettings = (id: string) => {
        setOpenSettingsId(openSettingsId === id ? null : id);
    };

    const handleSubmit = () => {
        console.log('Submitting Product:', formData);
        alert('Product Created!');
    };

    const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 3));
    const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

    // --- Render Steps ---

    const renderStep1 = () => (
        <div className={styles.stack}>
            <div className={styles.helperBox}>
                <div className={styles.helperIcon}><TypeIcon size={20} /></div>
                <div>
                    <h3 className={styles.helperTitle}>Define your Product</h3>
                    <p className={styles.helperText}>This is what sponsors will see in your storefront. Make the name clear and the description enticing.</p>
                </div>
            </div>

            <div className={styles.grid}>
                <div>
                    <label className={styles.label}>Product Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={styles.input}
                        placeholder="e.g. Primary Newsletter Sponsorship"
                    />
                </div>

                <div className={styles.grid2}>
                    <div>
                        <label className={styles.label}>Price per Slot</label>
                        <div className={styles.inputWrapper}>
                            <div className={styles.inputPrefix}>
                                <span className={styles.prefixSymbol}>$</span>
                            </div>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleInputChange}
                                className={`${styles.input} ${styles.inputWithPrefix}`}
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                    <div>
                        <label className={styles.label}>Ad Format</label>
                        <select
                            name="productType"
                            value={formData.productType}
                            onChange={handleInputChange}
                            className={styles.select}
                        >
                            <option value="Primary">Primary (Top of email)</option>
                            <option value="Secondary">Secondary (Middle/End)</option>
                            <option value="Classified">Classified (Text only)</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className={styles.label}>Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={3}
                        className={styles.textarea}
                        placeholder="What does the sponsor get? e.g. 'A dedicated slot at the top of our weekly newsletter read by 10k designers.'"
                    />
                </div>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className={styles.stack}>
            <div className={styles.helperBox}>
                <div className={styles.helperIcon}><Eye size={20} /></div>
                <div>
                    <h3 className={styles.helperTitle}>Set Availability</h3>
                    <p className={styles.helperText}>We'll automatically generate booking slots on your calendar based on these rules.</p>
                </div>
            </div>

            <div className={styles.grid}>
                <div className={styles.grid2}>
                    <div>
                        <label className={styles.label}>Frequency</label>
                        <select
                            name="frequency"
                            value={formData.frequency}
                            onChange={handleInputChange}
                            className={styles.select}
                        >
                            <option value="Daily">Daily</option>
                            <option value="Weekly">Weekly</option>
                            <option value="Monthly">Monthly</option>
                        </select>
                    </div>
                    <div>
                        <label className={styles.label}>Available From</label>
                        <input
                            type="date"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleInputChange}
                            className={styles.input}
                        />
                    </div>
                </div>

                <div>
                    <label className={styles.label} style={{ marginBottom: '0.75rem' }}>Which days do you send?</label>
                    <div className={styles.daysContainer}>
                        {DAYS_OF_WEEK.map((day) => (
                            <button
                                key={day}
                                type="button"
                                onClick={() => handleDayToggle(day)}
                                className={formData.activeDays.includes(day)
                                    ? `${styles.dayButton} ${styles.dayButtonActive}`
                                    : `${styles.dayButton} ${styles.dayButtonInactive}`
                                }
                            >
                                {day}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className={styles.splitView}>

            {/* LEFT COLUMN: Configuration */}
            <div className={styles.stack}>
                <div>
                    <h3 className={styles.sectionTitle}>What do you need from the sponsor?</h3>
                    <p className={styles.sectionSubtitle}>We've selected the standard requirements for this ad type. Click to edit or add more.</p>
                </div>

                <div className={styles.stack} style={{ gap: '0.75rem' }}>
                    {formData.assets.map((asset) => (
                        <div key={asset.id} className={styles.assetCard}>

                            {/* Top Row: Basic Info */}
                            <div className={styles.assetHeader}>
                                <div className={styles.assetTitleGroup}>
                                    <span className={styles.assetIcon}>
                                        {asset.kind === 'headline' && <TypeIcon size={16} />}
                                        {asset.kind === 'image' && <ImageIcon size={16} />}
                                        {asset.kind === 'link' && <LinkIcon size={16} />}
                                        {asset.kind === 'body' && <AlignLeft size={16} />}
                                    </span>
                                    {asset.label}
                                </div>
                                <div className={styles.assetActions}>
                                    <button
                                        onClick={() => toggleSettings(asset.id)}
                                        className={openSettingsId === asset.id ? `${styles.actionBtn} ${styles.actionBtnActive}` : styles.actionBtn}
                                        title="Edit Constraints"
                                    >
                                        <Settings size={14} />
                                    </button>
                                    <button onClick={() => removeAsset(asset.id)} className={styles.removeAssetBtn}>
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>

                            <div className={styles.grid} style={{ gap: '0.75rem' }}>
                                <div className={styles.grid2} style={{ gap: '0.75rem' }}>
                                    <div>
                                        <label className={styles.assetLabelSmall}>Label (What the sponsor sees)</label>
                                        <input
                                            value={asset.label}
                                            onChange={(e) => updateAsset(asset.id, 'label', e.target.value)}
                                            className={styles.assetInput}
                                            placeholder="Label"
                                        />
                                    </div>
                                    <div>
                                        <label className={styles.assetLabelSmall}>Helper Text (Example)</label>
                                        <input
                                            value={asset.helperText}
                                            onChange={(e) => updateAsset(asset.id, 'helperText', e.target.value)}
                                            className={styles.assetInput}
                                            placeholder="Helper Text"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* EXPANDABLE SETTINGS PANEL */}
                            {openSettingsId === asset.id && (
                                <div className={styles.settingsPanel}>
                                    <h4 className={styles.settingsTitle}>Constraints</h4>

                                    {/* Text Constraints */}
                                    {(asset.kind === 'headline' || asset.kind === 'body') && (
                                        <div className={styles.settingsRow}>
                                            <label className={styles.settingsLabel}>Max Characters:</label>
                                            <input
                                                type="number"
                                                value={asset.constraints.maxChars || ''}
                                                onChange={(e) => updateConstraint(asset.id, 'maxChars', parseInt(e.target.value))}
                                                className={styles.settingsInput}
                                            />
                                        </div>
                                    )}

                                    {/* Image Constraints */}
                                    {asset.kind === 'image' && (
                                        <div className={styles.stack} style={{ gap: '0.5rem' }}>
                                            <div className={styles.settingsRow}>
                                                <label className={styles.settingsLabel}>Aspect Ratio:</label>
                                                <select
                                                    value={asset.constraints.aspectRatio}
                                                    onChange={(e) => updateConstraint(asset.id, 'aspectRatio', e.target.value)}
                                                    className={styles.settingsSelect}
                                                >
                                                    <option value="1:1">Square (1:1)</option>
                                                    <option value="16:9">Landscape (16:9)</option>
                                                    <option value="9:16">Portrait (9:16)</option>
                                                    <option value="any">Any</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}

                    {/* New "Add Field" Button Group */}
                    <div className={styles.gridButtons}>
                        <button onClick={() => addAsset('headline')} className={styles.addCustomBtn}><Plus size={14} /> Text</button>
                        <button onClick={() => addAsset('image')} className={styles.addCustomBtn}><Plus size={14} /> Image</button>
                        <button onClick={() => addAsset('link')} className={styles.addCustomBtn}><Plus size={14} /> Link</button>
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN: Live Preview */}
            <div className={styles.previewContainer}>
                <div className={styles.stickyPreview}>
                    <div className={styles.previewFrame}>
                        <div className={styles.previewHeader}>
                            <div className={`${styles.windowControl} ${styles.windowControlRed}`}></div>
                            <div className={`${styles.windowControl} ${styles.windowControlYellow}`}></div>
                            <div className={`${styles.windowControl} ${styles.windowControlGreen}`}></div>
                            <span className={styles.previewTitle}>Sponsor Booking View</span>
                        </div>

                        <div className={styles.previewBody}>
                            <div className={styles.previewCard}>
                                <div className={styles.previewSectionHeader}>
                                    <h4 className={styles.previewHeading}>Upload Assets</h4>
                                    <p className={styles.previewSubheading}>Please provide the details for your {formData.name || 'Ad'}.</p>
                                </div>

                                {/* This renders the actual form inputs based on the settings on the left */}
                                <div className={styles.stack} style={{ gap: '1.25rem' }}>
                                    {formData.assets.map((asset) => (
                                        <div key={asset.id}>
                                            <label className={styles.previewLabel}>
                                                {asset.label || 'Untitled Field'} {asset.required && <span className={styles.previewRequired}>*</span>}
                                                {/* Show the constraint to the sponsor so they know! */}
                                                {asset.constraints.maxChars && <span className={styles.previewConstraint}>(Max {asset.constraints.maxChars} chars)</span>}
                                                {asset.constraints.aspectRatio && <span className={styles.previewConstraint}>({asset.constraints.aspectRatio})</span>}
                                            </label>

                                            {asset.kind === 'body' ? (
                                                <textarea
                                                    disabled
                                                    rows={3}
                                                    className={styles.previewTextareaDisabled}
                                                    placeholder={asset.helperText}
                                                ></textarea>
                                            ) : asset.kind === 'image' ? (
                                                <div className={styles.previewImageDropzone}>
                                                    <ImageIcon size={24} className="mb-1 opacity-50" />
                                                    <span style={{ fontSize: '0.75rem' }}>Drag & drop image</span>
                                                </div>
                                            ) : (
                                                <input
                                                    type="text"
                                                    disabled
                                                    className={styles.previewInputDisabled}
                                                    placeholder={asset.helperText}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div style={{ paddingTop: '1rem' }}>
                                    <button disabled className={styles.previewSubmitBtn}>Submit Assets</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.liveBadge}>
                        Live Preview
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className={styles.wrapper}>
            <div className={styles.container}>
                <div className={styles.pageIntro} style={{ paddingTop: '2rem' }}>
                    <h1 className={styles.pageTitle}>Create New Sponsorship</h1>
                    <p className={styles.pageSubtitle}>Set up your ad inventory in 3 simple steps.</p>
                </div>

                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.stepIndicatorContainer}>
                        {[1, 2, 3].map((step) => {
                            let circleClass = styles.stepCircleInactive;
                            let labelClass = styles.stepLabelInactive;

                            if (currentStep === step) {
                                circleClass = styles.stepCircleActive;
                                labelClass = styles.stepLabelActive;
                            } else if (currentStep > step) {
                                circleClass = styles.stepCircleCompleted;
                            }

                            return (
                                <React.Fragment key={step}>
                                    <div className={styles.stepItem}>
                                        <div className={`${styles.stepCircle} ${circleClass}`}>
                                            {currentStep > step ? <Check size={16} /> : step}
                                        </div>
                                        <span className={`${styles.stepLabel} ${labelClass}`}>
                                            {step === 1 && 'Details'}
                                            {step === 2 && 'Schedule'}
                                            {step === 3 && 'Assets'}
                                        </span>
                                    </div>
                                    {step < 3 && <div className={styles.stepLine}></div>}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>

                {/* Content */}
                <div className={styles.content}>
                    {currentStep === 1 && renderStep1()}
                    {currentStep === 2 && renderStep2()}
                    {currentStep === 3 && renderStep3()}
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    <button
                        onClick={prevStep}
                        disabled={currentStep === 1}
                        className={currentStep === 1 ? `${styles.navBtn} ${styles.backBtnDisabled}` : `${styles.navBtn} ${styles.backBtn}`}
                    >
                        <ChevronLeft size={16} /> Back
                    </button>

                    {currentStep < 3 ? (
                        <button
                            onClick={nextStep}
                            className={`${styles.navBtn} ${styles.nextBtn}`}
                        >
                            Next Step <ChevronRight size={16} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            className={`${styles.navBtn} ${styles.createBtn}`}
                        >
                            Create Product <Check size={16} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
