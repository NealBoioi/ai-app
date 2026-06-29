import { success, error } from "../../../lib/api-response";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return error("Prompt is required", 400);
    }

    const mockResponse = `AI response: ${prompt}`;

    return success({ response: mockResponse });
  } catch (err) {
    console.error(err);
    return error("Internal server error");
  }
}
