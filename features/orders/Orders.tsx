"use client";

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

type OrdersProps = {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
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
      <h2>Order Management</h2>

      {orderSections.map((section) => {
        const sectionOrders = orders.filter((order) => order.status === section);

        return (
          <section key={section} style={{ marginTop: "24px" }}>
            <h3>{section} Orders ({sectionOrders.length})</h3>

            {sectionOrders.length === 0 ? (
              <p style={{ color: "#555" }}>No {section.toLowerCase()} orders yet.</p>
            ) : (
              <div style={{ display: "grid", gap: "12px", marginTop: "12px" }}>
                {sectionOrders.map((order) => {
                  const action = statusSteps[order.status];

                  return (
                    <div key={order.id} style={{ border: "1px solid #ddd", padding: "12px", borderRadius: "8px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                        <div>
                          <p><strong>Customer:</strong> {order.customer}</p>
                          <p><strong>Product:</strong> {order.product}</p>
                          <p><strong>Quantity:</strong> {order.quantity}</p>
                        </div>
                        <div>
                          <p><strong>Price:</strong> ${order.price}</p>
                          <p><strong>Lead Time:</strong> {order.leadTime}</p>
                          <p><strong>Status:</strong> {order.status}</p>
                        </div>
                      </div>

                      {action.next && (
                        <button
                          style={{ marginTop: "12px" }}
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
