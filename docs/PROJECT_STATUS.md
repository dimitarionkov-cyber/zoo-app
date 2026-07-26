# Зоопарк София — PWA Project Status

> Phase: **1 — PWA Beta**  
> Target launch: September 2026

---

## Version History

| Version | Date       | Changes |
|---------|------------|---------|
| 0.2.0   | 2026-07-26 | Home, Animals list, and Animal Detail redesigned to the paper/ink "Hi-Fi" spec (Newsreader/Manrope/JetBrains Mono, light+dark tokens). Animals Hub + Search retired into one unified searchable/filterable Animals screen. Animal Detail rebuilt as "Dossier cards" (fixed-green header, IUCN strip, stat grid, per-section cards, distribution + location cards, directions CTA). Shipped Favorites + Visit Recording (heart/eye toggles, localStorage-backed, visited banner/date). Fixed a duplicate animal ID that corrupted list rendering, and replaced `react-simple-maps` (incompatible with React 19) with a `d3-geo`/`topojson-client` SVG map. Added a `staging` branch for pre-production verification before promoting to `master`. |
| 0.1.0   | 2026-05-11 | First public beta. Multi-route planning (4 routes), feedback form (Formspree), dark mode fixes, search multi-select dropdowns, Info accordion, admin unlock, parking/bus stop POIs, animal photo support, uniform home tiles |
| 0.0.1   | 2026-05-10 | Initial developer preview. All core screens built, 165 animals, Dijkstra+TSP route, Google Maps integration, dark mode toggle |

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Vite + React 19 |
| Styling | Tailwind CSS v4 (`@theme` CSS variables) + inline-style token system (paper/ink/green) on the redesigned screens |
| Routing | React Router v6 |
| Map | Google Maps API (`@react-google-maps/api`); world distribution map via `d3-geo` + `topojson-client` (raw SVG, no React wrapper lib) |
| Data | Bundled JSON files (`src/data/`) |
| Images | Remotely hosted (Super Hosting) — not bundled |
| Deployment | GitHub → Vercel. `master` = production (auto-deploy). `staging` = pre-production branch, auto-previewed by Vercel, promoted to `master` only after manual approval |
| Feedback | Formspree (`xnjwlody`) |
| Cloud sync | Supabase (Postgres + Auth) — anonymous sign-in by default, upgradeable to an email-linked account so progress survives a cleared cache / new device. See `supabase/schema.sql` |

---

## Screens — Completion Status

| Screen | File | Status | Notes |
|---|---|---|---|
| Home | `pages/HomePage.jsx` | ✅ Done | Hi-Fi paper/ink redesign: greeting bar, Today card (3 states: open/closing/closed), 2×2 quick actions, horizontal news strip, Beta feedback FAB |
| Map | `pages/MapPage.jsx` | ✅ Done | Satellite, animal/POI markers, 4 routes with selector + parking info, filter chips, live GPS, bottom sheet |
| Animals (list + search, unified) | `pages/AnimalsListPage.jsx` | ✅ Done | Live search, single-select class chips, favorites-only + GPS-distance toggles, flat row list. Absorbed the old Animals Hub and standalone Search page — `/animals`, `/animals/list`, and `/search` all resolve here |
| Animal Detail | `pages/AnimalDetailPage.jsx` | ✅ Done | "Dossier cards" redesign: fixed-green header (name/taxonomy, favorite+visited toggles), visited banner, art placeholder, IUCN strip, 2×2 stat grid, per-section dossier cards, distribution map + region pills, location card, directions CTA |
| Info | `pages/InfoPage.jsx` | ✅ Done | Single-open accordion, hours, prices, transport, contacts, 2 entrance direction buttons |
| Settings | `pages/SettingsPage.jsx` | ✅ Done | Dark mode toggle, admin unlock (double-tap Beta), feedback form |
| Feedback | `components/FeedbackModal.jsx` | ✅ Done | Bug/feature/general form, auto-collects device info, Formspree backend |

---

## Components & Context

| Component | File | Status | Notes |
|---|---|---|---|
| Layout / Shell | `components/Layout/` | ✅ Done | App shell with bottom nav + Beta feedback FAB |
| Bottom Nav | `components/Layout/BottomNav.jsx` | ✅ Done | 5 tabs: Начало / Карта / Животни / Днес / Още |
| Animal Location Map | `components/AnimalLocationMap.jsx` | ✅ Done | Satellite mini-map + slim footer only; geolocation and the directions CTA now live in `AnimalDetailPage` (single `getCurrentPosition` call, no duplicate permission prompt) |
| Distribution Map | `components/DistributionMap.jsx` | ✅ Done | World map as raw SVG via `d3-geo`/`topojson-client`, highlights `distributionCountries` |
| Maps Context | `context/MapsContext.jsx` | ✅ Done | Single `useJsApiLoader` at app level |
| Data Context | `context/DataContext.jsx` | ✅ Done | Provides `allAnimals`, `allPois`, `darkMode`, `favoriteIds`/`toggleFavorite`/`isFavorite`, `visited`/`toggleVisited`/`isVisited` |

---

## Data

| File | Status | Notes |
|---|---|---|
| `src/data/animals.json` | ✅ Done | **164 animals** — `id`, `nameBg`, `nameEn`, `species`, `lat`, `lng`, `diet`, `animalType`, `iucn`, `stats`, `habitat`, `continents[]`, `classification`, `photo` |
| `src/data/pois.json` | ✅ Done | Food, medical, entrances, tickets, shops, attractions, parking (×2), bus stops (×2) |
| `src/data/paths.json` | ✅ Done | Zoo walkway polylines (white) + steps (orange) from OSM |
| `src/data/routes/` | ✅ Done | 4 pre-computed routes: `main-main` (3.68 km), `main-west` (3.51 km), `west-west` (3.73 km), `west-main` (3.46 km) |
| `src/data/route.json` | ✅ Done | Legacy alias — kept in sync with `main-main.json` for backward compat |
| `scripts/routes-calc.cjs` | ✅ Done | Route generator: Dijkstra + TSP nearest-neighbour + 2-opt |

---

## Key Technical Decisions & Fixes

- **MapsContext pattern**: `useJsApiLoader` once at app level, shared via context. Multiple calls caused blank map on navigation.
- **Tailwind v4 CSS vars**: `bg-[--color-bg-card]` arbitrary syntax unreliable — use `style={{ backgroundColor: 'var(--color-bg-card)' }}` instead.
- **Stacking context trap**: A positioned element with `z-index` creates a stacking context, capping all children at that z-level. Caused search dropdown backdrop to intercept clicks. Fix: remove `z-index` from the header so the dropdown escapes to root stacking context.
- **RSS thumbnails**: zoosofia.eu feed has no `<media:thumbnail>`. Extracted from `<content:encoded>` CDATA via `DOMParser`.
- **CORS proxy**: RSS fetch uses `https://api.allorigins.win/raw?url=` — third-party, could break.
- **Open-path TSP**: For routes with different start/end, reserve end entrance from animal pool, visit all animals, append end. 2-opt preserves both endpoints (i starts at 1, j ends at length-2).
- **OSM animal coordinates**: Centroid of each enclosure way polygon (average of node lat/lng).
- **`react-simple-maps` incompatible with React 19**: `ComposableMap` threw "A React Element from an older version of React was rendered" on every render (peer dep only supports React ≤18). Replaced with a direct `d3-geo` + `topojson-client` SVG render — same props/CSS-var theming, ~30 kB smaller gzipped bundle.
- **Duplicate animal `id` corrupts list rendering**: two identical records sharing one `id` (a data-import duplicate) caused React's key-based reconciliation to duplicate/ghost rows once favoriting started toggling items in and out of a filtered list. Fixed by deduping the data; also worth keying dynamic lists as `` `${id}_${index}` `` defensively if this class of bug resurfaces elsewhere.
- **Geolocation requested once per page, not per component**: `AnimalDetailPage` now owns the single `getCurrentPosition` call and passes `distance`/`geoError` down as props, so the location card and the directions CTA share one browser permission prompt instead of two.
- **Cloud sync via anonymous Supabase auth**: every device signs in anonymously on first load (no signup friction); favorites/visited/visit-session state syncs to a `zoo_progress` row keyed by that auth uid, gated by row-level security. Optionally linking an email (Settings → "Запази прогреса си") upgrades the *same* anonymous user to a permanent one — same uid, same row — so signing in with that email on a new device (or after clearing storage) restores everything via Supabase's magic-link flow, no separate account/migration step needed.
- **Merge-completion flag must be React state, not a ref**: the "pull remote, merge into local" effect flips a flag when done so the "push local up" effect can react to it. Using a plain `useRef` for that flag doesn't retrigger the push effect when nothing else changed (e.g. connecting to a brand-new empty remote row) — it has to be `useState` so React actually re-runs the dependent effect.

---

## Phase 2+ (Not Started)

- Native Android/iOS app (React Native / Expo)
- Backend API + admin panel (PHP/MySQL on Super Hosting)
- Apple Health / Google Fit sync
- Live Activities / push notifications
- Social sharing / virtual tour video generation
- Multi-language (English)
