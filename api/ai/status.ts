export default function handler(req: any, res: any) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
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
