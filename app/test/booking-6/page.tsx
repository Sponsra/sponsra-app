"use client";

import React, { useState } from "react";
import { Avatar } from "primereact/avatar";
import { Calendar } from "primereact/calendar";

// --- MOCK DATA ---
const PRODUCTS = [
    { id: 1, name: "Primary Sponsor", price: 500, status: "Available", date: "Multiple Dates", icon: "P" },
    { id: 2, name: "Secondary Ad", price: 250, status: "Limited", date: "Flexible", icon: "S" },
    { id: 3, name: "Classified Link", price: 100, status: "Available", date: "Flexible", icon: "C" },
];

// --- STYLES ---
const css = `
  .booking-6-wrapper {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    display: flex;
    height: 100vh;
    overflow: hidden;
    background: #fff;
  }

  /* LIST PANE (30%) */
  .list-pane {
    width: 350px;
    border-right: 1px solid #e0e0e0;
    display: flex;
    flex-direction: column;
    background: #fdfdfd;
  }

  .pane-header {
    height: 60px;
    border-bottom: 1px solid #e0e0e0;
    display: flex;
    align-items: center;
    padding: 0 20px;
    font-weight: 600;
  }

  .list-item {
    padding: 20px;
    border-bottom: 1px solid #f0f0f0;
    cursor: pointer;
    transition: background 0.1s;
    display: flex;
    gap: 16px;
  }

  .list-item:hover {
    background: #f5f5f5;
  }

  .list-item.selected {
    background: #eef2ff; /* Light indigo */
    border-left: 3px solid #4f46e5;
  }

  .item-avatar {
    width: 40px;
    height: 40px;
    background: #e0e0e0;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    color: #666;
  }
  
  .list-item.selected .item-avatar {
    background: #4f46e5;
    color: #fff;
  }

  .item-content {
    flex: 1;
  }

  .item-title {
    font-weight: 600;
    font-size: 15px;
    margin-bottom: 4px;
    color: #111;
  }

  .item-subtitle {
    font-size: 13px;
    color: #666;
    display: flex;
    justify-content: space-between;
  }

  /* DETAIL PANE (70%) */
  .detail-pane {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }

  .detail-header {
    height: 60px;
    border-bottom: 1px solid #e0e0e0;
    padding: 0 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #fff;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .detail-title {
    font-size: 18px;
    font-weight: 700;
  }

  .detail-actions {
    display: flex;
    gap: 12px;
  }

  .action-btn {
    padding: 8px 16px;
    border-radius: 6px;
    border: 1px solid #ccc;
    background: #fff;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
  }
  
  .action-btn.primary {
    background: #111;
    color: #fff;
    border-color: #111;
  }

  .detail-content {
    padding: 40px;
    max-width: 800px;
    margin: 0 auto;
    width: 100%;
  }

  .content-section {
    margin-bottom: 40px;
  }

  .section-label {
    font-size: 12px;
    text-transform: uppercase;
    color: #888;
    font-weight: 700;
    margin-bottom: 12px;
    letter-spacing: 0.5px;
  }

  .info-card {
    background: #f9f9f9;
    padding: 24px;
    border-radius: 8px;
    border: 1px solid #eee;
  }
  
  .form-row {
     display: grid;
     grid-template-columns: 1fr 1fr;
     gap: 20px;
  }
  
  .form-input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 6px;
  }

  .calendar-wrapper {
    background: #fff;
    border: 1px solid #eee;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.03);
  }
`;

export default function BookingPageSix() {
    const [selectedId, setSelectedId] = useState(1);
    const [date, setDate] = useState<Date | null>(null);

    const selectedProduct = PRODUCTS.find(p => p.id === selectedId);

    return (
        <>
            <style>{css}</style>
            <div className="booking-6-wrapper">

                {/* LIST PANE */}
                <div className="list-pane">
                    <div className="pane-header">Available Products</div>
                    {PRODUCTS.map(p => (
                        <div
                            key={p.id}
                            className={`list-item ${selectedId === p.id ? 'selected' : ''}`}
                            onClick={() => setSelectedId(p.id)}
                        >
                            <div className="item-avatar">{p.icon}</div>
                            <div className="item-content">
                                <div className="item-title">{p.name}</div>
                                <div className="item-subtitle">
                                    <span>${p.price}</span>
                                    <span>{p.status}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* DETAIL PANE */}
                <div className="detail-pane">
                    {selectedProduct && (
                        <>
                            <div className="detail-header">
                                <div className="detail-title">{selectedProduct.name}</div>
                                <div className="detail-actions">
                                    <button className="action-btn">Share</button>
                                    <button className="action-btn primary" onClick={() => alert("Proceeding")}>
                                        Book Now - ${selectedProduct.price}
                                    </button>
                                </div>
                            </div>

                            <div className="detail-content">

                                <div className="content-section">
                                    <div className="section-label">Availability</div>
                                    <div className="calendar-wrapper">
                                        <Calendar
                                            value={date}
                                            onChange={(e) => setDate(e.value as Date)}
                                            inline
                                            showWeek
                                            style={{ width: '100%', border: 'none' }}
                                        />
                                    </div>
                                </div>

                                <div className="content-section">
                                    <div className="section-label">Configuration</div>
                                    <div className="info-card">
                                        <div className="form-row">
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px' }}>Headline</label>
                                                <input className="form-input" placeholder="Ad Headline" />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px' }}>Link</label>
                                                <input className="form-input" placeholder="https://..." />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="content-section">
                                    <div className="section-label">Sponsorship Details</div>
                                    <p style={{ lineHeight: '1.6', color: '#444' }}>
                                        This package includes a prominent placement in our upcoming newsletter issue.
                                        You will get logo placement, 150 words of copy, and a button CTA.
                                        Average click-through rates for this slot are around 3.5%.
                                    </p>
                                </div>

                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
