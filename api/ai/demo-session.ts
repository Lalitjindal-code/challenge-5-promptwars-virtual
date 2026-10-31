import { createDemoSessionToken, checkDemoRateLimit } from "../../server/aiHandler.js";
import { configureCorsHeaders } from "../../server/cors.js";
import type { ApiRequest, ApiResponse } from "../../server/types.js";

export default function handler(req: ApiRequest, res: ApiResponse): void {
  configureCorsHeaders(req, res, "POST, GET, OPTIONS");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  res.setHeader("Content-Type", "application/json");

  // Determine client IP for abuse prevention
  const xForwardedFor = req.headers["x-forwarded-for"];
  const forwardedIp = typeof xForwardedFor === "string" ? xForwardedFor : Array.isArray(xForwardedFor) ? xForwardedFor[0] : undefined;
  const clientIp =
    forwardedIp?.split(",")[0]?.trim() ||
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
