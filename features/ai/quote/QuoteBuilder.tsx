"use client";

import { useState } from "react";

type QuoteResult = {
  price: number;
  leadTime: string;
  validationWarnings: string[];
  suggestions: string[];
};

export default function QuoteBuilder() {
  const [customer, setCustomer] = useState("");
  const [product, setProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [result, setResult] = useState<null | QuoteResult>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateQuote = async () => {
    if (!customer.trim() || !product.trim() || !quantity.trim()) {
      setError("Please fill all fields before generating a quote.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer, product, quantity }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setResult(null);
        setError(data.message || "Unable to generate quote.");
        return;
      }

      setResult(data.data);
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
        <input
          placeholder="Customer Name"
          value={customer}
          onChange={(e) => setCustomer(e.target.value)}
          style={{ display: "block", marginBottom: "10px" }}
        />

        <input
          placeholder="Product / Service"
          value={product}
          onChange={(e) => setProduct(e.target.value)}
          style={{ display: "block", marginBottom: "10px" }}
        />

        <input
          placeholder="Quantity"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          style={{ display: "block", marginBottom: "10px" }}
          min={1}
        />

        <button onClick={generateQuote} disabled={loading}>
          {loading ? "Validating..." : "Generate Quote"}
        </button>
      </div>

      {error && (
        <div style={{ marginTop: "20px", color: "#b00020" }}>
          <strong>Error:</strong> {error}
        </div>
      )}

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
