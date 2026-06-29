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
    <main style={{ padding: "40px" }}>
      <h1>QuoteFlow AI</h1>
      <p style={{ maxWidth: "640px", marginTop: "16px" }}>
        A lightweight sales and order workflow tool for internal quoting, validation, and customer onboarding.
        Submit customer interest once, then generate quotes and track order progress from the dashboard.
      </p>

      <form onSubmit={handleSubmit} style={{ marginTop: "28px", maxWidth: "560px", display: "grid", gap: "14px" }}>
        <label>
          Job Function
          <select value={form.jobFunction} onChange={(event) => handleChange("jobFunction", event.target.value)}>
            {jobFunctions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>

        <label>
          Company Name
          <input
            value={form.companyName}
            onChange={(event) => handleChange("companyName", event.target.value)}
            placeholder="Example: Acme Electrical"
          />
        </label>

        <label>
          Country
          <select value={form.country} onChange={(event) => handleChange("country", event.target.value)}>
            {countries.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>

        <label>
          City
          <input
            value={form.city}
            onChange={(event) => handleChange("city", event.target.value)}
            placeholder="City"
          />
        </label>

        <label>
          Postal Code
          <input
            value={form.postalCode}
            onChange={(event) => handleChange("postalCode", event.target.value)}
            placeholder="Postal Code"
          />
        </label>

        <label>
          Industry
          <select value={form.industry} onChange={(event) => handleChange("industry", event.target.value)}>
            {industries.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>

        <label>
          Solution
          <select value={form.solution} onChange={(event) => handleChange("solution", event.target.value)}>
            {solutions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>

        <div style={{ display: "flex", gap: "12px", alignItems: "center", marginTop: "12px" }}>
          <button type="submit">Submit Customer</button>
          <button type="button" onClick={() => router.push("/login")}>Login</button>
        </div>

        {message && <p style={{ color: "#111", marginTop: "8px" }}>{message}</p>}
      </form>
    </main>
  );
}
``