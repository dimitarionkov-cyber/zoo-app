# Зоопарк София — PWA Project Status

> Phase: **1 — PWA Beta**  
> Target launch: September 2026

---

## Version History

| Version | Date       | Changes |
|---------|------------|---------|
| 0.1.0   | 2026-05-11 | First public beta. Multi-route planning (4 routes), feedback form (Formspree), dark mode fixes, search multi-select dropdowns, Info accordion, admin unlock, parking/bus stop POIs, animal photo support, uniform home tiles |
| 0.0.1   | 2026-05-10 | Initial developer preview. All core screens built, 165 animals, Dijkstra+TSP route, Google Maps integration, dark mode toggle |

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Vite + React |
| Styling | Tailwind CSS v4 (`@theme` CSS variables) |
| Routing | React Router v6 |
| Map | Google Maps API (`@react-google-maps/api`) |
| Data | Bundled JSON files (`src/data/`) |
| Images | Remotely hosted (Super Hosting) — not bundled |
| Deployment | GitHub → Vercel (auto-deploy from master) |
| Feedback | Formspree (`xnjwlody`) |

---

## Screens — Completion Status

| Screen | File | Status | Notes |
|---|---|---|---|
| Home | `pages/HomePage.jsx` | ✅ Done | Uniform 2×2 grid (dynamic animal count) + live RSS news |
| Map | `pages/MapPage.jsx` | ✅ Done | Satellite, animal/POI markers, 4 routes with selector + parking info, filter chips, live GPS, bottom sheet |
| Animals Hub | `pages/AnimalsHubPage.jsx` | ✅ Done | Type tiles + continent grid tabs, Bulgarian only |
| Animals List | `pages/AnimalsListPage.jsx` | ✅ Done | URL query param driven (`?type=` / `?continent=`), back button works |
| Animal Detail | `pages/AnimalDetailPage.jsx` | ✅ Done | Photo (with fallback), stats, IUCN, diet, habitat, mini-map + live distance |
| Search | `pages/SearchPage.jsx` | ✅ Done | Multi-select type + continent dropdowns, stays open on selection, OK to confirm |
| Info | `pages/InfoPage.jsx` | ✅ Done | Single-open accordion, hours, prices, transport, contacts, 2 entrance direction buttons |
| Settings | `pages/SettingsPage.jsx` | ✅ Done | Dark mode toggle, admin unlock (double-tap Beta), feedback form |
| Feedback | `components/FeedbackModal.jsx` | ✅ Done | Bug/feature/general form, auto-collects device info, Formspree backend |

---

## Components & Context

| Component | File | Status | Notes |
|---|---|---|---|
| Layout / Shell | `components/Layout/` | ✅ Done | App shell with bottom nav + floating feedback button |
| Bottom Nav | `components/Layout/BottomNav.jsx` | ✅ Done | 5 tabs: Home / Map / Animals / Search / Info / Settings |
| Animal Location Map | `components/AnimalLocationMap.jsx` | ✅ Done | Static satellite mini-map, directions button, live GPS distance |
| Maps Context | `context/MapsContext.jsx` | ✅ Done | Single `useJsApiLoader` at app level |
| Data Context | `context/DataContext.jsx` | ✅ Done | Provides `allAnimals`, `allPois`, `darkMode` |

---

## Data

| File | Status | Notes |
|---|---|---|
| `src/data/animals.json` | ✅ Done | **165 animals** — `id`, `nameBg`, `nameEn`, `species`, `lat`, `lng`, `diet`, `animalType`, `iucn`, `stats`, `habitat`, `continents[]`, `classification`, `photo` |
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

---

## Phase 2+ (Not Started)

- Native Android/iOS app (React Native / Expo)
- Backend API + admin panel (PHP/MySQL on Super Hosting)
- Apple Health / Google Fit sync
- Live Activities / push notifications
- Social sharing / virtual tour video generation
- Multi-language (English)
