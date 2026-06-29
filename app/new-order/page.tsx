"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createOrder, type Order, type OrderRiskLevel, type OrderUnitOfMeasure } from "@/lib/services/orderService";
import { type PortalUser } from "@/lib/services/userService";

type FormState = {
  customer: string;
  branchPoNumber: string;
  customerPoNumber: string;
  shipToAddress: string;
  requestedDeliveryDate: string;
  partNumber: string;
  revision: string;
  productDescription: string;
  quantity: string;
  unitOfMeasure: OrderUnitOfMeasure | string;
  unitPrice: string;
  hoursPerUnit: string;
  workersAvailable: string;
  committedLeadTime: string;
};

const pageStyles = {
  background: "#f5f7fb",
  minHeight: "100vh",
  padding: "40px 20px",
  color: "#111827",
};

const containerStyles = {
  maxWidth: "960px",
  margin: "0 auto",
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

const buttonStyles = {
  background: "#2563eb",
  color: "#ffffff",
  border: "none",
  borderRadius: "14px",
  padding: "12px 22px",
  cursor: "pointer",
};

const unitOfMeasureOptions = ["EA", "FT", "M", "LB", "PK", "Other"];

export default function NewOrderPage() {
  const router = useRouter();
  const [user, setUser] = useState<PortalUser | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    customer: "",
    branchPoNumber: "",
    customerPoNumber: "",
    shipToAddress: "",
    requestedDeliveryDate: "",
    partNumber: "",
    revision: "REV A",
    productDescription: "",
    quantity: "100",
    unitOfMeasure: "EA",
    unitPrice: "25",
    hoursPerUnit: "4",
    workersAvailable: "2",
    committedLeadTime: "",
  });

  useEffect(() => {
    const storedUser = window.localStorage.getItem("quoteportal:activeUser");
    if (!storedUser) {
      router.replace("/");
      return;
    }

    const parsedUser = JSON.parse(storedUser) as PortalUser;
    if (parsedUser.role !== "Customer") {
      router.replace(parsedUser.role === "Admin" ? "/admin" : "/");
      return;
    }

    setUser(parsedUser);
    setForm((current) => ({ ...current, customer: parsedUser.companyName }));
  }, [router]);

  const extendedPrice = useMemo(() => {
    const quantity = Number.parseInt(form.quantity, 10);
    const unitPrice = Number.parseFloat(form.unitPrice);
    if (Number.isNaN(quantity) || Number.isNaN(unitPrice)) {
      return 0;
    }

    return quantity * unitPrice;
  }, [form.quantity, form.unitPrice]);

  const suggestedLeadTime = useMemo(() => {
    const quantity = Number.parseInt(form.quantity, 10);
    const hoursPerUnit = Number.parseInt(form.hoursPerUnit, 10);
    const workersAvailable = Number.parseInt(form.workersAvailable, 10);

    if ([quantity, hoursPerUnit, workersAvailable].some((value) => Number.isNaN(value) || value <= 0)) {
      return "8 Weeks";
    }

    const totalHours = quantity * hoursPerUnit;
    const weeklyCapacity = workersAvailable * 40 * 0.8;
    const laborWeeks = Math.max(1, Math.ceil(totalHours / weeklyCapacity));
    const businessBaseline = 8 + Math.min(3, Math.ceil(quantity / 300));
    const suggestedWeeks = Math.max(laborWeeks, businessBaseline);

    return `${suggestedWeeks} Weeks`;
  }, [form.quantity, form.hoursPerUnit, form.workersAvailable]);

  const riskLevel = useMemo<OrderRiskLevel>(() => {
    if (!form.requestedDeliveryDate) {
      return "Medium";
    }

    const requested = new Date(form.requestedDeliveryDate);
    const today = new Date();
    const diffDays = Math.ceil((requested.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const weeksAway = Math.max(1, Math.ceil(diffDays / 7));
    const suggestedWeeks = Number.parseInt(suggestedLeadTime, 10);

    if (weeksAway < suggestedWeeks - 2) {
      return "High";
    }

    if (weeksAway < suggestedWeeks) {
      return "Medium";
    }

    return "Low";
  }, [form.requestedDeliveryDate, suggestedLeadTime]);

  const riskMessage = useMemo(() => {
    if (riskLevel === "High") {
      return "Requested delivery is significantly earlier than the estimated production schedule.";
    }

    if (riskLevel === "Medium") {
      return "Requested delivery may require schedule adjustments.";
    }

    return "Requested delivery appears achievable.";
  }, [riskLevel]);

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
      return;
    }

    const quantity = Number.parseInt(form.quantity, 10);
    const unitPrice = Number.parseFloat(form.unitPrice);

    if (!form.branchPoNumber.trim() || !form.customerPoNumber.trim() || !form.partNumber.trim() || !form.productDescription.trim() || !form.shipToAddress.trim() || !form.requestedDeliveryDate) {
      setMessage("Please complete the required order fields.");
      return;
    }

    if (Number.isNaN(quantity) || quantity <= 0 || Number.isNaN(unitPrice) || unitPrice <= 0) {
      setMessage("Quantity and unit price must be positive numbers.");
      return;
    }

    const committedLeadTime = form.committedLeadTime.trim() || suggestedLeadTime;

    const order: Omit<Order, "id" | "createdAt"> = {
      customer: user.companyName,
      branchPoNumber: form.branchPoNumber.trim(),
      customerPoNumber: form.customerPoNumber.trim(),
      shipToAddress: form.shipToAddress.trim(),
      requestedDeliveryDate: form.requestedDeliveryDate,
      partNumber: form.partNumber.trim(),
      revision: form.revision.trim() || "REV A",
      productDescription: form.productDescription.trim(),
      quantity,
      unitOfMeasure: form.unitOfMeasure,
      unitPrice,
      extendedPrice: quantity * unitPrice,
      suggestedLeadTime,
      committedLeadTime,
      riskLevel,
      status: "Pending Plant Review",
    };

    createOrder(order);
    setMessage("Order created successfully and is now pending plant review.");
    setForm((current) => ({ ...current, branchPoNumber: "", customerPoNumber: "", shipToAddress: "", requestedDeliveryDate: "", partNumber: "", productDescription: "", quantity: "100", unitPrice: "25", committedLeadTime: "" }));
  };

  if (!user) {
    return null;
  }

  return (
    <main style={pageStyles}>
      <div style={containerStyles}>
        <div style={cardStyles}>
          <h1 style={{ fontSize: "2rem", marginBottom: "8px" }}>New Order</h1>
          <p style={{ color: "#6b7280", marginBottom: "24px" }}>Create a professional customer order with lead-time guidance and risk review.</p>

          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "18px" }}>
            <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
              <label style={labelStyles}>
                Customer Company
                <input value={form.customer} readOnly style={{ ...fieldStyles, background: "#f8fafc" }} />
              </label>
              <label style={labelStyles}>
                Branch PO Number
                <input value={form.branchPoNumber} onChange={(event) => handleChange("branchPoNumber", event.target.value)} style={fieldStyles} />
              </label>
            </div>

            <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
              <label style={labelStyles}>
                Customer PO Number
                <input value={form.customerPoNumber} onChange={(event) => handleChange("customerPoNumber", event.target.value)} style={fieldStyles} />
              </label>
              <label style={labelStyles}>
                Requested Delivery Date
                <input type="date" value={form.requestedDeliveryDate} onChange={(event) => handleChange("requestedDeliveryDate", event.target.value)} style={fieldStyles} />
              </label>
            </div>

            <label style={labelStyles}>
              Ship To Address
              <textarea value={form.shipToAddress} onChange={(event) => handleChange("shipToAddress", event.target.value)} style={{ ...fieldStyles, minHeight: "110px", resize: "vertical" }} />
            </label>

            <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
              <label style={labelStyles}>
                Part Number
                <input value={form.partNumber} onChange={(event) => handleChange("partNumber", event.target.value)} style={fieldStyles} />
              </label>
              <label style={labelStyles}>
                Revision
                <input value={form.revision} onChange={(event) => handleChange("revision", event.target.value)} style={fieldStyles} />
              </label>
            </div>

            <label style={labelStyles}>
              Product Description
              <input value={form.productDescription} onChange={(event) => handleChange("productDescription", event.target.value)} style={fieldStyles} />
            </label>

            <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
              <label style={labelStyles}>
                Quantity
                <input type="number" min="1" value={form.quantity} onChange={(event) => handleChange("quantity", event.target.value)} style={fieldStyles} />
              </label>
              <label style={labelStyles}>
                Unit of Measure
                <select value={form.unitOfMeasure} onChange={(event) => handleChange("unitOfMeasure", event.target.value)} style={fieldStyles}>
                  {unitOfMeasureOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </label>
            </div>

            <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
              <label style={labelStyles}>
                Unit Price
                <input type="number" min="0" step="0.01" value={form.unitPrice} onChange={(event) => handleChange("unitPrice", event.target.value)} style={fieldStyles} />
              </label>
              <div style={{ background: "#f8fafc", borderRadius: "18px", padding: "16px", border: "1px solid #e2e8f0", marginTop: "8px" }}>
                <p style={{ margin: "0 0 6px", color: "#6b7280" }}>Extended Price</p>
                <p style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "#111827" }}>${extendedPrice.toFixed(2)}</p>
              </div>
            </div>

            <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
              <label style={labelStyles}>
                Hours Per Unit
                <input type="number" min="1" value={form.hoursPerUnit} onChange={(event) => handleChange("hoursPerUnit", event.target.value)} style={fieldStyles} />
              </label>
              <label style={labelStyles}>
                Workers Available
                <input type="number" min="1" value={form.workersAvailable} onChange={(event) => handleChange("workersAvailable", event.target.value)} style={fieldStyles} />
              </label>
            </div>

            <div style={{ background: "#f8fafc", borderRadius: "18px", padding: "16px", border: "1px solid #e2e8f0" }}>
              <p style={{ margin: "0 0 8px", color: "#111827", fontWeight: 700 }}>Suggested Lead Time</p>
              <p style={{ margin: "0 0 6px", color: "#2563eb", fontWeight: 700 }}>{suggestedLeadTime}</p>
              <p style={{ margin: 0, color: "#6b7280" }}>Based on quantity, labor hours, available capacity, and current scheduling assumptions.</p>
            </div>

            <div style={{ background: "#f8fafc", borderRadius: "18px", padding: "16px", border: "1px solid #e2e8f0" }}>
              <p style={{ margin: "0 0 8px", color: "#111827", fontWeight: 700 }}>Requested Date Analysis</p>
              <p style={{ margin: 0, color: riskLevel === "High" ? "#b91c1c" : riskLevel === "Medium" ? "#d97706" : "#166534", fontWeight: 700 }}>{riskLevel} Risk</p>
              <p style={{ margin: "6px 0 0", color: "#6b7280" }}>{riskMessage}</p>
            </div>

            <label style={labelStyles}>
              Committed Lead Time
              <input value={form.committedLeadTime} onChange={(event) => handleChange("committedLeadTime", event.target.value)} placeholder={suggestedLeadTime} style={fieldStyles} />
            </label>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "8px" }}>
              <button type="submit" style={buttonStyles}>Create Order</button>
              <button type="button" style={{ ...buttonStyles, background: "#e2e8f0", color: "#111827" }} onClick={() => router.back()}>Cancel</button>
            </div>
            {message && <p style={{ color: "#2563eb", fontWeight: 600 }}>{message}</p>}
          </form>
        </div>
      </div>
    </main>
  );
}
