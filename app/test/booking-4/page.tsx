"use client";

import React, { useState } from "react";
import { Button } from "primereact/button";
import { div } from "framer-motion/client";

// --- MOCK DATA ---
const PRODUCTS = [
    {
        id: "prod_1",
        name: "Primary Sponsorship",
        price: 45000,
        interval: "issue",
        description: "Highest visibility. Top of email.",
    },
    {
        id: "prod_2",
        name: "Secondary Ad",
        price: 25000,
        interval: "issue",
        description: "Middle of content. Native ad.",
    },
];

// --- STYLES ---
const css = `
  .booking-4-wrapper {
    font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif;
    background: #fdfdfd;
    min-height: 100vh;
    padding: 60px 20px;
    color: #111;
  }

  .stack-container {
    max-width: 540px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .header-brand {
    text-align: center;
    margin-bottom: 40px;
  }

  .brand-logo {
    width: 48px;
    height: 48px;
    background: #111;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 24px;
    margin: 0 auto 16px auto;
  }

  .brand-name {
    font-weight: 700;
    font-size: 20px;
  }

  /* ACCORDION ITEM */
  .stack-item {
    background: #fff;
    border: 1px solid #e5e5e5;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
    transition: all 0.3s ease;
  }

  .stack-item.active {
    box-shadow: 0 10px 30px -5px rgba(0,0,0,0.08);
    border-color: #000;
    transform: scale(1.01);
  }

  .stack-item.completed {
    border-color: #ededed;
    background: #fafafa;
  }

  .item-header {
    padding: 20px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
  }
  
  .item-header-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .step-num {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #f0f0f0;
    color: #666;
    font-size: 12px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .active .step-num {
    background: #000;
    color: #fff;
  }
  
  .completed .step-num {
    background: #10b981;
    color: #fff;
    content: "✓";
  }

  .item-title {
    font-weight: 600;
    font-size: 16px;
  }

  .item-summary {
    color: #666;
    font-size: 14px;
  }

  .item-content {
    padding: 0 24px 24px 24px;
    animation: slideDown 0.3s ease-out;
    border-top: 1px solid #f0f0f0;
  }

  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* PRODUCT SELECTOR */
  .product-option {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border: 1px solid #e5e5e5;
    border-radius: 12px;
    margin-bottom: 12px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .product-option:hover {
    border-color: #bbb;
    background: #fcfcfc;
  }

  .product-option.selected {
    border-color: #000;
    background: #fff;
    box-shadow: 0 0 0 2px #000 inset;
  }

  .p-name { font-weight: 600; display: block; }
  .p-desc { font-size: 13px; color: #666; }
  .p-price { font-weight: 600; }

  /* DATE GRID (Mini) */
  .mini-dates {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    margin-top: 16px;
  }
  
  .date-chip {
    padding: 10px;
    border: 1px solid #e5e5e5;
    border-radius: 8px;
    text-align: center;
    font-size: 14px;
    cursor: pointer;
  }

  .date-chip:hover { border-color: #999; }
  .date-chip.selected { 
    background: #000; 
    color: #fff; 
    border-color: #000;
  }

  /* FORM */
  .input-stacked {
    width: 100%;
    padding: 12px;
    margin-bottom: 12px;
    border: 1px solid #e5e5e5;
    border-radius: 8px;
    font-size: 15px;
    transition: border 0.2s;
  }
  .input-stacked:focus {
    outline: none;
    border-color: #000;
  }

  .btn-next {
    width: 100%;
    background: #000;
    color: #fff;
    padding: 14px;
    border-radius: 8px;
    font-weight: 600;
    border: none;
    cursor: pointer;
    font-size: 15px;
    margin-top: 8px;
  }
  
  .btn-next:hover {
    background: #222;
  }
`;

export default function BookingPageFour() {
    const [activeStep, setActiveStep] = useState(1);
    const [selections, setSelections] = useState<any>({
        product: null,
        date: null,
        details: { headline: "", link: "" }
    });

    const toggleStep = (step: number) => {
        // Only allow opening if previous steps are complete (basic validation logic simplified)
        if (step < activeStep) setActiveStep(step);
    };

    const handleProductSelect = (p: any) => {
        setSelections({ ...selections, product: p });
        setActiveStep(2);
    };

    const handleDateSelect = (d: string) => {
        setSelections({ ...selections, date: d });
        setActiveStep(3);
    };

    const handleSubmitDetails = () => {
        setActiveStep(4);
    };

    return (
        <>
            <style>{css}</style>
            <div className="booking-4-wrapper">
                <div className="header-brand">
                    <div className="brand-logo">S</div>
                    <div className="brand-name">Sponsra</div>
                </div>

                <div className="stack-container">

                    {/* STEP 1: PRODUCT */}
                    <div className={`stack-item ${activeStep === 1 ? 'active' : ''} ${activeStep > 1 ? 'completed' : ''}`}>
                        <div className="item-header" onClick={() => toggleStep(1)}>
                            <div className="item-header-left">
                                <div className="step-num">{activeStep > 1 ? '✓' : '1'}</div>
                                <div className="item-title">Product</div>
                            </div>
                            {activeStep > 1 && selections.product && (
                                <div className="item-summary">{selections.product.name} — ${(selections.product.price / 100)}</div>
                            )}
                        </div>
                        {activeStep === 1 && (
                            <div className="item-content">
                                {PRODUCTS.map(p => (
                                    <div
                                        key={p.id}
                                        className={`product-option ${selections.product?.id === p.id ? 'selected' : ''}`}
                                        onClick={() => handleProductSelect(p)}
                                    >
                                        <div>
                                            <span className="p-name">{p.name}</span>
                                            <span className="p-desc">{p.description}</span>
                                        </div>
                                        <div className="p-price">${p.price / 100}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* STEP 2: DATE */}
                    <div className={`stack-item ${activeStep === 2 ? 'active' : ''} ${activeStep > 2 ? 'completed' : ''}`}>
                        <div className="item-header" onClick={() => toggleStep(2)}>
                            <div className="item-header-left">
                                <div className="step-num">{activeStep > 2 ? '✓' : '2'}</div>
                                <div className="item-title">Select Date</div>
                            </div>
                            {activeStep > 2 && selections.date && (
                                <div className="item-summary">{selections.date}</div>
                            )}
                        </div>
                        {activeStep === 2 && (
                            <div className="item-content">
                                <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>Available dates for {selections.product?.name}:</p>
                                <div className="mini-dates">
                                    {['Oct 12', 'Oct 19', 'Oct 26', 'Nov 2', 'Nov 9', 'Nov 16'].map(d => (
                                        <div
                                            key={d}
                                            className={`date-chip ${selections.date === d ? 'selected' : ''}`}
                                            onClick={() => handleDateSelect(d)}
                                        >
                                            {d}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* STEP 3: DETAILS */}
                    <div className={`stack-item ${activeStep === 3 ? 'active' : ''} ${activeStep > 3 ? 'completed' : ''}`}>
                        <div className="item-header" onClick={() => toggleStep(3)}>
                            <div className="item-header-left">
                                <div className="step-num">{activeStep > 3 ? '✓' : '3'}</div>
                                <div className="item-title">Campaign Details</div>
                            </div>
                        </div>
                        {activeStep === 3 && (
                            <div className="item-content">
                                <input
                                    className="input-stacked"
                                    placeholder="Campaign Headline"
                                    value={selections.details.headline}
                                    onChange={e => setSelections({ ...selections, details: { ...selections.details, headline: e.target.value } })}
                                />
                                <input
                                    className="input-stacked"
                                    placeholder="Target URL (https://...)"
                                    value={selections.details.link}
                                    onChange={e => setSelections({ ...selections, details: { ...selections.details, link: e.target.value } })}
                                />
                                <button className="btn-next" onClick={handleSubmitDetails}>Continue to Payment</button>
                            </div>
                        )}
                    </div>

                    {/* STEP 4: PAYMENT */}
                    <div className={`stack-item ${activeStep === 4 ? 'active' : ''}`}>
                        <div className="item-header">
                            <div className="item-header-left">
                                <div className="step-num">4</div>
                                <div className="item-title">Payment</div>
                            </div>
                        </div>
                        {activeStep === 4 && (
                            <div className="item-content">
                                <div style={{ background: '#f9f9f9', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span>Total Due</span>
                                        <span style={{ fontWeight: '700' }}>${selections.product?.price / 100}</span>
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#666' }}>Secure payment via Stripe</div>
                                </div>
                                <button className="btn-next" onClick={() => alert("Flow Complete")}>Pay & Book</button>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </>
    );
}
