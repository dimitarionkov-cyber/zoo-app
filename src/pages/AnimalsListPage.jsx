import { useState, useMemo, useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useData } from '../context/DataContext'

// ── Font & colour tokens (from Zoo App Dashboard Hi-Fi spec) ──────────────────
const F = {
  display: "'Newsreader', Georgia, serif",
  body:    "'Manrope', system-ui, sans-serif",
  mono:    "'JetBrains Mono', 'Courier New', monospace",
}
const LIGHT = {
  paper: '#f4efe3', paper2: '#ebe4d1', surface: '#fbf8ee',
  ink: '#1a1d14', ink2: '#44473c', ink3: '#847f6e', rule: '#d5cdb6',
  green: '#2f6b3d', greenDeep: '#1f4a2a', greenTint: '#e4ecdc',
}
const DARK = {
  paper: '#15170e', paper2: '#1e2014', surface: '#1c1e13',
  ink: '#ece5d0', ink2: '#b3ad99', ink3: '#75725f', rule: '#2f3122',
  green: '#7eb888', greenDeep: '#c4ddc9', greenTint: '#1d2a1e',
}

const TYPE_CHIPS = [
  { value: null,            label: 'Всички' },
  { value: 'бозайник',      label: 'Бозайници' },
  { value: 'птица',         label: 'Птици' },
  { value: 'влечуго',       label: 'Влечуги' },
  { value: 'риба',          label: 'Риби' },
  { value: 'земноводно',    label: 'Земноводни' },
  { value: 'безгръбначно',  label: 'Безгръбначни' },
]

const CONTINENT_LABELS = {
  africa: 'Африка', asia: 'Азия', australia: 'Австралия',
  europe: 'Европа', north_america: 'С. Америка', south_america: 'Ю. Америка',
}

// ── Gradient placeholders (deterministic per animal id) ───────────────────────
const GRADS = [
  { a: '#c98c4a', b: '#6b3d1e' },
  { a: '#8b6a4a', b: '#3b2a1d' },
  { a: '#7a9aa1', b: '#3b5b62' },
  { a: '#b5604a', b: '#5a2918' },
  { a: '#8b9a76', b: '#4d5a3c' },
  { a: '#d4a85f', b: '#7a5e2a' },
]
function gradFor(id) {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  return GRADS[hash % GRADS.length]
}

// ── Distance ──────────────────────────────────────────────────────────────────
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
function walkMinutes(m) {
  return Math.max(1, Math.round(m / 80)) // ~80 m/min walking pace
}

// ── SVG icons ─────────────────────────────────────────────────────────────────
function SearchSvg() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="6"/>
      <path d="m20 20-4.5-4.5"/>
    </svg>
  )
}

// ── Row ───────────────────────────────────────────────────────────────────────
function AnimalRow({ animal, c, dist, isFav, isVis, onToggleFav }) {
  const grad = gradFor(animal.id)
  const region = CONTINENT_LABELS[(animal.continents || [])[0]] ?? null

  return (
    <Link
      to={`/animals/${animal.id}`}
      style={{ display: 'flex', alignItems: 'center', gap: 12, background: c.surface, border: `1px solid ${c.rule}`, borderRadius: 14, padding: 10, textDecoration: 'none' }}
    >
      <div style={{
        width: 56, height: 56, borderRadius: 12, flexShrink: 0, position: 'relative', overflow: 'hidden',
        background: animal.photo ? c.paper2 : `radial-gradient(ellipse at 30% 25%, rgba(255,255,255,0.18), transparent 55%), linear-gradient(150deg, ${grad.a} 0%, ${grad.b} 100%)`,
      }}>
        {animal.photo && (
          <img src={animal.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: F.display, fontSize: 17, fontWeight: 500, letterSpacing: '-0.01em', color: c.ink, lineHeight: 1.15, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {animal.nameBg}
        </p>
        <p style={{ fontFamily: F.display, fontSize: 11, fontStyle: 'italic', color: c.ink3, margin: '2px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {animal.species}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          {isVis && <span style={{ fontSize: 11, lineHeight: 1 }} title="Видяно">✅</span>}
          <button
            onClick={e => { e.preventDefault(); e.stopPropagation(); onToggleFav() }}
            aria-label={isFav ? 'Премахни от любими' : 'Добави в любими'}
            style={{ fontSize: 14, lineHeight: 1, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
          >
            {isFav ? '❤️' : '🤍'}
          </button>
        </div>
        {region && (
          <span style={{ fontFamily: F.mono, fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '3px 7px', borderRadius: 999, background: c.paper2, color: c.ink2 }}>
            {region}
          </span>
        )}
        {dist != null && (
          <span style={{ fontFamily: F.mono, fontSize: 10, color: c.ink3 }}>{dist} мин</span>
        )}
      </div>
    </Link>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AnimalsListPage() {
  const [searchParams] = useSearchParams()
  const { allAnimals, darkMode, isFavorite, toggleFavorite, isVisited } = useData()
  const c = darkMode ? DARK : LIGHT

  const [query,         setQuery]         = useState(searchParams.get('q') || '')
  const [activeType,    setActiveType]    = useState(searchParams.get('type') || null)
  const [favoritesOnly, setFavoritesOnly] = useState(searchParams.get('favorites') === '1')

  const [sortByDist, setSortByDist] = useState(false)
  const [userPos,    setUserPos]    = useState(null)
  const [gpsState,   setGpsState]   = useState('idle') // idle|loading|ok|error
  const watchIdRef = useRef(null)

  useEffect(() => {
    if (!sortByDist) {
      if (watchIdRef.current != null) { navigator.geolocation.clearWatch(watchIdRef.current); watchIdRef.current = null }
      return
    }
    if (!navigator.geolocation) { setGpsState('error'); setSortByDist(false); return }
    setGpsState('loading')
    watchIdRef.current = navigator.geolocation.watchPosition(
      pos => { setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setGpsState('ok') },
      () => { setGpsState('error'); setSortByDist(false) },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    )
    return () => { if (watchIdRef.current != null) { navigator.geolocation.clearWatch(watchIdRef.current); watchIdRef.current = null } }
  }, [sortByDist])

  const typeCounts = useMemo(() => {
    const counts = {}
    allAnimals.forEach(a => { counts[a.animalType] = (counts[a.animalType] || 0) + 1 })
    return counts
  }, [allAnimals])

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return allAnimals.filter(a => {
      const matchesType      = !activeType || a.animalType === activeType
      const matchesFavorites = !favoritesOnly || isFavorite(a.id)
      const matchesQuery     = !q ||
        a.nameBg.toLowerCase().includes(q) ||
        a.nameEn.toLowerCase().includes(q) ||
        (a.species || '').toLowerCase().includes(q)
      return matchesType && matchesFavorites && matchesQuery
    })
  }, [allAnimals, activeType, favoritesOnly, query, isFavorite])

  const sorted = useMemo(() => {
    const withDist = filtered.map(a => ({
      ...a,
      _dist: userPos ? haversine(userPos.lat, userPos.lng, a.lat, a.lng) : null,
    }))
    return withDist.sort((a, b) => {
      if (sortByDist && a._dist != null && b._dist != null) return a._dist - b._dist
      return a.nameBg.localeCompare(b.nameBg, 'bg')
    })
  }, [filtered, userPos, sortByDist])

  return (
    <div style={{ background: c.paper, minHeight: '100%', paddingBottom: 90, fontFamily: F.body }}>
      <div style={{ padding: '6px 18px 14px' }}>

        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0 12px' }}>
          <div>
            <p style={{ fontFamily: F.mono, fontSize: 10, color: c.ink3, textTransform: 'uppercase', letterSpacing: '0.16em', fontWeight: 500, margin: 0 }}>
              обитатели
            </p>
            <p style={{ fontFamily: F.display, fontSize: 30, fontWeight: 500, letterSpacing: '-0.015em', lineHeight: 1, fontStyle: 'italic', color: c.ink, margin: '4px 0 0' }}>
              Животните
            </p>
          </div>
          <p style={{ fontFamily: F.mono, fontSize: 10, color: c.ink3, letterSpacing: '0.14em', textTransform: 'uppercase', margin: 0 }}>
            {allAnimals.length} вида
          </p>
        </div>

        {/* Search + favorites + GPS row */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, background: c.surface, border: `1px solid ${c.rule}`, borderRadius: 12, padding: '11px 14px' }}>
            <span style={{ color: c.ink3, display: 'inline-flex', flexShrink: 0 }}><SearchSvg /></span>
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Търси по вид или род…"
              style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', fontFamily: F.body, fontSize: 14, color: c.ink }}
            />
          </div>

          <button
            onClick={() => setFavoritesOnly(v => !v)}
            aria-pressed={favoritesOnly}
            aria-label="Само любими"
            style={{
              width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
              background: favoritesOnly ? c.ink : c.surface,
              border: `1px solid ${favoritesOnly ? c.ink : c.rule}`,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
            }}
          >
            {favoritesOnly ? '❤️' : '🤍'}
          </button>

          <button
            onClick={() => gpsState !== 'error' && setSortByDist(v => !v)}
            disabled={gpsState === 'error'}
            aria-pressed={sortByDist}
            aria-label="Сортирай по разстояние"
            style={{
              width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
              background: sortByDist ? c.ink : c.surface,
              color: sortByDist ? c.paper : c.ink,
              border: `1px solid ${sortByDist ? c.ink : c.rule}`,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
              opacity: gpsState === 'error' ? 0.4 : 1,
            }}
          >
            {gpsState === 'loading' ? '⏳' : '📍'}
          </button>
        </div>

        {/* Filter chip strip */}
        <div style={{ display: 'flex', gap: 6, margin: '0 -18px 12px', padding: '0 18px 2px', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {TYPE_CHIPS.map(chip => {
            const count = chip.value ? (typeCounts[chip.value] || 0) : allAnimals.length
            if (chip.value && count === 0) return null
            const on = activeType === chip.value
            return (
              <button
                key={chip.label}
                onClick={() => setActiveType(chip.value)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 11px', borderRadius: 999,
                  border: `1px solid ${on ? c.ink : c.rule}`, background: on ? c.ink : c.surface,
                  fontSize: 12, fontWeight: 600, color: on ? c.paper : c.ink2, whiteSpace: 'nowrap', fontFamily: F.body,
                }}
              >
                {chip.label}
                <span style={{ fontFamily: F.mono, fontWeight: 500, opacity: 0.65, fontSize: 10 }}>{count}</span>
              </button>
            )
          })}
        </div>

        {/* List */}
        {sorted.length === 0 ? (
          <p style={{ textAlign: 'center', color: c.ink3, marginTop: 48, fontSize: 14 }}>
            {favoritesOnly ? 'Все още нямате любими животни' : 'Няма намерени животни'}
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 6 }}>
            {sorted.map((animal, i) => (
              <AnimalRow
                key={`${animal.id}_${i}`}
                animal={animal}
                c={c}
                dist={animal._dist != null ? walkMinutes(animal._dist) : null}
                isFav={isFavorite(animal.id)}
                isVis={isVisited(animal.id)}
                onToggleFav={() => toggleFavorite(animal.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
