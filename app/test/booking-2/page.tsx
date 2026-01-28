"use client";

import React, { useState } from "react";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";

// --- MOCK DATA ---
const PRODUCTS = [
    {
        id: "prod_1",
        name: "Primary Sponsorship",
        price: 45000,
        description: "Main feature. Logo + 150 words + Link.",
        icon: "pi pi-star-fill",
    },
    {
        id: "prod_2",
        name: "Secondary Ad",
        price: 25000,
        description: "Middle placement. 100 words + Link.",
        icon: "pi pi-bookmark-fill",
    },
    {
        id: "prod_3",
        name: "Classified Link",
        price: 8000,
        description: "Bottom placement. 1 sentence + Link.",
        icon: "pi pi-link",
    },
];

// --- STYLES ---
const css = `
  .booking-2-wrapper {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #111;
    background: #fff;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .nav-header {
    height: 64px;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: center;
    position: sticky;
    top: 0;
    background: rgba(255,255,255,0.9);
    backdrop-filter: blur(8px);
    z-index: 10;
  }

  .progress-bar {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .progress-step {
    width: 40px;
    height: 4px;
    background: #e0e0e0;
    border-radius: 2px;
    transition: background 0.3s ease;
  }

  .progress-step.active {
    background: #000;
  }
  
  .container {
    max-width: 680px;
    width: 100%;
    margin: 0 auto;
    padding: 60px 24px 120px 24px; /* Bottom padding for sticky footer */
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .fade-in {
    animation: fadeIn 0.4s ease-out forwards;
    opacity: 0;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .step-title {
    font-size: 28px;
    font-weight: 700;
    text-align: center;
    margin-bottom: 8px;
  }

  .step-subtitle {
    text-align: center;
    color: #666;
    margin-bottom: 40px;
    font-size: 16px;
  }

  /* CARDS */
  .card-option {
    display: flex;
    align-items: center;
    padding: 24px;
    border: 2px solid #f0f0f0;
    border-radius: 12px;
    margin-bottom: 16px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.25, 1, 0.5, 1);
  }

  .card-option:hover {
    border-color: #d0d0d0;
    background: #fafafa;
  }

  .card-option.selected {
    border-color: #000;
    background: #fff;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  }

  .card-icon {
    width: 48px;
    height: 48px;
    background: #f8f8f8;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    margin-right: 20px;
  }
  
  .card-option.selected .card-icon {
    background: #000;
    color: #fff;
  }

  .card-content {
    flex: 1;
  }

  .card-title {
    font-weight: 600;
    font-size: 17px;
    margin-bottom: 4px;
  }

  .card-desc {
    color: #666;
    font-size: 14px;
  }

  .card-price {
    font-weight: 600;
    font-size: 16px;
  }

  /* FOOTER */
  .sticky-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background: #fff;
    border-top: 1px solid #eee;
    padding: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 -4px 20px rgba(0,0,0,0.03);
    z-index: 20;
  }

  .footer-summary {
    display: flex;
    flex-direction: column;
  }
  
  .footer-price {
    font-size: 20px;
    font-weight: 700;
  }

  .footer-desc {
    font-size: 13px;
    color: #666;
  }

  .btn-continue {
    background: #000;
    color: #fff;
    padding: 14px 40px;
    border-radius: 30px;
    font-weight: 600;
    border: none;
    cursor: pointer;
    font-size: 16px;
    transition: transform 0.1s;
    min-width: 160px;
  }
  
  .btn-continue:hover {
    transform: scale(1.02);
  }
  
  .btn-continue:active {
    transform: scale(0.98);
  }
  
  .btn-continue:disabled {
    background: #eee;
    color: #aaa;
    cursor: not-allowed;
    transform: none;
  }

  .btn-back {
    background: transparent;
    color: #666;
    border: none;
    font-size: 14px;
    cursor: pointer;
    margin-right: 20px;
    text-decoration: underline;
  }

  /* CALENDAR & FORM */
  .calendar-wrapper {
    display: flex;
    justify-content: center;
  }

  .form-field {
    margin-bottom: 24px;
  }
  
  .form-label {
    display: block;
    font-weight: 600;
    margin-bottom: 8px;
    font-size: 14px;
  }

  .p-inputtext {
    width: 100%;
    padding: 14px;
    border-radius: 8px;
    border: 1px solid #ddd;
  }
  
  .p-inputtext:focus {
    border-color: #000;
    outline: none;
  }
`;

export default function BookingPageTwo() {
    const [step, setStep] = useState(1);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [date, setDate] = useState<Date | null>(null);
    const [formData, setFormData] = useState({ headline: "", link: "" });

    const canContinue = () => {
        if (step === 1) return !!selectedProduct;
        if (step === 2) return !!date;
        if (step === 3) return formData.headline && formData.link;
        return true;
    };

    const handleNext = () => {
        if (step < 4) setStep(step + 1);
        else alert("Booking Submitted!");
    };

    const currentPrice = selectedProduct ? selectedProduct.price / 100 : 0;

    return (
        <>
            <style>{css}</style>
            <div className="booking-2-wrapper">
                {/* NAV */}
                <div className="nav-header">
                    <div className="progress-bar">
                        {[1, 2, 3, 4].map((s) => (
                            <div key={s} className={`progress-step ${s <= step ? "active" : ""}`} />
                        ))}
                    </div>
                </div>

                {/* CONTAINER */}
                <div className="container fade-in" key={step}>

                    {/* STEP 1: PRODUCT */}
                    {step === 1 && (
                        <>
                            <h1 className="step-title">Select Placement</h1>
                            <p className="step-subtitle">Choose the perfect spot for your ad.</p>

                            <div className="options-list">
                                {PRODUCTS.map((prod) => (
                                    <div
                                        key={prod.id}
                                        className={`card-option ${selectedProduct?.id === prod.id ? "selected" : ""}`}
                                        onClick={() => setSelectedProduct(prod)}
                                    >
                                        <div className="card-icon">
                                            <i className={prod.icon}></i>
                                        </div>
                                        <div className="card-content">
                                            <div className="card-title">{prod.name}</div>
                                            <div className="card-desc">{prod.description}</div>
                                        </div>
                                        <div className="card-price">${prod.price / 100}</div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* STEP 2: DATE */}
                    {step === 2 && (
                        <>
                            <h1 className="step-title">Select Date</h1>
                            <p className="step-subtitle">When should your ad go live?</p>
                            <div className="calendar-wrapper">
                                <Calendar
                                    value={date}
                                    onChange={(e) => setDate(e.value as Date)}
                                    inline
                                    showWeek
                                    style={{ width: '100%', maxWidth: '400px', border: 'none' }}
                                />
                            </div>
                        </>
                    )}

                    {/* STEP 3: CREATIVE */}
                    {step === 3 && (
                        <>
                            <h1 className="step-title">Ad Details</h1>
                            <p className="step-subtitle">Tell us what to display.</p>

                            <div className="form-field">
                                <label className="form-label">Headline</label>
                                <InputText
                                    placeholder="e.g. The future of productivity"
                                    value={formData.headline}
                                    onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                                />
                            </div>

                            <div className="form-field">
                                <label className="form-label">Destination URL</label>
                                <InputText
                                    placeholder="https://yourwebsite.com"
                                    value={formData.link}
                                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                />
                            </div>

                            <div className="card-option" style={{ cursor: 'default', background: '#f9f9f9', border: '1px dashed #ccc' }}>
                                <div className="card-icon">
                                    <i className="pi pi-image" style={{ fontSize: '1.2rem', color: '#666' }}></i>
                                </div>
                                <div className="card-content">
                                    <div className="card-title">Upload Asset</div>
                                    <div className="card-desc">Drag and drop or click to upload image</div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* STEP 4: REVIEW */}
                    {step === 4 && (
                        <>
                            <h1 className="step-title">Review & Pay</h1>
                            <p className="step-subtitle">Almost there! Confirm your booking.</p>

                            <div className="card-option" style={{ cursor: 'default' }}>
                                <div className="card-content">
                                    <div className="card-desc">Package</div>
                                    <div className="card-title">{selectedProduct?.name}</div>
                                </div>
                                <div className="card-price">${currentPrice}</div>
                            </div>

                            <div className="card-option" style={{ cursor: 'default' }}>
                                <div className="card-content">
                                    <div className="card-desc">Date</div>
                                    <div className="card-title">{date?.toDateString()}</div>
                                </div>
                            </div>

                            <div className="card-option" style={{ cursor: 'default' }}>
                                <div className="card-content">
                                    <div className="card-desc">Headline</div>
                                    <div className="card-title">{formData.headline}</div>
                                </div>
                            </div>
                        </>
                    )}

                </div>

                {/* FOOTER */}
                <div className="sticky-footer">
                    <div className="footer-summary">
                        {selectedProduct && (
                            <>
                                <span className="footer-price">${currentPrice.toFixed(2)}</span>
                                <span className="footer-desc">Total due today</span>
                            </>
                        )}
                        {!selectedProduct && (
                            <span className="footer-desc">Select a package to start</span>
                        )}
                    </div>
                    <div>
                        {step > 1 && (
                            <button className="btn-back" onClick={() => setStep(step - 1)}>Back</button>
                        )}
                        <button
                            className="btn-continue"
                            onClick={handleNext}
                            disabled={!canContinue()}
                        >
                            {step === 4 ? "Complete Payment" : "Continue"}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
