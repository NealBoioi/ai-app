"use client";

import { OrderStatus, Order } from "@/features/customers/customer-store";

type OrdersProps = {
  orders: Order[];
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

const buttonStyles = {
  background: "#2563eb",
  color: "#ffffff",
  border: "none",
  borderRadius: "14px",
  padding: "10px 18px",
  cursor: "pointer",
  transition: "background 0.2s ease",
};

const statusBadgeStyles: Record<OrderStatus, { background: string; color: string }> = {
  Open: { background: "#e2e8f0", color: "#374151" },
  Closed: { background: "#dbeafe", color: "#1d4ed8" },
  Shipped: { background: "#fef3c7", color: "#b45309" },
  Delivered: { background: "#dcfce7", color: "#166534" },
};

const statusSteps: Record<OrderStatus, { label: string; next?: OrderStatus }> = {
  Open: { label: "Close", next: "Closed" },
  Closed: { label: "Ship", next: "Shipped" },
  Shipped: { label: "Deliver", next: "Delivered" },
  Delivered: { label: "Delivered" },
};

const orderSections: OrderStatus[] = ["Open", "Closed", "Shipped", "Delivered"];

export default function Orders({ orders, onUpdateStatus }: OrdersProps) {
  return (
    <div>
      <h2 style={{ fontSize: "1.75rem", marginBottom: "16px" }}>Order Management</h2>

      {orderSections.map((section) => {
        const sectionOrders = orders.filter((order) => order.status === section);

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

                  return (
                    <div key={order.id} style={orderCardStyles}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
                        <div style={{ minWidth: "200px" }}>
                          <p style={{ margin: "0 0 6px", color: "#374151", fontWeight: 600 }}><strong>Customer:</strong> {order.customer}</p>
                          <p style={{ margin: "0 0 6px", color: "#475569" }}><strong>Product:</strong> {order.product}</p>
                          <p style={{ margin: 0, color: "#475569" }}><strong>Quantity:</strong> {order.quantity}</p>
                        </div>
                        <div style={{ display: "grid", gap: "6px", textAlign: "right" }}>
                          <span style={{ ...statusBadgeStyles[order.status], borderRadius: "999px", padding: "6px 12px", fontSize: "0.85rem", fontWeight: 700 }}>
                            {order.status}
                          </span>
                          <p style={{ margin: 0, color: "#475569" }}><strong>Price:</strong> ${order.price}</p>
                          <p style={{ margin: 0, color: "#475569" }}><strong>Lead Time:</strong> {order.leadTime}</p>
                        </div>
                      </div>

                      {action.next && (
                        <button
                          style={{ ...buttonStyles, marginTop: "16px" }}
                          onClick={() => onUpdateStatus(order.id, action.next!)}
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
