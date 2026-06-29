"use client";

import { useState, type CSSProperties } from "react";
import { OrderStatus, Order } from "@/features/customers/customer-store";

type Role = "Sales" | "Operations" | "Shipping" | "Admin";

type OrdersProps = {
  orders: Order[];
  role: Role;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
};

const sectionCardStyles = {
  background: "#ffffff",
  borderRadius: "24px",
  boxShadow: "0 16px 50px rgba(15, 23, 42, 0.08)",
  padding: "24px",
  marginTop: "20px",
};

const orderCardStyles = {
  background: "#f8fafc",
  borderRadius: "18px",
  padding: "20px",
  border: "1px solid #e2e8f0",
};

const filterRowStyles: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "12px",
  marginBottom: "20px",
  alignItems: "center",
};

const filterFieldStyles: CSSProperties = {
  padding: "12px 14px",
  borderRadius: "14px",
  border: "1px solid #d1d5db",
  background: "#ffffff",
  color: "#111827",
};

const buttonStyles = {
  background: "#2563eb",
  color: "#ffffff",
  border: "none",
  borderRadius: "14px",
  padding: "10px 18px",
  cursor: "pointer",
  transition: "background 0.2s ease",
};

const buttonDisabledStyles = {
  background: "#cbd5e1",
  color: "#64748b",
  cursor: "not-allowed",
};

const statusBadgeStyles: Record<OrderStatus, { background: string; color: string }> = {
  "Pending Approval": { background: "#f8fafc", color: "#0f172a" },
  Approved: { background: "#e0f2fe", color: "#1d4ed8" },
  "In Production": { background: "#fef3c7", color: "#b45309" },
  "Awaiting Shipment": { background: "#fee2e2", color: "#b91c1c" },
  Shipped: { background: "#d1fae5", color: "#166534" },
  Delivered: { background: "#dcfce7", color: "#166534" },
};

const statusSteps: Record<OrderStatus, { label: string; next?: OrderStatus }> = {
  "Pending Approval": { label: "Approve", next: "Approved" },
  Approved: { label: "Start Production", next: "In Production" },
  "In Production": { label: "Queue Shipment", next: "Awaiting Shipment" },
  "Awaiting Shipment": { label: "Ship", next: "Shipped" },
  Shipped: { label: "Deliver", next: "Delivered" },
  Delivered: { label: "Delivered" },
};

const orderSections: OrderStatus[] = ["Pending Approval", "Approved", "In Production", "Awaiting Shipment", "Shipped", "Delivered"];

export default function Orders({ orders, role, onUpdateStatus }: OrdersProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "All">("All");
  const [sortOrder, setSortOrder] = useState<"Newest" | "Oldest">("Newest");

  const filteredOrders = orders
    .filter((order) => {
      if (statusFilter !== "All" && order.status !== statusFilter) {
        return false;
      }

      const query = search.trim().toLowerCase();
      if (!query) {
        return true;
      }

      const haystack = [
        order.customer,
        order.branchPoNumber,
        order.customerPoNumber,
        order.partNumber,
        order.productDescription,
        order.product,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    })
    .sort((a, b) => {
      if (sortOrder === "Newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

  const canUpdate = (status: OrderStatus) => {
    if (role === "Admin") {
      return true;
    }
    if (role === "Sales") {
      return false;
    }
    if (role === "Operations") {
      return status === "Pending Approval" || status === "Approved";
    }
    if (role === "Shipping") {
      return status === "In Production" || status === "Awaiting Shipment" || status === "Shipped";
    }
    return false;
  };

  return (
    <div>
      <h2 style={{ fontSize: "1.75rem", marginBottom: "16px" }}>Order Management</h2>

      <div style={filterRowStyles}>
        <input
          type="search"
          placeholder="Search by customer, PO, part, or description"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          style={{ ...filterFieldStyles, flex: "1 1 240px" }}
        />

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as OrderStatus | "All")}
          style={filterFieldStyles}
        >
          <option value="All">All</option>
          <option value="Pending Approval">Pending Approval</option>
          <option value="Approved">Approved</option>
          <option value="In Production">In Production</option>
          <option value="Awaiting Shipment">Awaiting Shipment</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
        </select>

        <select
          value={sortOrder}
          onChange={(event) => setSortOrder(event.target.value as "Newest" | "Oldest")}
          style={filterFieldStyles}
        >
          <option value="Newest">Newest first</option>
          <option value="Oldest">Oldest first</option>
        </select>
      </div>

      {orderSections.map((section) => {
        const sectionOrders = filteredOrders.filter((order) => order.status === section);

        return (
          <section key={section} style={sectionCardStyles}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
              <h3 style={{ margin: 0 }}>{section} Orders ({sectionOrders.length})</h3>
            </div>

            {sectionOrders.length === 0 ? (
              <p style={{ color: "#6b7280", marginTop: "18px" }}>No {section.toLowerCase()} orders yet.</p>
            ) : (
              <div style={{ display: "grid", gap: "16px", marginTop: "18px" }}>
                {sectionOrders.map((order) => {
                  const action = statusSteps[order.status];
                  const disabled = !canUpdate(order.status);

                  return (
                    <div key={order.id} style={orderCardStyles}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
                        <div style={{ minWidth: "240px", flex: 1 }}>
                          <p style={{ margin: "0 0 6px", color: "#374151", fontWeight: 700 }}><strong>Customer:</strong> {order.customer}</p>
                          <p style={{ margin: "0 0 6px", color: "#475569" }}><strong>Branch PO:</strong> {order.branchPoNumber || "—"}</p>
                          <p style={{ margin: "0 0 6px", color: "#475569" }}><strong>Customer PO:</strong> {order.customerPoNumber || "—"}</p>
                          <p style={{ margin: "0 0 6px", color: "#475569" }}><strong>Part Number:</strong> {order.partNumber || "—"}</p>
                          <p style={{ margin: "0 0 6px", color: "#475569" }}><strong>Revision:</strong> {order.revision || "REV A"}</p>
                          <p style={{ margin: "0 0 6px", color: "#475569" }}><strong>Description:</strong> {order.productDescription || order.product || "—"}</p>
                        </div>
                        <div style={{ display: "grid", gap: "6px", textAlign: "right", minWidth: "220px" }}>
                          <span style={{ ...statusBadgeStyles[order.status], borderRadius: "999px", padding: "6px 12px", fontSize: "0.85rem", fontWeight: 700 }}>
                            {order.status}
                          </span>
                          <p style={{ margin: 0, color: "#475569" }}><strong>Quantity:</strong> {order.quantity}</p>
                          <p style={{ margin: 0, color: "#475569" }}><strong>UOM:</strong> {order.unitOfMeasure || "EA"}</p>
                          <p style={{ margin: 0, color: "#475569" }}><strong>Unit Price:</strong> ${order.unitPrice?.toFixed(2) || "0.00"}</p>
                          <p style={{ margin: 0, color: "#475569" }}><strong>Extended Price:</strong> ${order.extendedPrice?.toFixed(2) || "0.00"}</p>
                          <p style={{ margin: 0, color: "#475569" }}><strong>Requested Delivery:</strong> {order.requestedDeliveryDate ? new Date(order.requestedDeliveryDate).toLocaleDateString("en-US") : "—"}</p>
                          <p style={{ margin: 0, color: "#475569" }}><strong>Suggested Lead Time:</strong> {order.suggestedLeadTime || "—"}</p>
                          <p style={{ margin: 0, color: "#475569" }}><strong>Committed Lead Time:</strong> {order.committedLeadTime || "—"}</p>
                          <p style={{ margin: 0, color: "#475569" }}><strong>Risk Level:</strong> {order.riskLevel || "Medium"}</p>
                          <p style={{ margin: 0, color: "#475569" }}><strong>Created:</strong> {new Date(order.createdAt).toLocaleDateString("en-US")}</p>
                        </div>
                      </div>

                      <div style={{ marginTop: "14px", paddingTop: "14px", borderTop: "1px solid #e2e8f0" }}>
                        <p style={{ margin: "0 0 6px", color: "#475569" }}><strong>Ship To:</strong> {order.shipToAddress || "—"}</p>
                        <p style={{ margin: 0, color: "#475569" }}><strong>Status:</strong> {order.status}</p>
                      </div>

                      {action.next && (
                        <button
                          style={{ ...buttonStyles, ...(disabled ? buttonDisabledStyles : {}), marginTop: "16px" }}
                          onClick={() => !disabled && onUpdateStatus(order.id, action.next!)}
                          disabled={disabled}
                        >
                          {action.label}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
