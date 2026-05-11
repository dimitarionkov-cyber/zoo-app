# Upcoming Tasks — Зоопарк София PWA

> Read alongside `PROJECT_STATUS.md` for full context.

---

## Version History

| Version | Date       | Changes |
|---------|------------|---------|
| 0.1.0   | 2026-05-11 | Added visit recording, AR navigation features; marked recommended routes as done; updated known issues |
| 0.0.1   | 2026-05-10 | Initial backlog created |

---

## Priority 1 — Polish / Quick Wins

- [ ] **Animal photos** — Collect photos during zoo visit. Display at top of `AnimalDetailPage` (field `photo` already supported). Host on Super Hosting. *(Blocker for visual polish)*
- [ ] **Home hero image** — Replace 🐾 emoji with a real zoo banner photo.
- [ ] **PWA manifest icons** — Generate full icon set (192×192, 512×512, maskable) with zoo branding instead of defaults.
- [ ] **Google Maps API key** — Restrict to production domain (`zoo-app-navy.vercel.app` / custom domain). Currently unrestricted.
- [ ] **Custom domain** — e.g. `zoosofia.app`. Point to Vercel deployment.

---

## Priority 2 — Core Missing Features

### Favorites
- [ ] `localStorage` persist for favorited animal IDs
- [ ] Heart icon on animal card and detail page
- [ ] "Любими" section on Animals Hub or Home
- [ ] Filter by favorites on Search page

### Food / Amenities Page
- [ ] Dedicated `/food` page listing POIs with `category: 'food'`
- [ ] Each item: name, opening hours, distance from user (haversine), directions button
- [ ] Add to bottom nav or merge into Info page tabs

### Visit Recording
- [ ] "Mark as seen" button on `AnimalDetailPage`
- [ ] Visit log stored in `localStorage` (list of seen animal IDs + timestamps)
- [ ] Optional: add personal photo and note per animal
- [ ] Visit summary screen (how many seen, which ones, map overlay)
- [ ] Links naturally with Favorites feature

### Visit Planner
- [ ] Date picker → fetch 7-day weather (Open-Meteo free API, no key needed)
- [ ] Select animals/POIs to visit → generate optimal sub-route
- [ ] Estimated total walking time
- [ ] "Add to Calendar" (`.ics` download)

---

## Priority 3 — Content & Data

- [ ] **More animal data** — Fill missing `stats` (lifespan, weight) for animals with empty fields.
- [ ] **More animal habitats** — Several animals have empty `habitat` field.
- [ ] **POI data** — Verify opening hours for food POIs; add prices if available.
- [ ] **Activities / events page** — RSS already on Home; consider dedicated `/activities` page with more posts.
- [ ] **Map enclosures** — Draw enclosure polygons as map overlay (low priority, visual only).
- [ ] **WC markers** — No WC POIs in `pois.json` yet; add from OSM or manual survey.

---

## Priority 4 — Infrastructure & Distribution

- [ ] **Analytics** — Add Plausible or simple counter to measure installs/page views before pitching to zoo.
- [ ] **allorigins CORS proxy** — Third-party RSS proxy (`allorigins.win`) could break. Consider proxying via own endpoint on Super Hosting.
- [ ] **Lazy loading** — Bundle is ~690 kB (gzipped 194 kB). Lazy-load `MapPage` and `AnimalDetailPage` with `React.lazy` to reduce initial load.
- [ ] **Offline support** — Service worker currently caches shell but not animal data. Pre-cache `animals.json` and `pois.json`.

---

## Future Features (Phase 2+)

### AR Navigation *(saved idea)*
- Camera view with virtual path line overlaid on the floor, following the active route
- Requires native app shell (iOS/Android) — PWA camera + DeviceOrientation APIs too limited
- Strong differentiator for the pitch to Sofia Zoo

### Walk Recording
- GPS trace during visit
- Geo-triggered photo reminders near each animal
- Post-walk summary (distance, time, animals seen)
- Potential: generate a video/reel from map + photos (Relive-style)

### Native App (React Native / Expo)
- Android-first (largest local audience)
- Port all PWA screens
- Apple Health / Google Fit walk sync
- Push notifications (events, new animals)
- Google Play + App Store listings (Expo EAS cloud build — no Mac needed)

### Pitch / Sale Prep
- [ ] Record a demo video of the full app flow
- [ ] Build a simple landing page
- [ ] Track install count + session duration as social proof
- [ ] Draft a proposal doc for Sofia Zoo administration
- [ ] Research the decision-maker at Sofia Zoo

---

## Known Issues / Technical Debt

| Issue | Severity | Notes |
|---|---|---|
| Animal images missing for 164/165 animals | High | App looks sparse. Photo sprint needed after zoo visit. |
| `allorigins.win` CORS proxy for RSS | Medium | Third-party. Could break at any time. |
| Bundle size ~690 kB (gzipped 194 kB) | Low | Vite warns >500 kB. Use `React.lazy` for MapPage + AnimalDetailPage. |
| No error boundary on MapPage | Low | Google Maps load failure shows plain error string. Wrap in `<ErrorBoundary>`. |
| No offline caching for JSON data | Medium | Service worker caches shell only. Pre-cache data files. |
| Google Maps API key unrestricted | Medium | Restrict to production domain before wider sharing. |
