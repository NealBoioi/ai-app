"use client";

import { useMemo, useState } from "react";
import { ApprovedCustomer, Order } from "@/features/customers/customer-store";

type QuoteResult = {
  price: number;
  extendedPrice: number;
  validationWarnings: string[];
  suggestions: string[];
  needsReview: boolean;
  suggestedLeadTime: string;
  committedLeadTime: string;
  leadTimeExplanation: string;
  riskLevel: "Low" | "Medium" | "High";
  recommendations: string[];
  requestedDeliveryDate: string;
  requestedDateRisk?: string;
};

type QuoteBuilderProps = {
  approvedCustomers: ApprovedCustomer[];
  orders: Order[];
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

const unitOfMeasureOptions = ["EA", "FT", "M", "LB", "PK", "Other"];

export default function QuoteBuilder({ approvedCustomers, orders, onSaveOrder }: QuoteBuilderProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [branchPoNumber, setBranchPoNumber] = useState("");
  const [customerPoNumber, setCustomerPoNumber] = useState("");
  const [partNumber, setPartNumber] = useState("");
  const [revision, setRevision] = useState("REV A");
  const [productDescription, setProductDescription] = useState("");
  const [quantity, setQuantity] = useState("100");
  const [unitOfMeasure, setUnitOfMeasure] = useState("EA");
  const [unitPrice, setUnitPrice] = useState("25");
  const [shipToAddress, setShipToAddress] = useState("");
  const [hoursPerUnit, setHoursPerUnit] = useState("4");
  const [workersAvailable, setWorkersAvailable] = useState("2");
  const [requestedDeliveryDate, setRequestedDeliveryDate] = useState("");
  const [leadTimeInput, setLeadTimeInput] = useState("8 Weeks");
  const [quoteResult, setQuoteResult] = useState<QuoteResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedCustomer = approvedCustomers.find((customer) => customer.id === selectedCustomerId);

  const extendedPrice = useMemo(() => {
    const qty = Number.parseInt(quantity, 10);
    const price = Number.parseFloat(unitPrice);
    if (Number.isNaN(qty) || Number.isNaN(price) || qty <= 0) {
      return 0;
    }
    return qty * price;
  }, [quantity, unitPrice]);

  const duplicateOrderExists = (customerName: string, description: string, qty: number) => {
    return orders.some(
      (order) =>
        order.customer === customerName &&
        (order.productDescription || order.product).trim().toLowerCase() === description.trim().toLowerCase() &&
        order.quantity === qty
    );
  };

  const calculateSuggestedLeadTime = (qty: number, hours: number, workers: number) => {
    const totalHours = qty * hours;
    const utilizationRate = 0.8;
    const weeklyCapacity = Math.max(1, workers) * 40 * utilizationRate;
    const laborWeeks = Math.max(1, Math.ceil(totalHours / weeklyCapacity));
    const baselineWeeks = Math.min(11, Math.max(8, 8 + Math.min(3, Math.ceil(qty / 300))));
    const suggestedWeeks = Math.max(laborWeeks, baselineWeeks);

    return {
      suggestedWeeks,
      suggested: `${suggestedWeeks} Weeks`,
      laborEstimate: `${laborWeeks} Weeks`,
      baselineEstimate: `${baselineWeeks} Weeks`,
      explanation: `Based on ${qty} units, ${hours} hours per unit, ${workers} workers, and 80% utilization. Compared against the standard 8-11 week scheduling baseline.`,
    };
  };

  const evaluateRisk = (suggestedWeeks: number, requestedDate?: string) => {
    if (!requestedDate) {
      return {
        riskLevel: "Medium" as const,
        riskReason: "No requested delivery date was provided, so schedule risk should be reviewed manually.",
        recommendations: [
          "Confirm the requested delivery date with the customer.",
          "Review capacity and materials before commitment.",
        ],
      };
    }

    const requested = new Date(requestedDate);
    const today = new Date();
    const diffDays = Math.ceil((requested.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const requestedWeeks = Math.max(1, Math.ceil(diffDays / 7));

    if (requestedWeeks < suggestedWeeks - 2) {
      return {
        riskLevel: "High" as const,
        riskReason: `Requested delivery is ${requestedWeeks} weeks away, which is significantly earlier than the suggested ${suggestedWeeks} weeks.`,
        recommendations: [
          "Escalate to operations and planning.",
          "Split the shipment into phased deliveries if possible.",
          "Confirm material readiness and labor availability.",
        ],
      };
    }

    if (requestedWeeks < suggestedWeeks) {
      return {
        riskLevel: "Medium" as const,
        riskReason: `Requested delivery is ${requestedWeeks} weeks away, which is slightly earlier than the suggested ${suggestedWeeks} weeks.`,
        recommendations: [
          "Review the production plan closely.",
          "Validate material availability.",
          "Confirm the customer is aligned on the revised schedule.",
        ],
      };
    }

    return {
      riskLevel: "Low" as const,
      riskReason: `Requested delivery is ${requestedWeeks} weeks away, which provides a healthy cushion against the suggested ${suggestedWeeks} weeks.`,
      recommendations: [
        "Monitor order progress.",
        "Confirm release dates with operations.",
      ],
    };
  };

  const generateQuote = async () => {
    if (!selectedCustomer) {
      setError("Please select an approved customer.");
      return;
    }

    if (!branchPoNumber.trim() || !customerPoNumber.trim() || !partNumber.trim() || !productDescription.trim()) {
      setError("Please complete the customer, PO, part, and product description fields.");
      return;
    }

    if (!shipToAddress.trim() || !requestedDeliveryDate) {
      setError("Please provide a ship-to address and requested delivery date.");
      return;
    }

    const qty = parseInt(quantity, 10);
    if (Number.isNaN(qty) || qty <= 0) {
      setError("Quantity must be a positive number.");
      return;
    }

    const unitValue = parseFloat(unitPrice);
    if (Number.isNaN(unitValue) || unitValue <= 0) {
      setError("Unit price must be a positive number.");
      return;
    }

    if (selectedCustomer && duplicateOrderExists(selectedCustomer.companyName, productDescription, qty)) {
      setError(
        "A matching order already exists. Review the order list before creating another order for the same customer, product, and quantity."
      );
      return;
    }

    const hours = parseInt(hoursPerUnit, 10);
    const workers = parseInt(workersAvailable, 10);
    if (Number.isNaN(hours) || hours <= 0) {
      setError("Hours per unit must be a positive number.");
      return;
    }
    if (Number.isNaN(workers) || workers <= 0) {
      setError("Workers available must be a positive number.");
      return;
    }

    const suggestion = calculateSuggestedLeadTime(qty, hours, workers);
    setLeadTimeInput(suggestion.suggested);

    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: selectedCustomer.companyName,
          product: productDescription,
          quantity: qty,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        setQuoteResult(null);
        setError(data.message || "Unable to generate quote.");
        return;
      }

      const risk = evaluateRisk(suggestion.suggestedWeeks, requestedDeliveryDate);

      setQuoteResult({
        price: data.data.price,
        extendedPrice: qty * unitValue,
        validationWarnings: data.data.validationWarnings,
        suggestions: data.data.suggestions,
        needsReview: true,
        suggestedLeadTime: suggestion.suggested,
        committedLeadTime: suggestion.suggested,
        leadTimeExplanation: suggestion.explanation,
        riskLevel: risk.riskLevel,
        recommendations: risk.recommendations,
        requestedDeliveryDate: requestedDeliveryDate,
        requestedDateRisk: risk.riskReason,
      });
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred while generating the quote.");
      setQuoteResult(null);
    } finally {
      setLoading(false);
    }
  };

  const approveQuote = () => {
    if (!selectedCustomer || !quoteResult) {
      return;
    }

    const qty = parseInt(quantity, 10);
    const unitValue = parseFloat(unitPrice);
    const committedLeadTimeValue = leadTimeInput.trim() ? leadTimeInput : quoteResult.suggestedLeadTime;

    const order: Order = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      customer: selectedCustomer.companyName,
      branchPoNumber,
      customerPoNumber,
      shipToAddress,
      requestedDeliveryDate: quoteResult.requestedDeliveryDate,
      partNumber,
      revision,
      product: productDescription,
      productDescription,
      quantity: qty,
      unitOfMeasure,
      unitPrice: unitValue,
      extendedPrice: qty * unitValue,
      suggestedLeadTime: quoteResult.suggestedLeadTime,
      committedLeadTime: committedLeadTimeValue,
      riskLevel: quoteResult.riskLevel,
      status: "Pending Approval",
      createdAt: new Date().toISOString(),
      price: quoteResult.price,
      leadTime: committedLeadTimeValue,
    };

    onSaveOrder(order);
    setQuoteResult(null);
    setError(null);
  };

  const modifyInputs = () => {
    setQuoteResult(null);
  };

  return (
    <div style={cardStyles}>
      <h2 style={{ fontSize: "1.75rem", marginBottom: "18px" }}>Manufacturing Order Entry</h2>
      <p style={{ color: "#6b7280", marginTop: "-8px", marginBottom: "20px" }}>
        Build a realistic order entry record with pricing, lead-time review, and risk analysis before approval.
      </p>

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

        <div style={{ display: "grid", gap: "18px", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <label style={labelStyles}>
            Branch PO Number
            <input
              placeholder="Branch PO Number"
              value={branchPoNumber}
              onChange={(e) => setBranchPoNumber(e.target.value)}
              style={fieldStyles}
            />
          </label>

          <label style={labelStyles}>
            Customer PO Number
            <input
              placeholder="Customer PO Number"
              value={customerPoNumber}
              onChange={(e) => setCustomerPoNumber(e.target.value)}
              style={fieldStyles}
            />
          </label>
        </div>

        <div style={{ display: "grid", gap: "18px", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <label style={labelStyles}>
            Part Number
            <input
              placeholder="Part Number"
              value={partNumber}
              onChange={(e) => setPartNumber(e.target.value)}
              style={fieldStyles}
            />
          </label>

          <label style={labelStyles}>
            Revision
            <input
              placeholder="Revision"
              value={revision}
              onChange={(e) => setRevision(e.target.value)}
              style={fieldStyles}
            />
          </label>
        </div>

        <label style={labelStyles}>
          Product Description
          <input
            placeholder="Product Description"
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
            style={fieldStyles}
          />
        </label>

        <div style={{ display: "grid", gap: "18px", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
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

          <label style={labelStyles}>
            Unit of Measure
            <select value={unitOfMeasure} onChange={(e) => setUnitOfMeasure(e.target.value)} style={fieldStyles}>
              {unitOfMeasureOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div style={{ display: "grid", gap: "18px", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <label style={labelStyles}>
            Unit Price
            <input
              placeholder="Unit Price"
              type="number"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              style={fieldStyles}
              min={0}
              step="0.01"
            />
          </label>

          <div style={{ background: "#f8fafc", borderRadius: "18px", padding: "16px", border: "1px solid #e2e8f0", marginTop: "8px" }}>
            <p style={{ margin: "0 0 6px", color: "#6b7280", fontSize: "0.95rem" }}>Extended Price</p>
            <p style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "#111827" }}>
              ${extendedPrice.toFixed(2)}
            </p>
          </div>
        </div>

        <label style={labelStyles}>
          Ship To Address
          <textarea
            placeholder="Ship To Address"
            value={shipToAddress}
            onChange={(e) => setShipToAddress(e.target.value)}
            style={{ ...fieldStyles, minHeight: "110px", resize: "vertical" }}
          />
        </label>

        <label style={labelStyles}>
          Requested Delivery Date
          <input
            type="date"
            value={requestedDeliveryDate}
            onChange={(e) => setRequestedDeliveryDate(e.target.value)}
            style={fieldStyles}
          />
        </label>

        <div style={{ display: "grid", gap: "14px", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <label style={labelStyles}>
            Hours per unit
            <input
              placeholder="Hours per unit"
              type="number"
              value={hoursPerUnit}
              onChange={(e) => setHoursPerUnit(e.target.value)}
              style={fieldStyles}
              min={1}
            />
          </label>

          <label style={labelStyles}>
            Workers available
            <input
              placeholder="Workers available"
              type="number"
              value={workersAvailable}
              onChange={(e) => setWorkersAvailable(e.target.value)}
              style={fieldStyles}
              min={1}
            />
          </label>
        </div>

        <button onClick={generateQuote} disabled={loading} style={primaryButtonStyles}>
          {loading ? "Analyzing order entry..." : "Generate Quote Review"}
        </button>

        {error && (
          <div style={{ marginTop: "8px", color: "#b91c1c", fontWeight: 600 }}>{error}</div>
        )}
      </div>

      {quoteResult && (
        <div style={{ marginTop: "28px", background: "#f8fafc", borderRadius: "20px", padding: "22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "18px" }}>
            <h3 style={{ margin: 0 }}>Quote Review</h3>
            <span style={{ background: "#dbeafe", color: "#1d4ed8", borderRadius: "999px", padding: "8px 14px", fontWeight: 700 }}>
              Review before order creation
            </span>
          </div>

          <div style={{ display: "grid", gap: "12px", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", marginBottom: "18px" }}>
            <div style={{ background: "#ffffff", borderRadius: "16px", padding: "16px", border: "1px solid #e2e8f0" }}>
              <p style={{ margin: "0 0 6px", color: "#6b7280" }}>Price</p>
              <p style={{ margin: 0, fontWeight: 700, color: "#111827" }}>${quoteResult.price.toFixed(2)}</p>
            </div>
            <div style={{ background: "#ffffff", borderRadius: "16px", padding: "16px", border: "1px solid #e2e8f0" }}>
              <p style={{ margin: "0 0 6px", color: "#6b7280" }}>Extended Price</p>
              <p style={{ margin: 0, fontWeight: 700, color: "#111827" }}>${quoteResult.extendedPrice.toFixed(2)}</p>
            </div>
            <div style={{ background: "#ffffff", borderRadius: "16px", padding: "16px", border: "1px solid #e2e8f0" }}>
              <p style={{ margin: "0 0 6px", color: "#6b7280" }}>Suggested Lead Time</p>
              <p style={{ margin: 0, fontWeight: 700, color: "#111827" }}>{quoteResult.suggestedLeadTime}</p>
            </div>
            <div style={{ background: "#ffffff", borderRadius: "16px", padding: "16px", border: "1px solid #e2e8f0" }}>
              <p style={{ margin: "0 0 6px", color: "#6b7280" }}>Risk Level</p>
              <p style={{ margin: 0, fontWeight: 700, color: quoteResult.riskLevel === "High" ? "#b91c1c" : quoteResult.riskLevel === "Medium" ? "#d97706" : "#166534" }}>
                {quoteResult.riskLevel}
              </p>
            </div>
          </div>

          <div style={{ marginBottom: "18px", background: "#ffffff", borderRadius: "18px", padding: "18px", border: "1px solid #e2e8f0" }}>
            <p style={{ margin: "0 0 8px", color: "#111827", fontWeight: 700 }}>Committed Lead Time</p>
            <input
              value={leadTimeInput}
              onChange={(e) => setLeadTimeInput(e.target.value)}
              style={{ ...fieldStyles, marginTop: 0 }}
            />
            <p style={{ margin: "10px 0 0", color: "#475569", fontSize: "0.95rem" }}>{quoteResult.leadTimeExplanation}</p>
            {quoteResult.requestedDeliveryDate && (
              <p style={{ margin: "10px 0 0", color: "#7c3aed", fontSize: "0.95rem" }}>
                Requested Delivery Date: {new Date(quoteResult.requestedDeliveryDate).toLocaleDateString("en-US")}
              </p>
            )}
            {quoteResult.requestedDateRisk && (
              <p style={{ margin: "10px 0 0", color: quoteResult.riskLevel === "High" ? "#b91c1c" : "#475569", fontSize: "0.95rem" }}>
                {quoteResult.requestedDateRisk}
              </p>
            )}
          </div>

          {quoteResult.validationWarnings.length > 0 && (
            <div style={{ marginBottom: "18px", background: "#eff6ff", borderRadius: "18px", padding: "18px", border: "1px solid #bfdbfe" }}>
              <h4 style={{ marginBottom: "10px", color: "#1d4ed8" }}>Warnings</h4>
              <ul style={{ color: "#475569", paddingLeft: "20px" }}>
                {quoteResult.validationWarnings.map((warning, index) => (
                  <li key={`warning-${index}`}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          {quoteResult.suggestions.length > 0 && (
            <div style={{ marginBottom: "18px", background: "#eef2ff", borderRadius: "18px", padding: "18px", border: "1px solid #c7d2fe" }}>
              <h4 style={{ marginBottom: "10px", color: "#1d4ed8" }}>Suggestions</h4>
              <ul style={{ color: "#475569", paddingLeft: "20px" }}>
                {quoteResult.suggestions.map((suggestion, index) => (
                  <li key={`suggestion-${index}`}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}

          <div style={{ marginBottom: "18px", background: "#ecfdf5", borderRadius: "18px", padding: "18px", border: "1px solid #bbf7d0" }}>
            <h4 style={{ marginBottom: "10px", color: "#15803d" }}>Recommendations</h4>
            <ul style={{ color: "#166534", paddingLeft: "20px" }}>
              {quoteResult.recommendations.map((recommendation, index) => (
                <li key={`rec-${index}`}>{recommendation}</li>
              ))}
            </ul>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "20px" }}>
            <button type="button" onClick={approveQuote} style={primaryButtonStyles}>
              Approve Quote
            </button>
            <button
              type="button"
              onClick={modifyInputs}
              style={{
                ...primaryButtonStyles,
                background: "#e2e8f0",
                color: "#1f2937",
              }}
            >
              Modify Inputs
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
