"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { approveAccessRequest, getAccessRequests, rejectAccessRequest, type AccessRequest } from "@/lib/services/accessRequestService";
import { createUser, type PortalUser } from "@/lib/services/userService";

const pageStyles = {
  background: "#f5f7fb",
  minHeight: "100vh",
  padding: "40px 20px",
  color: "#111827",
};

const cardStyles = {
  background: "#ffffff",
  borderRadius: "24px",
  boxShadow: "0 20px 80px rgba(15, 23, 42, 0.08)",
  padding: "32px",
};

const buttonStyles = {
  background: "#2563eb",
  color: "#ffffff",
  border: "none",
  borderRadius: "14px",
  padding: "10px 16px",
  cursor: "pointer",
};

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<PortalUser | null>(null);
  const [requests, setRequests] = useState<AccessRequest[]>([]);

  useEffect(() => {
    const storedUser = window.localStorage.getItem("quoteportal:activeUser");
    if (!storedUser) {
      router.replace("/");
      return;
    }

    const parsedUser = JSON.parse(storedUser) as PortalUser;
    if (parsedUser.role !== "Admin") {
      router.replace(parsedUser.role === "Customer" ? "/customer-dashboard" : "/");
      return;
    }

    setUser(parsedUser);
    setRequests(getAccessRequests().filter((request) => request.status === "Pending Approval"));
  }, [router]);

  const handleApprove = (request: AccessRequest, role: "Customer" | "Admin") => {
    approveAccessRequest(request.id, role);
    createUser({
      email: request.email,
      password: "welcome123",
      name: request.contactName,
      companyName: request.companyName,
      role,
      approved: true,
    });
    setRequests(getAccessRequests().filter((item) => item.status === "Pending Approval"));
  };

  const handleReject = (requestId: string) => {
    rejectAccessRequest(requestId);
    setRequests(getAccessRequests().filter((item) => item.status === "Pending Approval"));
  };

  if (!user) {
    return null;
  }

  return (
    <main style={pageStyles}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={cardStyles}>
          <h1 style={{ fontSize: "2rem", marginBottom: "8px" }}>Admin Access Requests</h1>
          <p style={{ color: "#6b7280", marginBottom: "24px" }}>Approve or reject portal access requests and assign roles.</p>

          {requests.length === 0 ? (
            <p style={{ color: "#6b7280" }}>No pending access requests found.</p>
          ) : (
            <div style={{ display: "grid", gap: "16px" }}>
              {requests.map((request) => (
                <div key={request.id} style={{ background: "#f8fafc", borderRadius: "18px", padding: "18px", border: "1px solid #e2e8f0" }}>
                  <p style={{ margin: "0 0 8px", fontWeight: 700 }}>{request.companyName}</p>
                  <p style={{ margin: "0 0 6px", color: "#475569" }}><strong>Contact:</strong> {request.contactName}</p>
                  <p style={{ margin: "0 0 6px", color: "#475569" }}><strong>Email:</strong> {request.email}</p>
                  <p style={{ margin: "0 0 6px", color: "#475569" }}><strong>Reason:</strong> {request.reasonForAccess}</p>
                  <p style={{ margin: 0, color: "#475569" }}><strong>Status:</strong> {request.status}</p>
                  <div style={{ display: "flex", gap: "10px", marginTop: "14px", flexWrap: "wrap" }}>
                    <button type="button" style={buttonStyles} onClick={() => handleApprove(request, "Customer")}>Approve as Customer</button>
                    <button type="button" style={{ ...buttonStyles, background: "#0f172a" }} onClick={() => handleApprove(request, "Admin")}>Approve as Admin</button>
                    <button type="button" style={{ ...buttonStyles, background: "#991b1b" }} onClick={() => handleReject(request.id)}>Reject</button>
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
