"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import QuoteBuilder from "@/features/ai/quote/QuoteBuilder";
import Orders from "@/features/orders/Orders";
import {
  approvePendingCustomer,
  loadCustomers,
  loadOrders,
  loadPendingCustomers,
  loadRejectedCustomers,
  rejectPendingCustomer,
  saveOrders,
  type ApprovedCustomer,
  type Order,
  type OrderStatus,
  type PendingCustomer,
  type RejectedCustomer,
} from "@/features/customers/customer-store";
import { approveAccessRequest, getAccessRequests, rejectAccessRequest, type AccessRequest } from "@/lib/services/accessRequestService";
import { createUser, type PortalUser } from "@/lib/services/userService";

const pageStyles = {
  background: "#f5f7fb",
  minHeight: "100vh",
  padding: "40px 20px",
  color: "#111827",
};

const containerStyles = {
  maxWidth: "1280px",
  margin: "0 auto",
};

const cardStyles = {
  background: "#ffffff",
  borderRadius: "24px",
  boxShadow: "0 20px 80px rgba(15, 23, 42, 0.08)",
  padding: "32px",
};

const navButtonStyles = (active: boolean) => ({
  padding: "12px 18px",
  borderRadius: "14px",
  background: active ? "#e0f2fe" : "#ffffff",
  color: active ? "#1d4ed8" : "#475569",
  border: "1px solid #cbd5e1",
  cursor: "pointer",
});

const buttonStyles = {
  background: "#2563eb",
  color: "#ffffff",
  border: "none",
  borderRadius: "14px",
  padding: "10px 16px",
  cursor: "pointer",
};

type TabKey = "Home" | "Customer Approvals" | "Access Requests" | "Orders" | "Production" | "Shipping" | "User Management";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<PortalUser | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("Home");
  const [approvedCustomers, setApprovedCustomers] = useState<ApprovedCustomer[]>([]);
  const [pendingCustomers, setPendingCustomers] = useState<PendingCustomer[]>([]);
  const [rejectedCustomers, setRejectedCustomers] = useState<RejectedCustomer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);

  useEffect(() => {
    const storedUser = window.localStorage.getItem("quoteportal:activeUser");
    if (!storedUser) {
      router.replace("/");
      return;
    }

    const parsedUser = JSON.parse(storedUser) as PortalUser;
    if (parsedUser.role !== "Admin") {
      router.replace("/customer-dashboard");
      return;
    }

    setUser(parsedUser);
    setApprovedCustomers(loadCustomers());
    setPendingCustomers(loadPendingCustomers());
    setRejectedCustomers(loadRejectedCustomers());
    setOrders(loadOrders());
    setAccessRequests(getAccessRequests());
  }, [router]);

  const metrics = useMemo(() => {
    const pendingOrders = orders.filter((order) => order.status === "Pending Approval").length;
    const approvedOrders = orders.filter((order) => order.status === "Approved").length;
    const inProduction = orders.filter((order) => order.status === "In Production").length;
    const shipped = orders.filter((order) => order.status === "Shipped").length;
    const totalValue = orders.reduce((sum, order) => sum + (order.extendedPrice || 0), 0);

    return [
      { label: "Pending Approvals", value: pendingCustomers.length },
      { label: "Pending Requests", value: accessRequests.filter((request) => request.status === "Pending Approval").length },
      { label: "Orders Pending", value: pendingOrders },
      { label: "Approved Orders", value: approvedOrders },
      { label: "In Production", value: inProduction },
      { label: "Shipped", value: shipped },
      { label: "Total Value", value: `$${totalValue.toFixed(2)}` },
    ];
  }, [accessRequests, orders, pendingCustomers.length]);

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

  const handleApproveCustomer = (customerId: string) => {
    const approved = approvePendingCustomer(customerId);
    if (!approved) {
      return;
    }

    setPendingCustomers((current) => current.filter((customer) => customer.id !== customerId));
    setApprovedCustomers((current) => [...current, approved]);
  };

  const handleRejectCustomer = (customerId: string) => {
    const rejected = rejectPendingCustomer(customerId);
    if (!rejected) {
      return;
    }

    setPendingCustomers((current) => current.filter((customer) => customer.id !== customerId));
    setRejectedCustomers((current) => [...current, rejected]);
  };

  const handleApproveAccessRequest = (request: AccessRequest, role: "Customer" | "Admin") => {
    approveAccessRequest(request.id, role);
    createUser({
      email: request.email,
      password: "welcome123",
      name: request.contactName,
      companyName: request.companyName,
      role,
      approved: true,
    });
    setAccessRequests(getAccessRequests());
  };

  const handleRejectAccessRequest = (requestId: string) => {
    rejectAccessRequest(requestId);
    setAccessRequests(getAccessRequests());
  };

  const tabs: { key: TabKey; label: string }[] = [
    { key: "Home", label: "Home" },
    { key: "Customer Approvals", label: "Customer Approvals" },
    { key: "Access Requests", label: "Access Requests" },
    { key: "Orders", label: "Orders" },
    { key: "Production", label: "Production" },
    { key: "Shipping", label: "Shipping" },
    { key: "User Management", label: "User Management" },
  ];

  if (!user) {
    return null;
  }

  return (
    <main style={pageStyles}>
      <div style={containerStyles}>
        <div style={cardStyles}>
          <h1 style={{ fontSize: "2rem", marginBottom: "8px" }}>Admin Dashboard</h1>
          <p style={{ color: "#6b7280", marginBottom: "24px" }}>Manage approvals, access requests, orders, and workflow milestones.</p>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "24px" }}>
            {tabs.map((tab) => (
              <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)} style={navButtonStyles(tab.key === activeTab)}>
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "Home" && (
            <div style={{ display: "grid", gap: "24px" }}>
              <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
                {metrics.map((metric) => (
                  <div key={metric.label} style={{ background: "#f8fafc", borderRadius: "18px", padding: "18px", border: "1px solid #e2e8f0" }}>
                    <p style={{ margin: 0, color: "#6b7280" }}>{metric.label}</p>
                    <p style={{ margin: "8px 0 0", fontSize: "1.3rem", fontWeight: 700 }}>{metric.value}</p>
                  </div>
                ))}
              </div>
              <QuoteBuilder approvedCustomers={approvedCustomers} orders={orders} onSaveOrder={handleAddOrder} />
            </div>
          )}

          {activeTab === "Customer Approvals" && (
            <div style={{ display: "grid", gap: "16px" }}>
              <h2 style={{ fontSize: "1.5rem", marginBottom: "4px" }}>Customer Approvals</h2>
              {pendingCustomers.length === 0 ? (
                <p style={{ color: "#6b7280" }}>No pending customer approvals.</p>
              ) : pendingCustomers.map((customer) => (
                <div key={customer.id} style={{ background: "#f8fafc", borderRadius: "18px", padding: "18px", border: "1px solid #e2e8f0" }}>
                  <p style={{ margin: 0, fontWeight: 700 }}>{customer.companyName}</p>
                  <p style={{ margin: "6px 0 0", color: "#475569" }}>{customer.city}, {customer.country}</p>
                  <div style={{ display: "flex", gap: "10px", marginTop: "12px", flexWrap: "wrap" }}>
                    <button type="button" style={buttonStyles} onClick={() => handleApproveCustomer(customer.id)}>Approve</button>
                    <button type="button" style={{ ...buttonStyles, background: "#991b1b" }} onClick={() => handleRejectCustomer(customer.id)}>Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "Access Requests" && (
            <div style={{ display: "grid", gap: "16px" }}>
              <h2 style={{ fontSize: "1.5rem", marginBottom: "4px" }}>Access Requests</h2>
              {accessRequests.filter((request) => request.status === "Pending Approval").length === 0 ? (
                <p style={{ color: "#6b7280" }}>No pending access requests.</p>
              ) : accessRequests.filter((request) => request.status === "Pending Approval").map((request) => (
                <div key={request.id} style={{ background: "#f8fafc", borderRadius: "18px", padding: "18px", border: "1px solid #e2e8f0" }}>
                  <p style={{ margin: 0, fontWeight: 700 }}>{request.companyName}</p>
                  <p style={{ margin: "6px 0 0", color: "#475569" }}><strong>Contact:</strong> {request.contactName} · {request.email}</p>
                  <p style={{ margin: "6px 0 0", color: "#475569" }}><strong>Reason:</strong> {request.reasonForAccess}</p>
                  <div style={{ display: "flex", gap: "10px", marginTop: "12px", flexWrap: "wrap" }}>
                    <button type="button" style={buttonStyles} onClick={() => handleApproveAccessRequest(request, "Customer")}>Approve as Customer</button>
                    <button type="button" style={{ ...buttonStyles, background: "#0f172a" }} onClick={() => handleApproveAccessRequest(request, "Admin")}>Approve as Admin</button>
                    <button type="button" style={{ ...buttonStyles, background: "#991b1b" }} onClick={() => handleRejectAccessRequest(request.id)}>Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "Orders" && <Orders orders={orders} role="Admin" onUpdateStatus={handleUpdateStatus} />}

          {activeTab === "Production" && (
            <div style={{ display: "grid", gap: "16px" }}>
              <h2 style={{ fontSize: "1.5rem", marginBottom: "4px" }}>Production Workflow</h2>
              {orders.filter((order) => ["Pending Approval", "Approved", "In Production"].includes(order.status)).map((order) => (
                <div key={order.id} style={{ background: "#f8fafc", borderRadius: "18px", padding: "18px", border: "1px solid #e2e8f0" }}>
                  <p style={{ margin: 0, fontWeight: 700 }}>{order.productDescription || order.product}</p>
                  <p style={{ margin: "6px 0 0", color: "#475569" }}>{order.customer} · {order.partNumber}</p>
                  <p style={{ margin: "6px 0 0", color: "#475569" }}><strong>Status:</strong> {order.status}</p>
                  <button type="button" style={{ ...buttonStyles, marginTop: "12px" }} onClick={() => handleUpdateStatus(order.id, order.status === "Pending Approval" ? "Approved" : order.status === "Approved" ? "In Production" : "Awaiting Shipment")}>Advance</button>
                </div>
              ))}
            </div>
          )}

          {activeTab === "Shipping" && (
            <div style={{ display: "grid", gap: "16px" }}>
              <h2 style={{ fontSize: "1.5rem", marginBottom: "4px" }}>Shipping Workflow</h2>
              {orders.filter((order) => ["Awaiting Shipment", "Shipped", "Delivered"].includes(order.status)).map((order) => (
                <div key={order.id} style={{ background: "#f8fafc", borderRadius: "18px", padding: "18px", border: "1px solid #e2e8f0" }}>
                  <p style={{ margin: 0, fontWeight: 700 }}>{order.productDescription || order.product}</p>
                  <p style={{ margin: "6px 0 0", color: "#475569" }}>{order.customer} · {order.branchPoNumber}</p>
                  <p style={{ margin: "6px 0 0", color: "#475569" }}><strong>Status:</strong> {order.status}</p>
                  <button type="button" style={{ ...buttonStyles, marginTop: "12px" }} onClick={() => handleUpdateStatus(order.id, order.status === "Awaiting Shipment" ? "Shipped" : order.status === "Shipped" ? "Delivered" : "Delivered")}>Advance</button>
                </div>
              ))}
            </div>
          )}

          {activeTab === "User Management" && (
            <div style={{ display: "grid", gap: "16px" }}>
              <h2 style={{ fontSize: "1.5rem", marginBottom: "4px" }}>User Management</h2>
              <div style={{ background: "#f8fafc", borderRadius: "18px", padding: "18px", border: "1px solid #e2e8f0" }}>
                <p style={{ margin: 0, fontWeight: 700 }}>Approved Customers</p>
                <p style={{ margin: "6px 0 0", color: "#475569" }}>{approvedCustomers.length} customer accounts available.</p>
              </div>
              {approvedCustomers.map((customer) => (
                <div key={customer.id} style={{ background: "#f8fafc", borderRadius: "18px", padding: "18px", border: "1px solid #e2e8f0" }}>
                  <p style={{ margin: 0, fontWeight: 700 }}>{customer.companyName}</p>
                  <p style={{ margin: "6px 0 0", color: "#475569" }}>{customer.city}, {customer.country}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
