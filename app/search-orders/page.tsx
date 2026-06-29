"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getOrdersForCustomer, type Order, type OrderStatus } from "@/lib/services/orderService";
import { type PortalUser } from "@/lib/services/userService";

const pageStyles = {
  background: "#f5f7fb",
  minHeight: "100vh",
  padding: "40px 20px",
  color: "#111827",
};

const containerStyles = {
  maxWidth: "1100px",
  margin: "0 auto",
};

const cardStyles = {
  background: "#ffffff",
  borderRadius: "24px",
  boxShadow: "0 20px 80px rgba(15, 23, 42, 0.08)",
  padding: "32px",
};

const fieldStyles = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "14px",
  border: "1px solid #d1d5db",
  outline: "none",
  color: "#111827",
};

const orderCardStyles = {
  background: "#f8fafc",
  borderRadius: "18px",
  padding: "20px",
  border: "1px solid #e2e8f0",
};

export default function SearchOrdersPage() {
  const router = useRouter();
  const [user, setUser] = useState<PortalUser | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "All">("All");
  const [sortOrder, setSortOrder] = useState<"Newest" | "Oldest">("Newest");

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
    setOrders(getOrdersForCustomer(parsedUser.companyName));
  }, [router]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...orders]
      .filter((order) => (statusFilter === "All" ? true : order.status === statusFilter))
      .filter((order) => {
        if (!query) {
          return true;
        }

        const haystack = [
          order.customer,
          order.branchPoNumber,
          order.customerPoNumber,
          order.partNumber,
          order.revision,
          order.productDescription,
        ]
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
  }, [orders, search, sortOrder, statusFilter]);

  if (!user) {
    return null;
  }

  return (
    <main style={pageStyles}>
      <div style={containerStyles}>
        <div style={cardStyles}>
          <h1 style={{ fontSize: "2rem", marginBottom: "8px" }}>Search Orders</h1>
          <p style={{ color: "#6b7280", marginBottom: "18px" }}>View your orders and monitor their current status.</p>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "20px" }}>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by customer, PO, part, or description" style={{ ...fieldStyles, minWidth: "260px", flex: 1 }} />
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as OrderStatus | "All")} style={fieldStyles}>
              <option value="All">All Statuses</option>
              <option value="Pending Plant Review">Pending Plant Review</option>
              <option value="Approved">Approved</option>
              <option value="In Production">In Production</option>
              <option value="Awaiting Shipment">Awaiting Shipment</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
            </select>
            <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value as "Newest" | "Oldest") } style={fieldStyles}>
              <option value="Newest">Newest first</option>
              <option value="Oldest">Oldest first</option>
            </select>
          </div>

          {filteredOrders.length === 0 ? (
            <p style={{ color: "#6b7280" }}>No orders found for your account.</p>
          ) : (
            <div style={{ display: "grid", gap: "16px" }}>
              {filteredOrders.map((order) => (
                <div key={order.id} style={orderCardStyles}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap" }}>
                    <div>
                      <p style={{ margin: "0 0 6px", fontWeight: 700 }}>{order.productDescription}</p>
                      <p style={{ margin: "0 0 6px", color: "#475569" }}><strong>Customer:</strong> {order.customer}</p>
                      <p style={{ margin: "0 0 6px", color: "#475569" }}><strong>Branch PO:</strong> {order.branchPoNumber}</p>
                      <p style={{ margin: 0, color: "#475569" }}><strong>Part Number:</strong> {order.partNumber}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ margin: 0, color: "#2563eb", fontWeight: 700 }}>{order.status}</p>
                      <p style={{ margin: "6px 0 0", color: "#475569" }}><strong>Committed Lead Time:</strong> {order.committedLeadTime}</p>
                      <p style={{ margin: "6px 0 0", color: "#475569" }}><strong>Extended Price:</strong> ${order.extendedPrice.toFixed(2)}</p>
                    </div>
                  </div>
                  <div style={{ marginTop: "14px", borderTop: "1px solid #e2e8f0", paddingTop: "12px", display: "grid", gap: "6px" }}>
                    <p style={{ margin: 0, color: "#475569" }}><strong>Customer PO:</strong> {order.customerPoNumber}</p>
                    <p style={{ margin: 0, color: "#475569" }}><strong>Revision:</strong> {order.revision}</p>
                    <p style={{ margin: 0, color: "#475569" }}><strong>Requested Delivery:</strong> {new Date(order.requestedDeliveryDate).toLocaleDateString("en-US")}</p>
                    <p style={{ margin: 0, color: "#475569" }}><strong>Ship To:</strong> {order.shipToAddress}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
