"use client";

import { useState } from "react";

export default function QuoteBuilder() {
  const [customer, setCustomer] = useState("");
  const [product, setProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [result, setResult] = useState<null | {
    price: number;
    leadTime: string;
  }>(null);

  const generateQuote = () => {
    const qty = parseInt(quantity);

    if (!customer || !product || !qty) {
      alert("Please fill all fields");
      return;
    }

    // Simple mock logic (we will replace with AI)
    const price = qty * 50;
    const leadTime = qty > 100 ? "2-3 weeks" : "5-7 days";

    setResult({ price, leadTime });
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
        />

        <button onClick={generateQuote}>
          Generate Quote
        </button>
      </div>

      {result && (
        <div style={{ marginTop: "20px" }}>
          <h3>Quote Result</h3>
          <p><strong>Estimated Price:</strong> ${result.price}</p>
          <p><strong>Lead Time:</strong> {result.leadTime}</p>
        </div>
      )}
    </div>
  );
}
