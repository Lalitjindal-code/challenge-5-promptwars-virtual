/**
 * Planora AI — Unified Error Handling & Normalization Utilities
 *
 * Provides type-safe error message extraction and logging helpers,
 * eliminating unsafe `any` casts in try/catch blocks across the application.
 */

/**
 * Extracts a user-friendly error message from any thrown exception value.
 *
 * Handles:
 * - Standard Error instances
 * - Firebase Auth / Firestore error strings with prefix cleaning
 * - Custom objects containing a `message` property
 * - Raw string errors
 * - Unknown or undefined values (with a configurable fallback)
 */
export function getErrorMessage(
  error: unknown,
  fallback = "An unexpected error occurred. Please try again."
): string {
  if (!error) {
    return fallback;
  }

  if (typeof error === "string") {
    return cleanFirebasePrefix(error.trim()) || fallback;
  }

  if (error instanceof Error) {
    return cleanFirebasePrefix(error.message) || fallback;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  ) {
    const msg = (error as { message: string }).message;
    return cleanFirebasePrefix(msg) || fallback;
  }

  return fallback;
}

/**
 * Strips verbose "Firebase: " or "FirebaseError: " prefixes commonly attached
 * by Firebase client SDKs for clean end-user presentation.
 */
function cleanFirebasePrefix(message: string): string {
  return message
    .replace(/^FirebaseError:\s*/i, "")
    .replace(/^Firebase:\s*/i, "")
    .trim();
}

/**
 * Safely logs an error to the console in development/testing without crashing.
 */
export function logError(context: string, error: unknown): void {
  const message = getErrorMessage(error);
  if (process.env.NODE_ENV !== "production") {
    console.warn(`[${context}]`, message, error);
  }
}

