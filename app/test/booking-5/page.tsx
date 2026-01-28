"use client";

import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Calendar } from "primereact/calendar";

// --- MOCK DATA ---
const PRODUCTS = [
    {
        id: "prod_1",
        name: "Standard",
        price: 150,
        features: ["Text only", "Bottom placement", "14 day run"],
        highlight: false,
        color: "#64748b"
    },
    {
        id: "prod_2",
        name: "Premium",
        price: 350,
        features: ["Logo + Text", "Middle placement", "30 day run", "Analytics"],
        highlight: true,
        color: "#4f46e5"
    },
    {
        id: "prod_3",
        name: "Exclusive",
        price: 750,
        features: ["Top Banner", "Dedicated email", "Social shoutout", "Priority Support"],
        highlight: false,
        color: "#0f172a"
    }
];

// --- STYLES ---
const css = `
  .booking-5-wrapper {
    font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif;
    background: #f8fafc;
    min-height: 100vh;
    padding: 80px 20px;
    color: #0f172a;
  }

  .pricing-header {
    text-align: center;
    margin-bottom: 60px;
  }

  .pricing-title {
    font-size: 42px;
    font-weight: 800;
    margin: 0;
    background: linear-gradient(to right, #0f172a, #4f46e5);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  .pricing-subtitle {
    margin-top: 16px;
    font-size: 18px;
    color: #64748b;
  }

  .pricing-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 32px;
    max-width: 1100px;
    margin: 0 auto;
    align-items: center; /* helps with varying heights */
  }

  .pricing-card {
    background: #fff;
    border-radius: 24px;
    padding: 32px;
    position: relative;
    border: 1px solid #e2e8f0;
    transition: all 0.3s ease;
  }

  .pricing-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1);
  }

  .pricing-card.featured {
    border: 2px solid #4f46e5;
    box-shadow: 0 10px 30px -5px rgba(79, 70, 229, 0.15);
    transform: scale(1.05); /* Slightly bigger */
    z-index: 2;
  }
  
  .pricing-card.featured:hover {
    transform: scale(1.05) translateY(-8px);
    box-shadow: 0 25px 50px -12px rgba(79, 70, 229, 0.25);
  }

  .badge {
    position: absolute;
    top: -12px;
    left: 50%;
    transform: translateX(-50%);
    background: #4f46e5;
    color: #fff;
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .card-name {
    font-size: 18px;
    font-weight: 600;
    color: #64748b;
    margin-bottom: 8px;
  }

  .card-price {
    font-size: 48px;
    font-weight: 800;
    margin-bottom: 24px;
  }
  
  .card-price span {
    font-size: 16px;
    font-weight: 500;
    color: #94a3b8;
  }

  .feature-list {
    margin-bottom: 32px;
    list-style: none;
    padding: 0;
  }

  .feature-item {
    padding: 8px 0;
    display: flex;
    align-items: center;
    gap: 12px;
    color: #334155;
    font-size: 15px;
  }

  .check-icon {
    color: #4f46e5;
    font-weight: bold;
  }

  .btn-select {
    width: 100%;
    padding: 16px;
    border-radius: 12px;
    font-weight: 600;
    font-size: 16px;
    cursor: pointer;
    border: none;
    transition: all 0.2s;
  }

  .btn-select.primary {
    background: #4f46e5;
    color: #fff;
    box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.3);
  }
  
  .btn-select.primary:hover {
    background: #4338ca;
  }

  .btn-select.secondary {
    background: #f1f5f9;
    color: #0f172a;
  }

  .btn-select.secondary:hover {
    background: #e2e8f0;
  }

  /* MODAL OVERRIDES */
  .modal-wrapper {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0;
    border-radius: 12px;
    overflow: hidden;
  }

  .modal-left {
    background: #f8fafc;
    padding: 32px;
    border-right: 1px solid #e2e8f0;
  }

  .modal-right {
    padding: 32px;
  }
  
  @media (max-width: 768px) {
    .modal-wrapper { grid-template-columns: 1fr; }
    .modal-left { display: none; }
  }

  .input-field {
    width: 100%;
    padding: 12px;
    margin-bottom: 16px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
  }
`;

export default function BookingPageFive() {
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [date, setDate] = useState<Date | null>(null);

    const handleSelect = (prod: any) => {
        setSelectedProduct(prod);
        setModalVisible(true);
    };

    return (
        <>
            <style>{css}</style>
            <div className="booking-5-wrapper">
                <div className="pricing-header">
                    <h1 className="pricing-title">Simple, transparent pricing</h1>
                    <p className="pricing-subtitle">Reach 50,000+ targeted developers in our next issue.</p>
                </div>

                <div className="pricing-grid">
                    {PRODUCTS.map(prod => (
                        <div key={prod.id} className={`pricing-card ${prod.highlight ? 'featured' : ''}`}>
                            {prod.highlight && <div className="badge">Most Popular</div>}
                            <div className="card-name">{prod.name}</div>
                            <div className="card-price">${prod.price}<span>/issue</span></div>

                            <ul className="feature-list">
                                {prod.features.map(f => (
                                    <li key={f} className="feature-item">
                                        <span className="check-icon">✓</span> {f}
                                    </li>
                                ))}
                            </ul>

                            <button
                                className={`btn-select ${prod.highlight ? 'primary' : 'secondary'}`}
                                onClick={() => handleSelect(prod)}
                            >
                                Book {prod.name}
                            </button>
                        </div>
                    ))}
                </div>

                {/* CHECKOUT MODAL */}
                <Dialog
                    visible={modalVisible}
                    onHide={() => setModalVisible(false)}
                    header={`Book ${selectedProduct?.name} Plan`}
                    style={{ width: '900px', maxWidth: '95vw' }}
                    contentStyle={{ padding: 0 }}
                >
                    <div className="modal-wrapper">
                        <div className="modal-left">
                            <h3 style={{ marginBottom: '20px' }}>Select a Date</h3>
                            <Calendar
                                value={date}
                                onChange={(e) => setDate(e.value as Date)}
                                inline
                                className="w-full"
                                style={{ border: 'none' }}
                            />
                        </div>
                        <div className="modal-right">
                            <h3 style={{ marginBottom: '20px' }}>Campaign Details</h3>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>Headline</label>
                            <input className="input-field" placeholder="Ad Headline" />

                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>Target Link</label>
                            <input className="input-field" placeholder="https://" />

                            <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #eee' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontWeight: '700', fontSize: '18px' }}>
                                    <span>Total</span>
                                    <span>${selectedProduct?.price}</span>
                                </div>
                                <button
                                    className="btn-select primary"
                                    onClick={() => alert("Success")}
                                >
                                    Checkout
                                </button>
                            </div>
                        </div>
                    </div>
                </Dialog>

            </div>
        </>
    );
}
