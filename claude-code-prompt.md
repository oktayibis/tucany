# Claude Code Prompt — Toskana Itinerary PWA

> **Kullanım:** `toskana-data.json` dosyasını boş bir klasöre koy, terminalde `claude` başlat ve aşağıdaki bloğun tamamını yapıştır.
> Prompt teknik netlik için İngilizce; **arayüz dili Türkçe** olacak şekilde talimatlandırıldı.

---

```
Build an offline-first, mobile-first PWA for a family trip to Tuscany. All trip
content already exists in `./toskana-data.json` — read it first and treat it as
the single source of truth. Do not invent places, prices, phone numbers or
opening hours. If something is missing from the data, surface it as a gap in the
UI rather than fabricating it.

## Context that shapes every decision

This is used by one family, on phones, in Italy, in 35°C sunlight, often with no
signal in the Chianti hills. It is a working travel document, not a marketing
site. Three adults (one elderly) and a six-year-old. They do not eat pork,
including wild boar (cinghiale), which is on every Tuscan menu — the pork
guidance must never be more than one tap away.

Optimise, in this order: works offline > readable in direct sun > fast to the
information you need mid-street > pleasant to look at.

## Stack

- Vite + React 19 + TypeScript (strict, `noUncheckedIndexedAccess` on)
- Tailwind CSS v4
- `vite-plugin-pwa` with `injectManifest` — precache the entire app shell and
  data so a cold start with airplane mode on works fully
- Zod schema for the trip data, validated at build time; export inferred types
- No backend, no auth, no analytics, no external API calls at runtime
- State: React hooks + a small `useLocalStorage` hook. No state library.
- Deploy target: static build, single `dist/` folder

Code style: functional. Pure functions for all derivation (budget totals, closed-
day checks, "is today"), discriminated unions for the tier/theme/severity fields,
no class components, no `any`. Keep derivation in `src/lib/`, components dumb.

## Features

### 1. Day list + day detail
- Home is a vertical list of the 10 days: date, weekday, title, an intensity
  indicator, driving time, and the budget for the currently selected mode.
- If the real current date falls inside the trip, pin that day to the top with a
  "Bugün" marker and open it by default. Outside the trip window, show day 1.
- Day detail sections: Rota/navigasyon → Görülecek → Yemek → Alışveriş → Notlar.
- Every stop shows: why it's worth it, duration, cost, tier badge.
- Tier rendering: `core` = full card; `optional` = normal but marked opsiyonel;
  `skip` and `removed` = collapsed by default into a "Neden atlıyoruz" accordion
  that shows the reason and the money saved. Do not hide this — the reasoning is
  half the value of the plan.

### 2. Mode switch (the central interaction)
A persistent three-way switch: **Keyif / Karma / Ucuz**. Changing it must
instantly re-render every price, swap `tier: "a"` vs `tier: "b"` food options,
and recalculate the running total for the whole trip and for each day. Show the
delta against the other modes so the trade-off is legible, e.g. "Karma modda
€230 daha az".

Also expose a party-size control (default 3 adults + 1 child) that rescales
per-person costs. Food entries priced for the whole group must not be rescaled —
mark which is which in your derivation layer and be explicit about the assumption
in a tooltip.

### 3. Closed-day guard
Cross-reference `closures[]` against each day's weekday and surface a warning
banner on any day where a recommended place is closed. This is derived, never
hardcoded. Same treatment for the `warnings[]` already in each day.

### 4. Pork guide + phrasebook
Reachable from a persistent bottom bar on every screen. Two tabs:
- **Kaçın / Güvenli** — the avoid list in red, the safe dishes as a table with
  prices, the `caution` items separately.
- **Cümleler** — Italian phrases at very large type, high contrast, designed to
  be turned around and shown to a waiter. Tap to enlarge to full screen.

### 5. Checklists with persistence
Three: `bookings`, `packing`, and a "gezildi" toggle on every stop. Persist to
localStorage keyed by a version string so a data update doesn't wipe progress.
Bookings show priority colour, cost, phone number as a `tel:` link, and the
deadline copy from the data.

### 6. Navigation
Every `nav` URL becomes a prominent button. Detect iOS and offer Apple Maps as
well as Google Maps. Phone numbers are `tel:` links. Nothing else should leave
the app.

### 7. Search + filter
Single search across stop names, food, shopping and phrases. Filters: theme,
`elderFriendly`, `tags` (market/shopping), tier.

### 8. Print stylesheet
`@media print` renders the whole trip as a clean linear document, one day per
page block, no navigation chrome — so it can be saved as a PDF backup.

## Design direction

The obvious move for a Tuscany site is cream paper, a high-contrast serif, and a
terracotta accent. Do not do that — it is the default answer and it will look
like every other generated travel page.

Ground the design instead in **Italian roadside signage and Montelupo majolica**,
both of which the trip actually passes through. Italian tourist-heritage signs
are brown with white type; majolica from Montelupo is cobalt blue, antimony
yellow and manganese on tin-white. Start from roughly:

- `--sign-brown: #4A3728` (surfaces, headers)
- `--cobalt: #1F4E8C` (primary action, links)
- `--antimony: #E3A32B` (highlights, the starred Arezzo day)
- `--manganese: #6B4F70` (secondary)
- `--tin: #EFEDE6` (background — keep it cooler and greyer than cream)
- `--ink: #1A1614` (text)

Adjust these if you can justify it, but stay out of the cream/terracotta default.

Type: pair a condensed grotesque for display and numerals (signage vernacular,
good for dense data) with a humanist sans for body. Not a serif display face.
Set a real type scale.

**Signature element:** the day list rendered as a route — each day a waypoint on
a continuous vertical line, with driving time rendered as the segment between
them, so the shape of the trip (two heavy driving days, three near-zero ones) is
visible at a glance. Let this be the one memorable thing and keep everything else
quiet.

Motion: minimal. A mode-switch transition on the numbers is worth doing well.
Nothing else needs to move. Respect `prefers-reduced-motion`.

Quality floor, unstated: 44px minimum tap targets, visible keyboard focus, WCAG
AA contrast at minimum (aim higher — this is used in sunlight), full keyboard
navigation, semantic landmarks.

## Copy

All UI text in Turkish. Sentence case. Plain verbs. Name things the way the
family would say them, not the way the data models them — "Bugün nereye
gidiyoruz" not "Day detail view". Empty and error states get direction, not
apology.

## Build order

1. Scaffold, Zod schema, typed data import, verify the JSON validates.
2. Derivation layer in `src/lib/` with unit tests: budget by mode and party size,
   closed-day detection, is-today, trip totals.
3. Day list + day detail, unstyled but complete.
4. Mode switch wired through everything.
5. Design pass — tokens first, then components.
6. Pork guide, phrasebook, checklists, search.
7. PWA config; verify offline with devtools set to offline and a cold reload.
8. Print stylesheet.

Before step 5, show me the token system and a wireframe of the day list so I can
react to the direction before you build it out.

Start with step 1 and stop after step 2 so I can review the derivation logic.
```

---

## Sonradan söyleyebileceğin şeyler

Site ayaktayken Claude Code'a atabileceğin ek istekler:

- `Add a "gün değiştir" mode: let me drag days to reorder and recompute driving times between the new day's first stop and the base.`
- `Add a fuel + toll estimator using totalKm and a configurable EUR/litre.`
- `Add a photo slot per stop — local file input, stored as base64 in IndexedDB, shown in the day timeline.`
- `Generate an .ics file with one all-day event per day and timed events for anything with a booking.`
- `Add a "yarın ne var" summary card that reads the next day's warnings and bookings.`
- `Make the phrasebook work as a full-screen card deck with swipe.`

## Veri güncelleme

`toskana-data.json` tek kaynak. Yeni bir yer eklemek istersen JSON'a ekle,
şema doğrularsa arayüz kendiliğinden gösterir. Şemayı bozan bir değişiklik
yaparsan build hata verir — bilerek böyle.

## Deploy

Statik `dist/` klasörü. Dokploy'da bir static site servisi olarak ya da
`nginx:alpine` üstünde tek katmanlı bir Dockerfile ile çıkabilir. PWA'nın
kurulabilmesi için HTTPS ve doğru `manifest.webmanifest` MIME tipi gerekiyor.
