import { configureCorsHeaders } from "./generate.js";

export default function handler(req: any, res: any) {
  configureCorsHeaders(req, res, "GET, OPTIONS");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  res.setHeader("Content-Type", "application/json");

  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY;

  res.statusCode = 200;
  res.end(
    JSON.stringify({
      configured: Boolean(apiKey),
      provider: "google-gemini",
      models: ["gemini-2.5-flash-lite", "gemini-2.5-flash", "gemini-flash-latest"]
    })
  );
}
