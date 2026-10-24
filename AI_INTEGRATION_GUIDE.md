# Planora AI — Real AI Integration & Setup Guide

This document details the genuine AI architecture, security boundaries, and deployment steps for Planora AI's Gemini integration.

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                       Browser Client                        │
│   - AiIdeas Studio (Stitch Design System)                   │
│   - EventContext (Firestore live subcollections)            │
│   - aiService (Client proxy with Firebase Auth ID token)    │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS POST (Authorization: Bearer <ID_TOKEN>)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Server-Side Security Layer                  │
│   Local: Vite dev server middleware (/api/ai/generate)      │
│   Production: Firebase Cloud Function (generateEventIdeas)  │
│                                                             │
│   1. Verifies Firebase Auth ID Token (Google Identity API)  │
│   2. Enforces Per-User Rate Limiting (max 5 req/min)        │
│   3. Validates Event Ownership in Cloud Firestore           │
│   4. Enforces Input Safeguards (prompt <= 500 chars)        │
│   5. Calls Gemini 2.5 Flash with strict JSON Schema         │
│   6. Validates & Normalizes Schema before responding        │
└──────────────────────────────┬──────────────────────────────┘
                               │ Secure Server-to-Server
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   Google Gemini API                         │
│   Model: gemini-2.5-flash / gemini-1.5-flash                │
│   Format: application/json (Schema-validated)               │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Privacy & Credential Security

1. **Zero Secret Leakage in Browser Bundle**:
   - The Gemini API key is **never** placed in `VITE_*` environment variables or client-side bundles.
   - It is read strictly on the server (`process.env.GEMINI_API_KEY`).
2. **Event & Guest Privacy**:
   - Guest names, personal emails, and phone numbers are **never** forwarded to the AI provider.
   - Only high-level event parameters (event name, type, date, location, budget, guest count, description, and category) are sent.
3. **Event Ownership Verification**:
   - Requests verify that the authenticated `uid` owns the event document (`/users/{uid}/events/{eventId}`).
4. **Honest Failure States**:
   - If `GEMINI_API_KEY` is not configured, the backend returns HTTP 503 (`CONFIG_MISSING`). The application displays an informative setup notice and never fabricates mock responses as genuine AI output.
5. **Clear Separation Between Generated & Saved Concepts**:
   - Generated concepts reside in memory until explicitly saved.
   - Marking a concept as saved occurs **only after** a successful Firestore write to `/users/{uid}/events/{eventId}/aiConcepts/{id}`.

---

## 3. Local Development Setup

To test live Gemini generation in local development:

1. Obtain a Gemini API key from [Google AI Studio](https://aistudio.google.com/).
2. In your terminal session, set the environment variable:
   - **Windows (PowerShell)**:
     ```powershell
     $env:GEMINI_API_KEY = "AIzaSy..."
     npm run dev
     ```
   - **macOS / Linux (Bash)**:
     ```bash
     export GEMINI_API_KEY="AIzaSy..."
     npm run dev
     ```
3. Open `http://localhost:5173/ideas`. Sign in with your account, select an event, and click **"Generate Ideas"**.

---

## 4. Production Cloud Function Deployment

The project includes production-ready Firebase Cloud Function code in the `functions/` directory.

### Prerequisites
- Install Firebase CLI:
  ```bash
  npm install -g firebase-tools
  ```
- Authenticate with Firebase:
  ```bash
  firebase login
  ```
- Associate project:
  ```bash
  firebase use planora-ai-bcbfe
  ```

### Step-by-Step Deployment

1. **Install Cloud Function dependencies**:
   ```bash
   cd functions
   npm install
   cd ..
   ```

2. **Configure the Gemini API key secret**:
   ```bash
   firebase functions:secrets:set GEMINI_API_KEY
   ```
   *(Enter your Gemini API key when prompted).*

3. **Deploy Functions**:
   ```bash
   firebase deploy --only functions
   ```

4. **Connect the Web App**:
   Once deployed, Firebase CLI will output your function URL (e.g., `https://generateeventideas-748485143407.us-central1.run.app`).
   Add it to your `.env`:
   ```env
   VITE_AI_FUNCTION_URL=https://generateeventideas-748485143407.us-central1.run.app
   ```
   Rebuild or restart your frontend:
   ```bash
   npm run build
   ```

---

## 5. Automated Verification Checklist

- [x] Server-side token verification and user authentication
- [x] Rate limiting per user UID (5 req/min)
- [x] Input length limits (max 500 characters) and timeout guards (30-35s)
- [x] Missing configuration detection (HTTP 503) without fabricated mock data
- [x] Structured JSON schema generation for themes, color palettes, deliverables, and budget allocation
- [x] Timeline suggestions, vendor category recommendations, and guest experience ideas
- [x] Firestore persistence for saved concepts under `/users/{uid}/events/{eventId}/aiConcepts`
- [x] Actionable integration: "Add to Event Execution Plan" creates real tasks and budget categories
