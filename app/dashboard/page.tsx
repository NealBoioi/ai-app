import QuoteBuilder from "@/features/ai/quote/QuoteBuilder";
export default function Dashboard() {
  return (
    <div style={{ padding: "40px" }}>
      <h1>QuoteFlow Dashboard</h1>

      <div style={{ marginTop: "20px" }}>
        <QuoteBuilder />
      </div>
    </div>
  );
}