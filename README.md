# Toskana 2026 🇮🇹✈️

**Toskana 2026** is an offline-first, mobile-first Progressive Web Application (PWA) designed for an optimized 10-day family trip to Tuscany, Italy (29 July – 7 August 2026).

It features a high-contrast UI tailored for outdoor sunlight readability, instant budget calculations, dietary guidance (pork-free dining guide & waiter phrasebook), dynamic venue closure alerts, and offline access to full trip data.

---

## ✨ Features

- 📱 **Offline-First PWA**: Service worker precaching ensures full access to the itinerary, maps, phone numbers, and notes even in remote Chianti locations without cellular connectivity.
- 🗺️ **10-Day Route Map & Waypoints**: Interactive vertical route list with driving durations, town waypoints, and native Apple/Google Maps integration.
- 💡 **Mode Switcher (Keyif / Karma / Ucuz)**: Instantly recalculates trip & daily budgets based on selected spending style and party size.
- 🚫 **Dietary & Pork Guide**: Quick access to safe vs. non-safe dishes and a large-type Italian waiter phrasebook for dietary preferences.
- ⚠️ **Closure Guard**: Dynamic cross-referencing of venue operating days and times against scheduled visit weekdays to avoid arriving at closed locations.
- 📋 **Checklists & Persistence**: Client-side `localStorage` tracking for bookings, packing lists, and visited locations.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) (Strict mode)
- **Bundler & Build Tool**: [Vite 7](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **PWA**: `vite-plugin-pwa` (Workbox `injectManifest`)
- **Data Validation**: [Zod](https://zod.dev/) schema (`src/data/schema.ts`) with custom build-time validation script
- **Testing**: [Vitest](https://vitest.dev/) for unit testing business logic in `src/lib/`

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- `npm`

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/toskana-2026.git
   cd toskana-2026
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run local development server:
   ```bash
   npm run dev
   ```

---

## 📜 Available Scripts

| Script | Command | Description |
|---|---|---|
| `npm run dev` | `vite` | Starts Vite local development server |
| `npm run build` | `npm run validate:data && tsc -b && vite build` | Validates data JSON, typechecks, and builds PWA for production |
| `npm run preview` | `vite preview` | Previews production build locally |
| `npm test` | `vitest run` | Runs unit tests |
| `npm run test:watch` | `vitest` | Runs unit tests in watch mode |
| `npm run typecheck` | `tsc -b --noEmit` | Runs TypeScript compiler checks without emitting files |
| `npm run validate:data` | `tsx scripts/validate-data.ts` | Validates `toskana-data.json` against Zod schema and generates data gaps report |

---

## 📂 Project Structure

```
.
├── public/                 # Static assets & PWA icons
├── scripts/                # Build scripts (data validation)
├── src/
│   ├── components/         # React presentation components
│   ├── data/               # Zod schemas and data definitions
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Pure derivation logic (budget, search, closures, maps)
│   ├── state/              # Global React Context providers
│   └── types/              # TypeScript type definitions
├── toskana-data.json       # Single source of truth for itinerary data
├── vite.config.ts          # Vite & PWA configuration
└── README.md
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
