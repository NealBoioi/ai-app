"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { type PortalUser } from "@/lib/services/userService";

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
  borderRadius: "16px",
  padding: "16px 20px",
  cursor: "pointer",
  fontWeight: 700,
};

export default function CustomerDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<PortalUser | null>(null);

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
  }, [router]);

  if (!user) {
    return null;
  }

  return (
    <main style={pageStyles}>
      <div style={containerStyles}>
        <div style={cardStyles}>
          <h1 style={{ fontSize: "2.2rem", marginBottom: "10px" }}>Welcome, {user.name}</h1>
          <p style={{ color: "#6b7280", lineHeight: 1.75, marginBottom: "24px" }}>
            Create orders and track the status of your requests from this customer portal.
          </p>

          <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
            <button type="button" style={buttonStyles} onClick={() => router.push("/new-order")}>New Order</button>
            <button type="button" style={{ ...buttonStyles, background: "#0f172a" }} onClick={() => router.push("/search-orders")}>Search Orders</button>
          </div>
        </div>
      </div>
    </main>
  );
}
