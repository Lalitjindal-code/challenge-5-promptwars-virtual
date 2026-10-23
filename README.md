# Planora AI — React + TypeScript

A responsive Planora AI landing page migrated from the supplied HTML prototype. The existing visual direction is retained: navy, champagne gold, violet accents, Plus Jakarta Sans headings, and Inter body text.

## Included

- React + TypeScript + Vite
- Tailwind CSS theme tokens
- Responsive landing page sections
- Functional **Plan My Event** flow with client-side validation
- Budget split preview and generated starter checklist
- Event saved to `localStorage` in this browser
- Saved event confirmation and dashboard-preview update
- Accessible modal close behavior, labels, error messages, and Escape key support
- No API key or backend secrets in the frontend

## Run locally

Requires Node.js 20.19+ or 22.12+ recommended.

```bash
npm install
npm run dev
```

Open the local URL Vite prints.

## Production build

```bash
npm run build
npm run preview
```

## First Create Event flow

1. Click **Plan My Event** in the header, hero, or final CTA.
2. Fill in event type, event name, date, guest count, budget, and location.
3. Submit the form.
4. The app validates the values, calculates a simple budget allocation, creates a starter checklist, and saves the event to local browser storage.
5. The success state displays a summary and the page dashboard preview updates.

This is a frontend prototype. It does **not** yet call a generative AI API, provide authentication, sync across devices, send invitations, or export a real PDF. Do not represent those features as implemented.

## Project structure

```text
src/
  components/
    EventModal.tsx
    Sections.tsx
  App.tsx
  main.tsx
  styles.css
```

## Next production steps

1. Add a backend API (FastAPI or Node/Express) for AI generation.
2. Keep provider keys on the server; never expose them in browser code.
3. Add persistent storage and authentication.
4. Add tests for form validation, budget totals, local-storage errors, and mobile layout.
5. Replace remote image URLs with licensed local assets and add a proper brand logo.
6. Implement real navigation destinations, privacy/terms pages, and verify any claims such as “live sync”.
