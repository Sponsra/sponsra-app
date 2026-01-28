"use client";

import React, { useState } from "react";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Sidebar } from "primereact/sidebar";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";

// --- MOCK DATA ---
const PRODUCTS = [
    {
        id: "prod_1",
        name: "Primary Sponsorship",
        price: 45000,
        description: "Top placement. High visibility.",
        color: "#4f46e5", // Indigo
    },
    {
        id: "prod_2",
        name: "Secondary Ad",
        price: 25000,
        description: "Middle placement. Native feel.",
        color: "#059669", // Emerald
    },
    {
        id: "prod_3",
        name: "Classified Link",
        price: 8000,
        description: "Text link at the bottom.",
        color: "#d97706", // Amber
    },
];

// --- STYLES ---
const css = `
  .booking-3-wrapper {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #333;
    background: #fff;
    height: 100vh;
    display: flex;
    overflow: hidden;
  }

  /* SIDEBAR (25%) */
  .left-sidebar {
    width: 320px;
    background: #f8fafc;
    border-right: 1px solid #e2e8f0;
    padding: 32px 24px;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
  }

  .brand-title {
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 40px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .section-label {
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-size: 11px;
    font-weight: 700;
    color: #94a3b8;
    margin-bottom: 16px;
  }

  /* PRODUCT LIST */
  .product-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .prod-btn {
    text-align: left;
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 16px;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
    overflow: hidden;
  }

  .prod-btn:hover {
    border-color: #cbd5e1;
    transform: translateY(-1px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  }

  .prod-btn.active {
    border-color: #333;
    background: #fff;
    box-shadow: 0 0 0 2px #333;
  }

  .prod-color-strip {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
  }

  .prod-name {
    font-weight: 600;
    font-size: 15px;
    margin-bottom: 4px;
    display: block;
  }

  .prod-price {
    font-size: 13px;
    color: #64748b;
  }

  /* MAIN (75%) */
  .main-area {
    flex: 1;
    padding: 40px;
    overflow-y: auto;
    background: #fff;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
  }
  
  .view-title {
    font-size: 24px;
    font-weight: 700;
  }

  /* BIG CALENDAR STYLE OVERRIDES */
  .hero-calendar {
    width: 100%;
    height: 100%;
  }

  .hero-calendar .p-calendar {
    width: 100%;
  }

  .hero-calendar .p-datepicker {
    width: 100%;
    border: none;
    padding: 0;
  }

  .hero-calendar .p-datepicker table {
    font-size: 16px;
  }

  /* Make cells big */
  .hero-calendar .p-datepicker td > span {
    width: 100%;
    height: 100px;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    padding: 12px;
    border: 1px solid transparent;
    transition: all 0.2s;
  }

  .hero-calendar .p-datepicker td > span:hover {
    background: #f1f5f9;
  }
  
  .hero-calendar .p-datepicker td > span.p-highlight {
    background: #3b82f6 !important; /* Will be overridden dynamically */
    color: #fff !important;
  }

  /* Custom cell content */
  .cell-content {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .date-num {
    font-weight: 600;
    font-size: 18px;
  }

  .status-badge {
    font-size: 11px;
    font-weight: 600;
    padding: 4px 8px;
    border-radius: 4px;
    background: rgba(255,255,255,0.9);
    color: #333;
    align-self: flex-start;
    margin-top: 4px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  }

  /* RIGHT DRAWER */
  .drawer-content {
    padding: 0 12px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }

  .drawer-header {
    margin-bottom: 32px;
    padding-bottom: 24px;
    border-bottom: 1px solid #e2e8f0;
  }

  .drawer-title {
    font-size: 24px;
    font-weight: 700;
    margin: 0;
  }
  
  .drawer-subtitle {
    color: #64748b;
    margin-top: 8px;
  }
  
  .form-group {
    margin-bottom: 24px;
  }

  .label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    font-size: 14px;
  }

  .input-field {
    width: 100%;
    padding: 12px;
    border-radius: 6px;
    border: 1px solid #cbd5e1;
  }

  .summary-box {
    background: #f8fafc;
    border-radius: 8px;
    padding: 20px;
    margin-top: 40px;
  }

  .summary-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
    font-size: 14px;
  }
  
  .total-row {
    border-top: 1px solid #e2e8f0;
    padding-top: 12px;
    font-weight: 700;
    font-size: 18px;
  }
  
  .btn-confirm {
    width: 100%;
    background: #0f172a;
    color: #fff;
    padding: 16px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 16px;
    border: none;
    margin-top: 24px;
    cursor: pointer;
  }
`;

export default function BookingPageThree() {
    const [selectedProduct, setSelectedProduct] = useState(PRODUCTS[0]);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [formData, setFormData] = useState({ headline: "", link: "" });

    const handleDateSelect = (e: any) => {
        setSelectedDate(e.value);
        setDrawerVisible(true);
    };

    const dateTemplate = (dateMeta: any) => {
        // Mock Availability: Randomly sold out
        const isOdd = dateMeta.day % 3 === 0;

        // We only style the content, PrimeReact handles the wrapper
        return (
            <div className="cell-content">
                <span className="date-num">{dateMeta.day}</span>
                {dateMeta.selectable && !dateMeta.otherMonth && (
                    <span className="status-badge" style={{ color: isOdd ? '#ef4444' : '#10b981' }}>
                        {isOdd ? 'Sold Out' : 'Available'}
                    </span>
                )}
            </div>
        );
    };

    return (
        <>
            <style>{css}</style>
            <style>{`
        /* Dynamic style injection for selected color highlight */
        .hero-calendar .p-datepicker td > span.p-highlight {
            background-color: ${selectedProduct.color} !important;
        }
      `}</style>

            <div className="booking-3-wrapper">
                {/* SIDEBAR */}
                <div className="left-sidebar">
                    <div className="brand-title">
                        <i className="pi pi-bolt" style={{ fontSize: '24px' }}></i>
                        SPONSRA
                    </div>

                    <div className="section-label">Inventory Type</div>

                    <div className="product-list">
                        {PRODUCTS.map(prod => (
                            <button
                                key={prod.id}
                                className={`prod-btn ${selectedProduct.id === prod.id ? 'active' : ''}`}
                                onClick={() => setSelectedProduct(prod)}
                            >
                                <div className="prod-color-strip" style={{ background: prod.color }}></div>
                                <span className="prod-name">{prod.name}</span>
                                <span className="prod-price">${prod.price / 100} / slot</span>
                            </button>
                        ))}
                    </div>

                    <div style={{ marginTop: 'auto', fontSize: '12px', color: '#94a3b8' }}>
                        <p>Select a product above, then click an available date on the calendar to book.</p>
                    </div>
                </div>

                {/* MAIN AREA */}
                <div className="main-area">
                    <div className="page-header">
                        <div className="view-title">
                            Availability for <span style={{ color: selectedProduct.color }}>{selectedProduct.name}</span>
                        </div>
                        <div>
                            {/* Controls could go here */}
                        </div>
                    </div>

                    <div className="hero-calendar">
                        <Calendar
                            value={selectedDate}
                            onChange={handleDateSelect}
                            inline
                            dateTemplate={dateTemplate}
                            className="w-full h-full"
                        />
                    </div>
                </div>

                {/* DETAILS DRAWER */}
                <Sidebar
                    visible={drawerVisible}
                    position="right"
                    onHide={() => setDrawerVisible(false)}
                    style={{ width: '450px' }}
                >
                    <div className="drawer-content">
                        <div className="drawer-header">
                            <h2 className="drawer-title">Complete Booking</h2>
                            <p className="drawer-subtitle">
                                {selectedDate?.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>

                        <div className="form-group">
                            <label className="label">Product</label>
                            <div style={{ padding: '12px', background: '#f1f5f9', borderRadius: '6px', fontWeight: '500' }}>
                                {selectedProduct.name}
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="label">Headline</label>
                            <InputText
                                className="input-field"
                                placeholder="Enter headline..."
                                value={formData.headline}
                                onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label className="label">Link URL</label>
                            <InputText
                                className="input-field"
                                placeholder="https://..."
                                value={formData.link}
                                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                            />
                        </div>

                        <div className="summary-box">
                            <div className="summary-row">
                                <span>Subtotal</span>
                                <span>${selectedProduct.price / 100}</span>
                            </div>
                            <div className="summary-row">
                                <span>Service Fee</span>
                                <span>$0.00</span>
                            </div>
                            <div className="summary-row total-row">
                                <span>Total</span>
                                <span>${selectedProduct.price / 100}</span>
                            </div>
                        </div>

                        <button className="btn-confirm" onClick={() => alert("Booked!")}>
                            Confirm & Pay
                        </button>
                    </div>
                </Sidebar>

            </div>
        </>
    );
}
