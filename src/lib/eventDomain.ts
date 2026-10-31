/**
 * Planora AI — Core Event Domain Logic & Validation Utilities
 *
 * Encapsulates pure domain rules for event duplication, lifecycle transitions,
 * and form validation, decoupled from React UI layers.
 */

import type { EventItem } from "../types";

export interface EventValidationInput {
  name: string;
  budget: number;
  date: string;
  guestsCount: number;
  type?: string;
  location?: string;
}

export interface GuestValidationInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  partySize?: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Creates an isolated clone of an event for the workspace.
 *
 * Rules:
 * - Generates a distinct unique identifier
 * - Appends " (Copy)" to the event name
 * - Resets lifecycle state to "Planning"
 * - Resets progress metrics (spent: 0, confirmedGuests: 0, tasksCompleted: 0)
 * - Retains target event parameters (budget, target guest count, location, type, description)
 */
export function duplicateEvent(original: EventItem): EventItem {
  const randomSuffix = Math.random().toString(36).slice(2, 6);
  return {
    ...original,
    id: `evt-${Date.now()}-${randomSuffix}`,
    name: `${original.name} (Copy)`,
    status: "Planning",
    spent: 0,
    confirmedGuests: 0,
    tasksCompleted: 0,
  };
}

/**
 * Validates event creation input parameters.
 */
export function validateEventInput(input: EventValidationInput): ValidationResult {
  const errors: string[] = [];

  if (!input.name || !input.name.trim()) {
    errors.push("Event name is required and cannot be blank.");
  }

  if (typeof input.budget !== "number" || Number.isNaN(input.budget) || input.budget < 0) {
    errors.push("Budget must be a non-negative number.");
  }

  if (typeof input.guestsCount !== "number" || Number.isNaN(input.guestsCount) || input.guestsCount < 0) {
    errors.push("Guest count must be a non-negative integer.");
  }

  if (!input.date || Number.isNaN(new Date(input.date).getTime())) {
    errors.push("A valid date is required.");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates guest roster input parameters.
 */
export function validateGuestInput(guest: GuestValidationInput): ValidationResult {
  const errors: string[] = [];

  if (!guest.firstName || !guest.firstName.trim()) {
    errors.push("First name is required.");
  }

  if (guest.email && guest.email.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guest.email.trim())) {
      errors.push("Invalid email format.");
    }
  }

  if (typeof guest.partySize !== "number" || guest.partySize < 1) {
    errors.push("Party size must be at least 1.");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

