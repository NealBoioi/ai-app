"use client";

import { useEffect, useState } from "react";
import QuoteBuilder from "@/features/ai/quote/QuoteBuilder";
import Orders from "@/features/orders/Orders";
import { loadCustomers, loadOrders, saveOrders, ApprovedCustomer, Order, OrderStatus } from "@/features/customers/customer-store";

const pageStyles = {
  background: "#f5f7fb",
  minHeight: "100vh",
  padding: "40px 20px",
  color: "#111827",
};

const containerStyles = {
  maxWidth: "900px",
  margin: "0 auto",
};

const headerCardStyles = {
  background: "#ffffff",
  borderRadius: "24px",
  boxShadow: "0 20px 80px rgba(15, 23, 42, 0.08)",
  padding: "32px",
};

const navButtonStyles = (active: boolean) => ({
  padding: "12px 20px",
  borderRadius: "14px",
  background: active ? "#e0f2fe" : "#ffffff",
  color: active ? "#1d4ed8" : "#475569",
  border: "1px solid #cbd5e1",
  cursor: "pointer",
  transition: "background 0.2s ease, color 0.2s ease",
});

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"Home" | "Quotes" | "Orders">("Home");
  const [approvedCustomers, setApprovedCustomers] = useState<ApprovedCustomer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    setApprovedCustomers(loadCustomers());
    setOrders(loadOrders());
  }, []);

  const handleAddOrder = (order: Order) => {
    setOrders((current) => {
      const nextOrders = [order, ...current];
      saveOrders(nextOrders);
      return nextOrders;
    });
  };

  const handleUpdateStatus = (orderId: string, status: OrderStatus) => {
    setOrders((current) => {
      const nextOrders = current.map((order) => (order.id === orderId ? { ...order, status } : order));
      saveOrders(nextOrders);
      return nextOrders;
    });
  };

  return (
    <main style={pageStyles}>
      <div style={containerStyles}>
        <div style={headerCardStyles}>
          <h1 style={{ fontSize: "2.5rem", marginBottom: "12px" }}>QuoteFlow Dashboard</h1>
          <p style={{ color: "#6b7280", lineHeight: 1.75 }}>
            Manage approved customers, generate validated quotes, and move orders through an end-to-end lifecycle. Your data persists automatically between sessions.
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "24px" }}>
          {[
            { key: "Home", label: "Home" },
            { key: "Quotes", label: "Quotes" },
            { key: "Orders", label: "Orders" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as "Home" | "Quotes" | "Orders")}
              style={navButtonStyles(tab.key === activeTab)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ marginTop: "32px" }}>
          {activeTab === "Home" && (
            <section style={{ ...headerCardStyles, padding: "28px" }}>
              <h2 style={{ fontSize: "1.75rem", marginBottom: "12px" }}>Welcome</h2>
              <p style={{ color: "#6b7280", lineHeight: 1.75 }}>
                Use the Quotes tab to build and validate quotes for approved customers. Track activity in Orders and manage status transitions through the order lifecycle.
              </p>

              <div style={{ display: "grid", gap: "16px", marginTop: "24px" }}>
                <div style={{ background: "#f8fafc", borderRadius: "20px", padding: "18px", border: "1px solid #e2e8f0" }}>
                  <strong>Approved Customers:</strong> {approvedCustomers.length}
                </div>
                <div style={{ background: "#f8fafc", borderRadius: "20px", padding: "18px", border: "1px solid #e2e8f0" }}>
                  <strong>Open Orders:</strong> {orders.filter((order) => order.status === "Open").length}
                </div>
                <div style={{ background: "#f8fafc", borderRadius: "20px", padding: "18px", border: "1px solid #e2e8f0" }}>
                  <strong>Delivered Orders:</strong> {orders.filter((order) => order.status === "Delivered").length}
                </div>
              </div>
            </section>
          )}

          {activeTab === "Quotes" && (
            <QuoteBuilder approvedCustomers={approvedCustomers} onSaveOrder={handleAddOrder} />
          )}

          {activeTab === "Orders" && (
            <Orders orders={orders} onUpdateStatus={handleUpdateStatus} />
          )}
        </div>
      </div>
    </main>
  );
}
