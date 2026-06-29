"use client";

import { useState } from "react";
import { ApprovedCustomer } from "@/features/customers/customer-store";

type OrderStatus = "Open" | "Closed" | "Shipped" | "Delivered";

type QuoteResult = {
  price: number;
  leadTime: string;
  validationWarnings: string[];
  suggestions: string[];
};

type Order = {
  id: string;
  customer: string;
  product: string;
  quantity: number;
  price: number;
  leadTime: string;
  status: OrderStatus;
};

type QuoteBuilderProps = {
  approvedCustomers: ApprovedCustomer[];
  onSaveOrder: (order: Order) => void;
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
    <div>
      <h2>Quote Builder</h2>

      <div style={{ marginTop: "20px" }}>
        <label style={{ display: "block", marginBottom: "10px" }}>
          Approved Customer
          <select
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            style={{ display: "block", width: "100%", marginTop: "8px" }}
          >
            <option value="">Select a customer</option>
            {approvedCustomers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.companyName}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: "block", marginBottom: "10px" }}>
          Product / Service
          <input
            placeholder="Product / Service"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            style={{ display: "block", width: "100%", marginTop: "8px" }}
          />
        </label>

        <label style={{ display: "block", marginBottom: "10px" }}>
          Quantity
          <input
            placeholder="Quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            style={{ display: "block", width: "100%", marginTop: "8px" }}
            min={1}
          />
        </label>

        <button onClick={generateQuote} disabled={loading}>
          {loading ? "Validating quote..." : "Generate Quote"}
        </button>

        {error && (
          <div style={{ marginTop: "16px", color: "#b00020" }}>
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>

      {result && (
        <div style={{ marginTop: "20px" }}>
          <h3>Quote Result</h3>
          <p><strong>Estimated Price:</strong> ${result.price}</p>
          <p><strong>Lead Time:</strong> {result.leadTime}</p>

          {result.validationWarnings.length > 0 && (
            <div style={{ marginTop: "16px" }}>
              <h4>Warnings</h4>
              <ul>
                {result.validationWarnings.map((warning, index) => (
                  <li key={`warning-${index}`}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          {result.suggestions.length > 0 && (
            <div style={{ marginTop: "16px" }}>
              <h4>Suggestions</h4>
              <ul>
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
