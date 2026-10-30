import { createDemoSessionToken, checkDemoRateLimit } from "../../server/aiHandler";
import { configureCorsHeaders } from "./generate";

export default function handler(req: any, res: any) {
  configureCorsHeaders(req, res, "POST, GET, OPTIONS");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  res.setHeader("Content-Type", "application/json");

  // Determine client IP for abuse prevention
  const clientIp =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "client-session";

  const rateCheck = checkDemoRateLimit(`ip:${clientIp}`);
  if (!rateCheck.allowed) {
    res.statusCode = 429;
    res.setHeader("Retry-After", String(rateCheck.retryAfterSeconds || 60));
    res.end(
      JSON.stringify({
        error: "RATE_LIMITED",
        message: "Too many demo session requests. Please wait a moment."
      })
    );
    return;
  }

  const session = createDemoSessionToken();
  res.statusCode = 200;
  res.end(JSON.stringify(session));
}
