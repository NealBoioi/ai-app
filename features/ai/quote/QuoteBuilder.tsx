"use client";

import { useState } from "react";
import { ApprovedCustomer, Order } from "@/features/customers/customer-store";

type QuoteResult = {
  price: number;
  leadTime: string;
  validationWarnings: string[];
  suggestions: string[];
};

type QuoteBuilderProps = {
  approvedCustomers: ApprovedCustomer[];
  onSaveOrder: (order: Order) => void;
};

const cardStyles = {
  background: "#ffffff",
  borderRadius: "24px",
  boxShadow: "0 20px 80px rgba(15, 23, 42, 0.08)",
  padding: "32px",
};

const labelStyles = {
  display: "block",
  marginBottom: "6px",
  color: "#374151",
  fontWeight: 600,
};

const fieldStyles = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "14px",
  border: "1px solid #d1d5db",
  marginTop: "8px",
  outline: "none",
  fontSize: "1rem",
  color: "#111827",
};

const primaryButtonStyles = {
  background: "#2563eb",
  color: "#ffffff",
  border: "none",
  borderRadius: "14px",
  padding: "12px 22px",
  cursor: "pointer",
  transition: "background 0.2s ease",
};

export default function QuoteBuilder({ approvedCustomers, onSaveOrder }: QuoteBuilderProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [product, setProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [result, setResult] = useState<null | QuoteResult>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedCustomer = approvedCustomers.find((customer) => customer.id === selectedCustomerId);

  const generateQuote = async () => {
    if (!selectedCustomer) {
      setError("Please select an approved customer.");
      return;
    }

    if (!product.trim() || !quantity.trim()) {
      setError("Please provide a product and a valid quantity.");
      return;
    }

    const qty = parseInt(quantity, 10);
    if (Number.isNaN(qty) || qty <= 0) {
      setError("Quantity must be a positive number.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: selectedCustomer.companyName,
          product,
          quantity: qty,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        setResult(null);
        setError(data.message || "Unable to generate quote.");
        return;
      }

      setResult(data.data);

      const order: Order = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        customer: selectedCustomer.companyName,
        product,
        quantity: qty,
        price: data.data.price,
        leadTime: data.data.leadTime,
        status: "Open",
      };

      onSaveOrder(order);
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred while generating the quote.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={cardStyles}>
      <h2 style={{ fontSize: "1.75rem", marginBottom: "18px" }}>Quote Builder</h2>

      <div style={{ display: "grid", gap: "18px" }}>
        <label style={labelStyles}>
          Approved Customer
          <select
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            style={fieldStyles}
          >
            <option value="">Select a customer</option>
            {approvedCustomers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.companyName}
              </option>
            ))}
          </select>
        </label>

        <label style={labelStyles}>
          Product / Service
          <input
            placeholder="Product / Service"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            style={fieldStyles}
          />
        </label>

        <label style={labelStyles}>
          Quantity
          <input
            placeholder="Quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            style={fieldStyles}
            min={1}
          />
        </label>

        <button onClick={generateQuote} disabled={loading} style={primaryButtonStyles}>
          {loading ? "Validating quote..." : "Generate Quote"}
        </button>

        {error && (
          <div style={{ marginTop: "8px", color: "#b91c1c", fontWeight: 600 }}>{error}</div>
        )}
      </div>

      {result && (
        <div style={{ marginTop: "28px", background: "#f8fafc", borderRadius: "20px", padding: "22px" }}>
          <h3 style={{ marginBottom: "14px" }}>Quote Result</h3>
          <p style={{ color: "#111827", marginBottom: "8px" }}><strong>Estimated Price:</strong> ${result.price}</p>
          <p style={{ color: "#111827", marginBottom: "18px" }}><strong>Lead Time:</strong> {result.leadTime}</p>

          {result.validationWarnings.length > 0 && (
            <div style={{ marginBottom: "18px" }}>
              <h4 style={{ marginBottom: "10px", color: "#1d4ed8" }}>Warnings</h4>
              <ul style={{ color: "#475569", paddingLeft: "20px" }}>
                {result.validationWarnings.map((warning, index) => (
                  <li key={`warning-${index}`}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          {result.suggestions.length > 0 && (
            <div>
              <h4 style={{ marginBottom: "10px", color: "#1d4ed8" }}>Suggestions</h4>
              <ul style={{ color: "#475569", paddingLeft: "20px" }}>
                {result.suggestions.map((suggestion, index) => (
                  <li key={`suggestion-${index}`}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
