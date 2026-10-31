/**
 * Planora AI — Firestore Document Normalization & Utility Functions
 *
 * Provides pure, zero-dependency helpers for Firestore document mapping,
 * preventing `any` assertions while allowing safe execution in both browser
 * and Node test environments.
 */

/**
 * Safely binds Firestore document ID and event ID to unmarshalled document data
 * without requiring unsafe `any` type assertions.
 */
export function parseFirestoreDoc<T extends { id: string; eventId?: string }>(
  docId: string,
  eventId: string,
  data: Record<string, unknown>
): T {
  return {
    ...data,
    id: docId,
    eventId
  } as unknown as T;
}

