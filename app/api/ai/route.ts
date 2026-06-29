import { success, error } from "../../../lib/api-response";

type QuoteRequest = {
  prompt?: string;
  customer?: string;
  product?: string;
  quantity?: number | string;
};

type QuoteResponse = {
  price: number;
  leadTime: string;
  validationWarnings: string[];
  suggestions: string[];
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as QuoteRequest;
    const { prompt, customer, product, quantity } = body;

    if (prompt && !customer && !product && quantity === undefined) {
      const mockResponse = `AI response: ${prompt}`;
      return success({ response: mockResponse, validationWarnings: [], suggestions: [] });
    }

    if (!customer || !product || quantity === undefined || quantity === null) {
      return error("Customer, product, and quantity are required", 400);
    }

    const qty = typeof quantity === "string" ? parseInt(quantity, 10) : quantity;
    if (Number.isNaN(qty) || qty <= 0) {
      return error("Quantity must be a positive number", 400);
    }

    const validationWarnings: string[] = [];
    const suggestions: string[] = [];

    if (qty > 500) {
      validationWarnings.push(
        "Quantity is unusually high. Confirm bulk pricing and inventory availability before submitting."
      );
    }

    if (product.trim().length < 5) {
      suggestions.push(
        "The product name is vague. Add more detail so the quote can be more accurate."
      );
    }

    if (customer.trim().length < 3) {
      suggestions.push(
        "Use a full customer or company name to help sales tracking and order validation."
      );
    }

    const price = qty * 50;
    const leadTime = qty > 100 ? "2-3 weeks" : "5-7 days";

    const response: QuoteResponse = {
      price,
      leadTime,
      validationWarnings,
      suggestions,
    };

    return success(response);
  } catch (err) {
    console.error(err);
    return error("Internal server error");
  }
}
