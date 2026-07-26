# GEMINI.md — Toskana Itinerary PWA Guide

Project reference and guidelines for **Gemini / Antigravity AI** development on the Toskana 2026 PWA.

---

## 📌 Project Overview

**Toskana 2026** (`toskana-2026`) is an offline-first, mobile-first Progressive Web Application (PWA) designed for a family trip to Tuscany (29 July – 7 August 2026, 9 nights).

- **Data Source**: `./toskana-data.json` is the **single source of truth**. Never invent places, prices, phone numbers, or opening hours. If data is missing, surface it as a gap in the UI.
- **Target Audience & Context**: Used on phones in Italy in 35°C direct sunlight, often with no signal in Chianti hills. Used by 3 adults (one elderly) and a 6-year-old child.
- **Strict Constraint**: The family **does not eat pork** (including wild boar / *cinghiale*). Pork guidance must always be 1 tap away.
- **Language**: All UI text is in **Turkish**. Technical code, comments, and schemas are in English.
- **Optimization Priority**: Offline capability > Direct sunlight readability > Fast mid-street info lookup > Aesthetics.

---

## 🛠️ Tech Stack & Architecture

- **Core**: React 19 + TypeScript (Strict, `noUncheckedIndexedAccess`: `true`) + Vite 7
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`)
- **PWA**: `vite-plugin-pwa` with `injectManifest` (precaching app shell + data for cold offline start)
- **Validation**: Zod schema (`src/data/schema.ts`) validated at build time via `scripts/validate-data.ts`
- **Testing**: Vitest (`npm test` runs 139+ tests covering derivation logic in `src/lib/`)
- **State**: Pure React hooks + `useLocalStorage` + `TripContext` (`src/state/TripContext.tsx`). No Redux/Zustand.
- **Architecture Principle**: Keep all derivation logic pure in `src/lib/` (budget calculations, closed-day checks, is-today, navigation URLs, search). Components in `src/components/` remain presentational ("dumb").

---

## 📜 Development Commands

| Command | Action |
|---|---|
| `npm run dev` | Launch Vite local dev server |
| `npm run build` | Validate data (`validate:data`), typecheck (`tsc -b`), and build Vite production bundle (`dist/`) |
| `npm test` | Run all Vitest unit tests once |
| `npm run test:watch` | Run Vitest unit tests in watch mode |
| `npm run typecheck` | Run TypeScript compiler check without emitting files |
| `npm run validate:data` | Validate `toskana-data.json` against Zod schema & output data gaps report |

---

## 🎨 Design Tokens & Visual Aesthetics

Ground the design in **Italian roadside signage and Montelupo majolica**:

- `--sign-brown: #4A3728` (surfaces, headers)
- `--cobalt: #1F4E8C` (primary actions, links)
- `--antimony: #E3A32B` (highlights, Arezzo day marker)
- `--manganese: #6B4F70` (secondary accents)
- `--tin: #EFEDE6` (cool background surface)
- `--ink: #1A1614` (body text)

### Signature Visual Element
- **Route Line**: Render the 10-day list as a continuous vertical route line with driving time segments connecting day waypoints to make driving intensity visible at a glance.

### Usability Standards
- **Minimum Tap Target**: `44px x 44px` for mobile usability.
- **High Contrast**: Target high contrast ratio (WCAG AA+) for readability in bright Italian sunlight.
- **Motion**: Minimal transitions. Respect `prefers-reduced-motion`.

---

## 📐 Core Features & Logic Guidelines

1. **Day List & Day Detail**:
   - 10-day vertical route list. If real date falls within trip, auto-pin and default to today's view ("Bugün").
   - Day sections: Rota/navigasyon → Görülecek → Yemek → Alışveriş → Notlar.
   - Tier Badges: `core` (full card), `optional` (normal marked opsiyonel), `skip`/`removed` (collapsed in "Neden atlıyoruz" accordion).

2. **Mode Switch (Keyif / Karma / Ucuz)**:
   - Persistent 3-way toggle altering prices, meal recommendations (`tier: "a"` vs `tier: "b"`), and trip/day budget totals instantly.
   - Party size scaler (default 3 adults + 1 child) with non-scalable per-group cost handling.

3. **Closed-Day & Warning Guard**:
   - Cross-references `closures[]` against weekday names dynamically. Never hardcoded.

4. **Pork Guide & Phrasebook**:
   - Permanent bottom bar access with **Kaçın / Güvenli** tables and **Cümleler** (large-type Italian waiter phrase cards).

5. **Navigation & Offline Link Handling**:
   - Native Apple Maps vs Google Maps detection for iOS. `tel:` links for phone numbers.

6. **Checklists & Persistence**:
   - LocalStorage saved checklists: `bookings`, `packing`, and `visited` toggles.

---

## 🚀 Potential Future Improvements (Backlog)

- Drag-and-drop day reordering with auto-recalculated driving times.
- Fuel + toll estimator (using `totalKm` and EUR/L input).
- Photo attachment per stop (IndexedDB base64 storage).
- `.ics` calendar export for scheduled events and bookings.
- "Yarın ne var" next-day summary card.
