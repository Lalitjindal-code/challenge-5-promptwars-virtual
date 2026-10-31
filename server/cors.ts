/**
 * Planora AI — Strict Origin Validation & CORS Enforcement
 *
 * Implements origin validation, preview branch whitelisting, Host header
 * verification, and RFC-compliant CORS response headers.
 */

import type { ApiRequest, ApiResponse } from "./types.js";

/**
 * Static trusted production hostnames for Planora AI.
 * Includes both the canonical project name and the GitHub-derived deployment name.
 */
export const STATIC_TRUSTED_HOSTS = [
  "planora-ai.vercel.app",
  "challenge-5-promptwars-virtual.vercel.app"
];

/**
 * Trusted Vercel preview deployment patterns for Planora AI.
 * Matches project-specific preview branches (e.g. planora-ai-git-main-owner.vercel.app)
 * for both the canonical and GitHub-derived project names.
 */
export const TRUSTED_PREVIEW_PATTERNS = [
  /^planora-ai(-[a-z0-9-]+)?\.vercel\.app$/i,
  /^challenge-5-promptwars-virtual(-[a-z0-9-]+)?\.vercel\.app$/i
];

/**
 * Validates whether an incoming hostname belongs to the trusted domain registry.
 */
export function isTrustedHostname(hostname: string): boolean {
  if (!hostname || typeof hostname !== "string") return false;
  const normalized = hostname.toLowerCase().trim();

  // 1. Local development loopbacks
  if (normalized === "localhost" || normalized === "127.0.0.1" || normalized === "::1") {
    return true;
  }

  // 2. Canonical Planora production domains and verified project preview branches
  if (STATIC_TRUSTED_HOSTS.includes(normalized)) {
    return true;
  }
  if (TRUSTED_PREVIEW_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return true;
  }

  // 3. Vercel deployment URL if set in environment
  if (process.env.VERCEL_URL) {
    const vercelHost = process.env.VERCEL_URL.replace(/^https?:\/\//, "").replace(/\/.*$/, "").toLowerCase();
    if (normalized === vercelHost) {
      return true;
    }
  }

  // 4. Custom domain configured in environment
  if (process.env.ALLOWED_ORIGIN && process.env.ALLOWED_ORIGIN !== "*") {
    try {
      const allowedUrl = new URL(process.env.ALLOWED_ORIGIN);
      if (normalized === allowedUrl.hostname.toLowerCase()) {
        return true;
      }
    } catch {
      // ignore invalid URL in config
    }
  }

  return false;
}

/**
 * Configures dynamic, strictly validated CORS headers.
 * - Allows local loopback and verified Planora production/preview domains.
 * - Strictly rejects unrelated *.vercel.app deployments.
 * - Opaque/null and untrusted origins receive NO Access-Control-Allow-Origin header.
 * - Validates Host header against trusted domains to block Host-header manipulation.
 * - Missing Origin preserves server-to-server/same-origin with ACAO: * while
 *   enforcing complete server-side token authentication.
 */
export function configureCorsHeaders(
  req: ApiRequest,
  res: ApiResponse,
  allowedMethods = "POST, OPTIONS"
): boolean {
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", allowedMethods);

  const originHeader = req.headers["origin"];
  const origin = typeof originHeader === "string" ? originHeader : Array.isArray(originHeader) ? originHeader[0] : undefined;

  const hostHeader = req.headers["host"];
  const host = typeof hostHeader === "string" ? hostHeader : Array.isArray(hostHeader) ? hostHeader[0] : undefined;

  // 1. Missing Origin: Same-origin direct or server-to-server invocation
  if (!origin) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    return true;
  }

  // 2. Reject explicit string "null" or empty origins without emitting ACAO
  if (origin === "null" || origin.trim() === "") {
    return false;
  }

  try {
    const parsedOrigin = new URL(origin);

    // Protocol must be http (only for localhost loopback) or https
    const isLocal =
      parsedOrigin.hostname === "localhost" ||
      parsedOrigin.hostname === "127.0.0.1" ||
      parsedOrigin.hostname === "::1";

    if (parsedOrigin.protocol !== "https:" && (!isLocal || parsedOrigin.protocol !== "http:")) {
      return false;
    }

    // A) Explicit wildcard override in env
    if (process.env.ALLOWED_ORIGIN === "*") {
      res.setHeader("Access-Control-Allow-Origin", origin);
      return true;
    }

    // B) Verify origin hostname is a trusted Planora or local hostname
    const originIsTrusted = isTrustedHostname(parsedOrigin.hostname);

    // C) Validated Host Match: Host header must also be in trusted set
    let hostIsTrustedAndMatches = false;
    if (host) {
      const hostWithoutPort = host.split(":")[0];
      if (isTrustedHostname(hostWithoutPort)) {
        hostIsTrustedAndMatches =
          origin === `https://${host}` || (isLocal && origin === `http://${host}`);
      }
    }

    // D) Explicit ALLOWED_ORIGIN match
    const isExplicitAllowed = Boolean(
      process.env.ALLOWED_ORIGIN && origin === process.env.ALLOWED_ORIGIN
    );

    if (originIsTrusted || hostIsTrustedAndMatches || isExplicitAllowed) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      return true;
    }

    // Untrusted or unrelated Vercel domain: Omit Access-Control-Allow-Origin
    return false;
  } catch {
    // Malformed origin: Omit Access-Control-Allow-Origin
    return false;
  }
}

