"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { authenticateUser, type PortalUser } from "@/lib/services/userService";
import { createAccessRequest } from "@/lib/services/accessRequestService";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accessMode, setAccessMode] = useState(false);
  const [form, setForm] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phoneNumber: "",
    jobTitle: "",
    reasonForAccess: "",
  });
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleLogin = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    const user = authenticateUser(email, password) as PortalUser | undefined;
    if (!user) {
      setMessage("The provided credentials are invalid or the account is not approved yet.");
      return;
    }

    window.localStorage.setItem("quoteportal:activeUser", JSON.stringify(user));
    if (user.role === "Admin") {
      router.push("/admin");
      return;
    }

    router.push("/customer-dashboard");
  };

  const handleAccessRequest = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.companyName.trim() || !form.contactName.trim() || !form.email.trim() || !form.phoneNumber.trim() || !form.jobTitle.trim() || !form.reasonForAccess.trim()) {
      setMessage("Please complete every access request field.");
      return;
    }

    createAccessRequest({
      companyName: form.companyName.trim(),
      contactName: form.contactName.trim(),
      email: form.email.trim(),
      phoneNumber: form.phoneNumber.trim(),
      jobTitle: form.jobTitle.trim(),
      reasonForAccess: form.reasonForAccess.trim(),
    });

    setMessage("Your access request has been submitted and is pending review.");
    setForm({ companyName: "", contactName: "", email: "", phoneNumber: "", jobTitle: "", reasonForAccess: "" });
    setAccessMode(false);
  };

  const pageStyles = {
    minHeight: "100vh",
    background: "#f5f7fb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
    color: "#111827",
  };

  const cardStyles = {
    width: "100%",
    maxWidth: "560px",
    background: "#ffffff",
    borderRadius: "24px",
    padding: "32px",
    boxShadow: "0 20px 80px rgba(15, 23, 42, 0.08)",
  };

  const inputStyles = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "14px",
    border: "1px solid #d1d5db",
    marginBottom: "14px",
    outline: "none",
    fontSize: "1rem",
    color: "#111827",
  };

  const buttonStyles = {
    width: "100%",
    background: "#2563eb",
    color: "#ffffff",
    border: "none",
    borderRadius: "14px",
    padding: "14px 16px",
    cursor: "pointer",
    marginBottom: "12px",
  };

  return (
    <div style={pageStyles}>
      <div style={cardStyles}>
        <h1 style={{ fontSize: "2rem", marginBottom: "10px" }}>QuoteFlow Portal</h1>
        <p style={{ color: "#6b7280", marginBottom: "24px" }}>Customer Order Management Portal</p>

        {!accessMode ? (
          <form onSubmit={handleLogin} style={{ display: "grid", gap: "8px" }}>
            <input type="email" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} style={inputStyles} />
            <input type="password" placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} style={inputStyles} />
            <button type="submit" style={buttonStyles}>Login</button>
            <button type="button" onClick={() => { setAccessMode(true); setMessage(""); }} style={{ ...buttonStyles, background: "#0f172a" }}>Request Access</button>
          </form>
        ) : (
          <form onSubmit={handleAccessRequest} style={{ display: "grid", gap: "8px" }}>
            <input value={form.companyName} onChange={(event) => setForm((current) => ({ ...current, companyName: event.target.value }))} placeholder="Company Name" style={inputStyles} />
            <input value={form.contactName} onChange={(event) => setForm((current) => ({ ...current, contactName: event.target.value }))} placeholder="Contact Name" style={inputStyles} />
            <input value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} placeholder="Email" style={inputStyles} />
            <input value={form.phoneNumber} onChange={(event) => setForm((current) => ({ ...current, phoneNumber: event.target.value }))} placeholder="Phone Number" style={inputStyles} />
            <input value={form.jobTitle} onChange={(event) => setForm((current) => ({ ...current, jobTitle: event.target.value }))} placeholder="Job Title" style={inputStyles} />
            <textarea value={form.reasonForAccess} onChange={(event) => setForm((current) => ({ ...current, reasonForAccess: event.target.value }))} placeholder="Reason For Access" style={{ ...inputStyles, minHeight: "110px", resize: "vertical" }} />
            <button type="submit" style={buttonStyles}>Submit Request</button>
            <button type="button" onClick={() => { setAccessMode(false); setMessage(""); }} style={{ ...buttonStyles, background: "#e2e8f0", color: "#111827" }}>Back to Login</button>
          </form>
        )}

        {message && <p style={{ color: "#2563eb", marginTop: "12px", fontWeight: 600 }}>{message}</p>}
      </div>
    </div>
  );
}
``