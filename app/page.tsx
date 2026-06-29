"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { addApprovedCustomer } from "@/features/customers/customer-store";

type IntakeForm = {
  jobFunction: string;
  companyName: string;
  country: string;
  city: string;
  postalCode: string;
  industry: string;
  solution: string;
};

const jobFunctions = ["Sales", "Procurement", "Operations", "Engineering", "Executive"];
const countries = ["United States", "Canada", "Mexico", "United Kingdom", "Germany"];
const industries = ["Electrical", "Industrial", "Construction", "IT", "Healthcare"];
const solutions = ["Power Distribution", "Automation", "Networking", "Safety", "Maintenance"];

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

const labelStyles = {
  display: "block",
  marginBottom: "4px",
  color: "#374151",
  fontWeight: 600,
};

const fieldStyles = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "14px",
  border: "1px solid #d1d5db",
  marginTop: "8px",
  outline: "none",
  fontSize: "1rem",
  color: "#111827",
};

const primaryButtonStyles = {
  background: "#2563eb",
  color: "#ffffff",
  border: "none",
  borderRadius: "14px",
  padding: "12px 22px",
  cursor: "pointer",
  transition: "background 0.2s ease",
};

const secondaryButtonStyles = {
  background: "#e2e8f0",
  color: "#1f2937",
  border: "none",
  borderRadius: "14px",
  padding: "12px 22px",
  cursor: "pointer",
  transition: "background 0.2s ease",
};

export default function Home() {
  const router = useRouter();
  const [form, setForm] = useState<IntakeForm>({
    jobFunction: jobFunctions[0],
    companyName: "",
    country: countries[0],
    city: "",
    postalCode: "",
    industry: industries[0],
    solution: solutions[0],
  });
  const [message, setMessage] = useState<string>("");

  const handleChange = (field: keyof IntakeForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.companyName.trim() || !form.city.trim() || !form.postalCode.trim()) {
      setMessage("Please complete the company name, city, and postal code fields.");
      return;
    }

    addApprovedCustomer({
      jobFunction: form.jobFunction,
      companyName: form.companyName.trim(),
      country: form.country,
      city: form.city.trim(),
      postalCode: form.postalCode.trim(),
      industry: form.industry,
      solution: form.solution,
    });

    setMessage(`Approved customer ${form.companyName.trim()} for QuoteFlow.`);
    setForm((current) => ({ ...current, companyName: "", city: "", postalCode: "" }));
  };

  return (
    <main style={pageStyles}>
      <div style={containerStyles}>
        <div style={cardStyles}>
          <h1 style={{ fontSize: "2.5rem", marginBottom: "12px" }}>QuoteFlow AI</h1>
          <p style={{ maxWidth: "760px", color: "#6b7280", lineHeight: 1.75 }}>
            A modern internal sales and order workflow platform for industrial supply teams. Capture customer intake, approve buyers, and route quotes directly into an order lifecycle.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ ...cardStyles, marginTop: "24px", display: "grid", gap: "20px" }}>
          <div>
            <p style={{ color: "#6b7280", marginBottom: "10px", fontSize: "0.95rem" }}>Customer Intake</p>
          </div>

          <label style={labelStyles}>
            Job Function
            <select
              value={form.jobFunction}
              onChange={(event) => handleChange("jobFunction", event.target.value)}
              style={fieldStyles}
            >
              {jobFunctions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>

          <label style={labelStyles}>
            Company Name
            <input
              value={form.companyName}
              onChange={(event) => handleChange("companyName", event.target.value)}
              placeholder="Example: Acme Electrical"
              style={fieldStyles}
            />
          </label>

          <label style={labelStyles}>
            Country
            <select
              value={form.country}
              onChange={(event) => handleChange("country", event.target.value)}
              style={fieldStyles}
            >
              {countries.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>

          <label style={labelStyles}>
            City
            <input
              value={form.city}
              onChange={(event) => handleChange("city", event.target.value)}
              placeholder="City"
              style={fieldStyles}
            />
          </label>

          <label style={labelStyles}>
            Postal Code
            <input
              value={form.postalCode}
              onChange={(event) => handleChange("postalCode", event.target.value)}
              placeholder="Postal Code"
              style={fieldStyles}
            />
          </label>

          <label style={labelStyles}>
            Industry
            <select
              value={form.industry}
              onChange={(event) => handleChange("industry", event.target.value)}
              style={fieldStyles}
            >
              {industries.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>

          <label style={labelStyles}>
            Solution
            <select
              value={form.solution}
              onChange={(event) => handleChange("solution", event.target.value)}
              style={fieldStyles}
            >
              {solutions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "8px" }}>
            <button type="submit" style={primaryButtonStyles}>Submit Customer</button>
            <button type="button" style={secondaryButtonStyles} onClick={() => router.push("/login")}>Login</button>
          </div>

          {message && (
            <div style={{ color: "#2563eb", marginTop: "8px", fontWeight: 600 }}>{message}</div>
          )}
        </form>
      </div>
    </main>
  );
}
