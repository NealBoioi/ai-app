"use client";

import { useEffect, useState } from "react";
import QuoteBuilder from "@/features/ai/quote/QuoteBuilder";
import Orders from "@/features/orders/Orders";
import { getApprovedCustomers, ApprovedCustomer } from "@/features/customers/customer-store";

type OrderStatus = "Open" | "Closed" | "Shipped" | "Delivered";

type Order = {
  id: string;
  customer: string;
  product: string;
  quantity: number;
  price: number;
  leadTime: string;
  status: OrderStatus;
};

const tabs = [
  { key: "Home", label: "Home" },
  { key: "Quotes", label: "Quotes" },
  { key: "Orders", label: "Orders" },
] as const;

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<typeof tabs[number]["key"]>("Home");
  const [approvedCustomers, setApprovedCustomers] = useState<ApprovedCustomer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    setApprovedCustomers(getApprovedCustomers());
  }, []);

  const handleAddOrder = (order: Order) => {
    setOrders((current) => [order, ...current]);
  };

  const handleUpdateStatus = (orderId: string, status: OrderStatus) => {
    setOrders((current) =>
      current.map((order) => (order.id === orderId ? { ...order, status } : order))
    );
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>QuoteFlow Dashboard</h1>

      <nav style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: "10px 18px",
              borderRadius: "8px",
              background: activeTab === tab.key ? "#111" : "#f0f0f0",
              color: activeTab === tab.key ? "#fff" : "#111",
              border: "none",
              cursor: "pointer",
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div style={{ marginTop: "32px" }}>
        {activeTab === "Home" && (
          <section>
            <h2>Welcome</h2>
            <p>
              Use the Quotes tab to build and validate quotes for approved customers. Track activity in Orders and manage status transitions through the order lifecycle.
            </p>
            <div style={{ display: "grid", gap: "14px", marginTop: "20px" }}>
              <div>
                <strong>Approved Customers:</strong> {approvedCustomers.length}
              </div>
              <div>
                <strong>Open Orders:</strong> {orders.filter((order) => order.status === "Open").length}
              </div>
              <div>
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
  );
}
