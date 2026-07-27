# Upcoming Tasks — Зоопарк София PWA

> Read alongside `PROJECT_STATUS.md` for full context.

---

## Version History

| Version | Date       | Changes |
|---------|------------|---------|
| 0.2.1   | 2026-07-26 | Cloud sync for favorites/visited/visit-sessions via Supabase (anonymous auth by default, optional email-link recovery on a new device or after clearing storage) |
| 0.2.0   | 2026-07-26 | Favorites + Visit Recording core shipped, including a visit-session flow (Start/Current/End visit, live checklist, last-visit recap); Home, Animals list, and Animal Detail redesigned to the paper/ink Hi-Fi spec (Dossier-cards variant); Animals Hub + Search retired into one unified screen; fixed duplicate animal ID and React 19 map crash; added `staging` pre-production branch |
| 0.1.0   | 2026-05-11 | Added visit recording, AR navigation features; marked recommended routes as done; updated known issues |
| 0.0.1   | 2026-05-10 | Initial backlog created |

---

## Data Persistence & Sync ✅ Done
- [x] Anonymous Supabase auth on first load — no signup required for normal use
- [x] `zoo_progress` table (favorites, visited, active/last visit) synced per device, protected by row-level security
- [x] Merge-on-connect (union of local + remote) so nothing is lost when a session first syncs
- [x] Optional "Запази прогреса си" in Settings — links an email to the anonymous account (or signs into an existing one) via magic link, so progress survives a cleared cache or a new device
- [ ] Not yet handled: explicit sign-out / "use a different account" affordance once linked
- [ ] Not yet handled: what happens if the same email is linked on two devices that both have *different* local data before their first sync — first-merge-wins per device, not a true 3-way merge
- [ ] **Branded auth emails** — currently sent via Supabase's default shared mailer ("Supabase Auth <noreply@mail.app.supabase.io>"), which reads as spammy and can't be customized (subject/body/sender all locked) without Custom SMTP. Needs: a domain (user has one, not yet wired up), an SMTP provider (Resend recommended), then the templates can use the drafted copy — subject "Потвърди имейла си за Sofia Zoo", body confirming the email protects favorites/visited progress

---

## Priority 1 — Polish / Quick Wins

- [ ] **Animal photos** — Collect photos during zoo visit. Display at top of `AnimalDetailPage` (field `photo` already supported). Host on Super Hosting. *(Blocker for visual polish)*
- [ ] **Home hero image** — Replace 🐾 emoji with a real zoo banner photo.
- [ ] **PWA manifest icons** — Generate full icon set (192×192, 512×512, maskable) with zoo branding instead of defaults.
- [ ] **Google Maps API key** — Restrict to production domain (`zoo-app-navy.vercel.app` / custom domain). Currently unrestricted.
- [ ] **Custom domain** — e.g. `zoosofia.app`. Point to Vercel deployment.

---

## Priority 2 — Core Missing Features

### Favorites ✅ Done
- [x] `localStorage` persist for favorited animal IDs
- [x] Heart icon on animal card and detail page
- [x] Favorites-only toggle on the unified Animals screen (Hub's "Любими" card superseded by this after Hub/Search merged into one screen)
- [x] Filter by favorites (now on the unified Animals screen, since standalone Search was retired)

### Food / Amenities Page
- [ ] Dedicated `/food` page listing POIs with `category: 'food'`
- [ ] Each item: name, opening hours, distance from user (haversine), directions button
- [ ] Add to bottom nav or merge into Info page tabs

### Visit Recording ✅ Done (except optional photo/note)
- [x] "Mark as seen" (visited) toggle on `AnimalDetailPage`, list rows, and search results
- [x] Visit log stored in `localStorage` (animal ID → timestamp), shown as a banner/date on detail
- [ ] Optional: add personal photo and note per animal
- [x] Visit summary screen — `/visited`, linked from Settings ("Моят напредък"): progress bar, satellite overview map with a pin per visited animal, sorted list (most recent first)
- [x] Links naturally with Favorites feature — both live in `DataContext`, same UI pattern
- [x] **Visit session flow** — Home banner ("Започни посещение" → "Текущо посещение"), `/visit` live checklist page (elapsed time, animals seen since start, shortcuts to Animals/Map, End Visit), and a last-visit recap card at the top of `/visited` (duration + count for that specific session)
- [x] Re-tapping "mark as seen" on an animal already visited on a *previous* trip now refreshes its timestamp for the *current* visit instead of un-marking it; a second tap within the same active visit still correctly un-marks

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
| Animal images missing for 163/164 animals | High | App looks sparse. Photo sprint needed after zoo visit. |
| `allorigins.win` CORS proxy for RSS | Medium | Third-party. Could break at any time. |
| Bundle size ~690 kB (gzipped 194 kB) | Low | Vite warns >500 kB. Use `React.lazy` for MapPage + AnimalDetailPage. |
| No error boundary on MapPage | Low | Google Maps load failure shows plain error string. Wrap in `<ErrorBoundary>`. |
| No offline caching for JSON data | Medium | Service worker caches shell only. Pre-cache data files. |
| Google Maps API key unrestricted | Medium | Restrict to production domain before wider sharing. |
