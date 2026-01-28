"use client";

import React, { useState, useEffect } from "react";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { FileUpload } from "primereact/fileupload";

// --- MOCK DATA ---
const PRODUCTS = [
  {
    id: "prod_1",
    name: "Primary Sponsorship",
    price: 45000, // cents
    description: "The main feature at the top of the newsletter. Includes logo, 150 words, and CTA.",
    type: "primary",
    features: ["Top placement", "Logo + Image", "150 words", "CTA Link"],
  },
  {
    id: "prod_2",
    name: "Secondary Ad",
    price: 25000,
    description: "A native ad unit in the middle of the content. Great for engagement.",
    type: "secondary",
    features: ["Middle placement", "100 words", "Text link"],
  },
  {
    id: "prod_3",
    name: "Classified Link",
    price: 8000,
    description: "A simple text link in our resources section.",
    type: "classified",
    features: ["Bottom placement", "1 sentence", "Link"],
  },
];

// --- STYLES (Injected) ---
const css = `
  /* RESET & UTILS */
  .booking-1-wrapper {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #1a1a1a;
    background: #f8f9fa;
    min-height: 100vh;
    padding: 40px 20px;
    box-sizing: border-box;
  }
  
  .booking-1-wrapper * {
    box-sizing: border-box;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    gap: 40px;
    align-items: flex-start;
  }

  /* LEFT CONTENT (65%) */
  .main-content {
    flex: 1;
    min-width: 0; /* Prevent overflow */
  }

  .header-section {
    margin-bottom: 40px;
  }

  .title {
    font-size: 32px;
    font-weight: 700;
    margin: 0 0 12px 0;
    letter-spacing: -0.5px;
  }

  .subtitle {
    font-size: 18px;
    color: #666;
    margin: 0;
    line-height: 1.5;
  }

  .section-card {
    background: #fff;
    border-radius: 16px;
    padding: 32px;
    margin-bottom: 24px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.04);
    border: 1px solid rgba(0,0,0,0.04);
    transition: box-shadow 0.2s ease;
  }
  
  .section-card:hover {
    box-shadow: 0 4px 20px rgba(0,0,0,0.06);
  }

  .section-title {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .step-number {
    background: #1a1a1a;
    color: #fff;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 600;
  }

  /* PRODUCT CARDS */
  .product-grid {
    display: grid;
    gap: 16px;
  }

  .product-item {
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    padding: 24px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .product-item:hover {
    border-color: #d1d5db;
    background: #f9fafb;
  }

  .product-item.selected {
    border-color: #1a1a1a;
    background: #fff;
    box-shadow: 0 0 0 4px rgba(0,0,0,0.05);
  }

  .prod-info h3 {
    margin: 0 0 4px 0;
    font-size: 18px;
    font-weight: 600;
  }

  .prod-desc {
    font-size: 14px;
    color: #666;
    margin: 0;
    max-width: 400px;
  }

  .prod-price {
    font-weight: 600;
    font-size: 18px;
  }

  /* CALENDAR OVERRIDE */
  .custom-calendar {
    width: 100%;
    border: none !important;
  }
  .custom-calendar .p-datepicker {
    width: 100%;
    border: none;
    padding: 0;
  }
  .custom-calendar .p-datepicker td > span {
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
  }
  .custom-calendar .p-datepicker td > span.p-highlight {
    background: #1a1a1a !important;
    color: #fff !important;
  }

  /* FORM FIELDS */
  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .form-group.full-width {
    grid-column: 1 / -1;
  }

  .label {
    font-size: 14px;
    font-weight: 500;
    color: #374151;
  }

  .input-field {
    padding: 12px;
    border-radius: 8px;
    border: 1px solid #d1d5db;
    font-size: 15px;
  }
  
  .input-field:focus {
    border-color: #1a1a1a;
    outline: none;
  }

  /* RIGHT SIDEBAR (35%) */
  .summary-sidebar {
    width: 380px;
    position: sticky;
    top: 40px;
  }

  .summary-card {
    background: #fff;
    border-radius: 16px;
    padding: 32px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.06);
    border: 1px solid #f3f4f6;
  }

  .summary-title {
    font-size: 20px;
    font-weight: 700;
    margin: 0 0 24px 0;
    padding-bottom: 16px;
    border-bottom: 2px solid #f3f4f6;
  }

  .summary-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
    color: #4b5563;
    font-size: 15px;
  }

  .summary-row.total {
    margin-top: 24px;
    padding-top: 24px;
    border-top: 2px solid #f3f4f6;
    font-weight: 700;
    font-size: 20px;
    color: #1a1a1a;
  }

  .empty-state-text {
    color: #9ca3af;
    font-style: italic;
  }

  .trust-badges {
    margin-top: 24px;
    display: flex;
    gap: 12px;
    justify-content: center;
    color: #9ca3af;
    font-size: 13px;
  }

  /* PREVIEW CARD */
  .preview-card {
    background: #fff;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.06);
    border: 1px solid #f3f4f6;
    margin-bottom: 24px;
  }
  
  .preview-header {
    font-size: 14px;
    font-weight: 600;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 16px;
  }

  /* Mock Newsletter Context */
  .mock-newsletter-item {
    font-family: serif; /* Differentiates from UI */
    border: 1px dashed #e5e7eb;
    padding: 16px;
    background: #fafafa;
    border-radius: 8px;
  }

  .preview-headline {
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 8px;
    color: #1a1a1a;
  }

  .preview-body {
    font-size: 15px;
    line-height: 1.5;
    color: #4b5563;
    margin-bottom: 12px;
  }

  .preview-link {
    color: #2563eb;
    text-decoration: underline;
    font-size: 14px;
    word-break: break-all;
  }
  
  .preview-placeholder {
    color: #9ca3af;
    font-style: italic;
    font-size: 14px;
    text-align: center;
    padding: 20px;
  }

  /* BUTTONS */
  .btn-primary {
    width: 100%;
    background: #1a1a1a;
    color: #fff;
    padding: 16px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 16px;
    border: none;
    cursor: pointer;
    transition: transform 0.1s ease;
  }
  
  .btn-primary:hover {
    background: #000;
    transform: translateY(-1px);
  }
  
  .btn-primary:active {
    transform: translateY(0);
  }

  .btn-primary:disabled {
    background: #e5e7eb;
    color: #9ca3af;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 900px) {
    .container {
      flex-direction: column;
    }
    .summary-sidebar {
      width: 100%;
      position: relative;
      top: 0;
    }
  }
`;

export default function BookingPageOne() {
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [date, setDate] = useState<Date | null>(null);
  const [formData, setFormData] = useState({
    headline: "",
    link: "",
    body: "",
  });

  const totalPrice = selectedProduct ? selectedProduct.price : 0;
  const taxes = totalPrice * 0.05; // mock 5% tax

  return (
    <>
      <style>{css}</style>
      <div className="booking-1-wrapper">
        <div className="container">
          {/* LEFT CONTENT */}
          <div className="main-content">
            <div className="header-section">
              <h1 className="title">Book your sponsorship</h1>
              <p className="subtitle">High-impact placement for your brand. Simple, transparent pricing.</p>
            </div>

            {/* Step 1: Product */}
            <div className="section-card">
              <div className="section-title">
                <span className="step-number">1</span>
                Select Ad Format
              </div>
              <div className="product-grid">
                {PRODUCTS.map((prod) => (
                  <div
                    key={prod.id}
                    className={`product-item ${selectedProduct?.id === prod.id ? "selected" : ""}`}
                    onClick={() => setSelectedProduct(prod)}
                  >
                    <div className="prod-info">
                      <h3>{prod.name}</h3>
                      <p className="prod-desc">{prod.description}</p>
                    </div>
                    <div className="prod-price">${prod.price / 100}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 2: Date */}
            <div className="section-card">
              <div className="section-title">
                <span className="step-number">2</span>
                Choose Date
              </div>
              <div style={{ pointerEvents: !selectedProduct ? "none" : "auto", opacity: !selectedProduct ? 0.5 : 1 }}>
                <Calendar
                  value={date}
                  onChange={(e) => setDate(e.value as Date)}
                  inline
                  showWeek
                  className="custom-calendar"
                  disabled={!selectedProduct}
                />
              </div>
            </div>

            {/* Step 3: Creative */}
            <div className="section-card">
              <div className="section-title">
                <span className="step-number">3</span>
                Creative Details
              </div>
              <div className="form-grid" style={{ pointerEvents: !date ? "none" : "auto", opacity: !date ? 0.5 : 1 }}>
                <div className="form-group full-width">
                  <label className="label">Headline</label>
                  <InputText
                    className="input-field"
                    placeholder="e.g. The best tool for developers"
                    value={formData.headline}
                    onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  />
                </div>
                <div className="form-group full-width">
                  <label className="label">Destination Link</label>
                  <InputText
                    className="input-field"
                    placeholder="https://"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  />
                </div>
                <div className="form-group full-width">
                  <label className="label">Body Text</label>
                  <InputTextarea
                    className="input-field"
                    rows={4}
                    placeholder="Describe your product..."
                    value={formData.body}
                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  />
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT SIDEBAR */}
          <div className="summary-sidebar">

            {/* PREVIEW CARD (Moved to top) */}
            {selectedProduct && (
              <div className="preview-card">
                <div className="preview-header">Ad Preview</div>
                <div className="mock-newsletter-item">
                  {formData.headline || formData.body ? (
                    <>
                      <div className="preview-headline">
                        {formData.headline || <span style={{ opacity: 0.3 }}>Your Headline Here</span>}
                      </div>
                      <div className="preview-body">
                        {formData.body || <span style={{ opacity: 0.3 }}>Your ad copy will appear here. It mimics the style of the newsletter.</span>}
                      </div>
                      {formData.link && (
                        <div className="preview-link">{formData.link}</div>
                      )}
                    </>
                  ) : (
                    <div className="preview-placeholder">
                      Start typing in Step 3 to see your ad preview...
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="summary-card">
              <div className="summary-title">Order Summary</div>

              <div className="summary-row">
                <span>Product</span>
                <span>{selectedProduct ? selectedProduct.name : <span className="empty-state-text">--</span>}</span>
              </div>

              <div className="summary-row">
                <span>Date</span>
                <span>{date ? date.toLocaleDateString() : <span className="empty-state-text">--</span>}</span>
              </div>

              <div className="summary-row">
                <span>Price</span>
                <span>{selectedProduct ? `$${(selectedProduct.price / 100).toFixed(2)}` : "--"}</span>
              </div>

              <div className="summary-row">
                <span>Fees (5%)</span>
                <span>{selectedProduct ? `$${(taxes / 100).toFixed(2)}` : "--"}</span>
              </div>

              <div className="summary-row total">
                <span>Total</span>
                <span>{selectedProduct ? `$${((totalPrice + taxes) / 100).toFixed(2)}` : "--"}</span>
              </div>

              <div style={{ marginTop: '32px' }}>
                <button
                  className="btn-primary"
                  disabled={!selectedProduct || !date || !formData.headline}
                >
                  Pay & Book
                </button>
              </div>

              <div className="trust-badges">
                <span>🔒 Secure Checkout</span>
                <span>⚡ Instant Confirmation</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
