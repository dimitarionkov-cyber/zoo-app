import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext'
import DistributionMap from '../components/DistributionMap'
import AnimalLocationMap from '../components/AnimalLocationMap'
import ErrorBoundary from '../components/ErrorBoundary'

// ── Font & colour tokens (Dossier-cards variant B) ────────────────────────────
const F = {
  display: "'Newsreader', Georgia, serif",
  body:    "'Manrope', system-ui, sans-serif",
  mono:    "'JetBrains Mono', 'Courier New', monospace",
}
const LIGHT = {
  paper: '#f4efe3', surface: '#fbf8ee',
  ink: '#1a1d14', ink2: '#44473c', ink3: '#847f6e', rule: '#d5cdb6',
  green: '#2f6b3d', greenDeep: '#1f4a2a', greenTint: '#e4ecdc',
  header: '#233d29', iucn: '#3a7a45',
}
const DARK = {
  paper: '#15170e', surface: '#1c1e13',
  ink: '#ece5d0', ink2: '#b3ad99', ink3: '#75725f', rule: '#2f3122',
  green: '#7eb888', greenDeep: '#c4ddc9', greenTint: '#1d2a1e',
  header: '#152a1a', iucn: '#2f6b3d',
}
const CREAM = '#f4efe3'

const STATS_META = [
  { key: 'lifespan', label: 'живот' },
  { key: 'weight',   label: 'тегло' },
  { key: 'length',   label: 'дължина' },
  { key: 'height',   label: 'височина' },
  { key: 'wingspan', label: 'размах на крила' },
]

const INFO_SECTIONS = [
  { key: 'habitat',         label: 'Местообитание' },
  { key: 'dietDescription', label: 'Храна' },
  { key: 'temperament',     label: 'Нрав' },
  { key: 'reproduction',    label: 'Размножаване' },
  { key: 'curiousFacts',    label: 'Любопитно' },
  { key: 'distribution',    label: 'Разпространение' },
]

const CONTINENT_LABELS = {
  africa: 'Африка', asia: 'Азия', australia: 'Австралия',
  europe: 'Европа', north_america: 'С. Америка', south_america: 'Ю. Америка',
}

// ── Gradient placeholder (deterministic per animal id, same scheme as list) ───
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

function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
function formatDist(m) {
  return m < 1000 ? `${Math.round(m)} м` : `${(m / 1000).toFixed(1)} км`
}

const BG_MONTHS = ['яну','фев','мар','апр','май','юни','юли','авг','сеп','окт','ное','дек']
function formatVisitDate(iso) {
  const d = new Date(iso)
  return `${d.getDate()} ${BG_MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

// ── One-time fade-in keyframe for the visited banner ──────────────────────────
let _fadeInjected = false
function ensureFadeIn() {
  if (_fadeInjected) return
  _fadeInjected = true
  const s = document.createElement('style')
  s.textContent = '@keyframes zoo-fade-in{from{opacity:0}to{opacity:1}}'
  document.head.appendChild(s)
}

// ── SVG icons ─────────────────────────────────────────────────────────────────
function BackSvg() {
  return <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m15 5-7 7 7 7"/></svg>
}
function HeartSvg({ filled }) {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20s-7-4.3-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.7-7 10-7 10z"/>
    </svg>
  )
}
function EyeSvg({ filled }) {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
}
function CheckSvg() {
  return <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
}
function ArrowSvg() {
  return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
}

export default function AnimalDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { allAnimals, darkMode, isFavorite, toggleFavorite, isVisited, toggleVisited, visited } = useData()
  const animal = allAnimals.find(a => a.id === id)
  const c = darkMode ? DARK : LIGHT

  const [distance, setDistance] = useState(null)
  const [geoError, setGeoError] = useState(false)

  useEffect(() => {
    if (!animal) return
    if (!navigator.geolocation) { setGeoError(true); return }
    navigator.geolocation.getCurrentPosition(
      pos => setDistance(haversine(pos.coords.latitude, pos.coords.longitude, animal.lat, animal.lng)),
      () => setGeoError(true),
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }, [animal?.id])

  ensureFadeIn()

  if (!animal) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#847f6e', padding: 32, textAlign: 'center' }}>
      Животното не е намерено
    </div>
  )

  const fav = isFavorite(animal.id)
  const vis = isVisited(animal.id)
  const grad = gradFor(animal.id)
  const facts = animal.stats ? STATS_META.filter(s => animal.stats[s.key]) : []
  const visibleSections = INFO_SECTIONS.filter(s => animal[s.key])
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${animal.lat},${animal.lng}&travelmode=walking`

  const eyebrowStyle = { fontFamily: F.mono, fontSize: 9.5, color: c.ink3, textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 500, margin: 0 }
  const iconBtnStyle = (on, kind) => ({
    width: 34, height: 34, borderRadius: '50%',
    background: kind === 'fav' && on ? '#e2637a' : kind === 'visit' && on ? c.green : 'rgba(244,239,227,0.14)',
    border: `1px solid ${kind === 'fav' && on ? '#e2637a' : kind === 'visit' && on ? c.green : 'rgba(244,239,227,0.18)'}`,
    color: kind === 'fav' && on ? '#fff' : kind === 'visit' && on ? '#0e1a11' : 'rgba(244,239,227,0.85)',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
  })

  return (
    <div style={{ fontFamily: F.body, background: c.paper, minHeight: '100%', paddingBottom: 24 }}>

      {/* ── Header — fixed brand green, never swaps to paper/ink ────────────── */}
      <div style={{ background: c.header, padding: '16px 18px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <button onClick={() => navigate(-1)} aria-label="Назад" style={iconBtnStyle(false)}>
            <BackSvg />
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => toggleFavorite(animal.id)} aria-label={fav ? 'Премахни от любими' : 'Добави в любими'} style={iconBtnStyle(fav, 'fav')}>
              <HeartSvg filled={fav} />
            </button>
            <button onClick={() => toggleVisited(animal.id)} aria-label={vis ? 'Премахни от видени' : 'Отбележи като видяно'} style={iconBtnStyle(vis, 'visit')}>
              <EyeSvg filled={vis} />
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
          <div>
            <h1 style={{ fontFamily: F.display, fontSize: 23, fontWeight: 600, letterSpacing: '-0.01em', textTransform: 'uppercase', color: CREAM, margin: 0, lineHeight: 1.15 }}>
              {animal.nameBg}
            </h1>
            {animal.nameEn && (
              <p style={{ fontFamily: F.body, fontSize: 13, fontWeight: 600, color: 'rgba(244,239,227,0.8)', margin: '2px 0 0' }}>
                {animal.nameEn}
              </p>
            )}
            <p style={{ fontFamily: F.display, fontSize: 12, fontStyle: 'italic', color: 'rgba(244,239,227,0.55)', margin: '2px 0 0' }}>
              {animal.species}
            </p>
          </div>

          {animal.classification && (
            <div style={{ fontFamily: F.mono, fontSize: 9, color: 'rgba(244,239,227,0.6)', letterSpacing: '0.08em', lineHeight: 1.7, textAlign: 'right', flexShrink: 0, whiteSpace: 'nowrap' }}>
              <div>Сем. {animal.classification.family}</div>
              <div>Разред {animal.classification.order}</div>
              <div>Клас {animal.classification.class}</div>
            </div>
          )}
        </div>
      </div>

      {/* ── Visited banner ────────────────────────────────────────────────── */}
      {vis && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: c.greenTint, color: c.greenDeep, animation: 'zoo-fade-in 0.25s ease' }}>
          <CheckSvg />
          <span style={{ fontFamily: F.mono, fontSize: 10, letterSpacing: '0.08em' }}>
            Видяно на {formatVisitDate(visited[animal.id])}
          </span>
        </div>
      )}

      {/* ── Art placeholder / photo ───────────────────────────────────────── */}
      <div style={{
        height: 190, position: 'relative', overflow: 'hidden',
        background: animal.photo ? c.surface : `radial-gradient(ellipse at 30% 25%, rgba(255,255,255,0.18), transparent 55%), linear-gradient(150deg, ${grad.a} 0%, ${grad.b} 100%)`,
      }}>
        {animal.photo ? (
          <img src={animal.photo} alt={animal.nameBg} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ position: 'absolute', left: 10, bottom: 8, fontFamily: F.mono, fontSize: 8, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)' }}>
            снимка · животно
          </span>
        )}
      </div>

      {/* ── IUCN status strip ─────────────────────────────────────────────── */}
      {animal.iucn && (
        <div style={{ background: c.iucn, padding: '10px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: F.mono, fontSize: 9, color: 'rgba(244,239,227,0.7)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>IUCN статус</div>
            <div style={{ fontFamily: F.display, fontSize: 13, fontWeight: 600, color: CREAM, marginTop: 1 }}>{animal.iucn.labelBg}</div>
          </div>
          <div style={{ fontFamily: F.body, fontSize: 12, color: 'rgba(244,239,227,0.75)', textAlign: 'right' }}>{animal.iucn.labelEn}</div>
        </div>
      )}

      {/* ── Scrollable body ───────────────────────────────────────────────── */}
      <div style={{ padding: '14px 18px 24px' }}>

        {/* Stat grid 2x2 */}
        {facts.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
            {facts.map(({ key, label }) => (
              <div key={key} style={{ background: c.surface, border: `1px solid ${c.rule}`, borderRadius: 12, padding: '9px 10px' }}>
                <div style={{ fontFamily: F.display, fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em', color: c.ink }}>{animal.stats[key]}</div>
                <div style={{ fontFamily: F.mono, fontSize: 8.5, color: c.ink3, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Dossier cards */}
        {visibleSections.map(({ key, label }) => (
          <div key={key} style={{ background: c.surface, border: `1px solid ${c.rule}`, borderRadius: 14, padding: '12px 14px', marginBottom: 10 }}>
            <p style={eyebrowStyle}>{label}</p>
            <p style={{ fontFamily: F.body, fontSize: 12.5, lineHeight: 1.5, color: c.ink2, margin: '4px 0 0' }}>{animal[key]}</p>
          </div>
        ))}
        {visibleSections.length === 0 && (
          <p style={{ fontSize: 12.5, lineHeight: 1.5, color: c.ink3, fontStyle: 'italic', margin: '0 0 10px' }}>
            Описанието предстои…
          </p>
        )}

        {/* Distribution map + region pills */}
        {animal.distributionCountries?.length > 0 && (
          <div style={{ background: c.surface, border: `1px solid ${c.rule}`, borderRadius: 14, overflow: 'hidden', marginBottom: 10 }}>
            <ErrorBoundary fallback={null}>
              <DistributionMap countryIds={animal.distributionCountries} />
            </ErrorBoundary>
            {animal.continents?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '10px 12px 12px' }}>
                {animal.continents.map(cid => (
                  <span key={cid} style={{ fontFamily: F.body, fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 999, background: c.greenTint, color: c.greenDeep }}>
                    {CONTINENT_LABELS[cid] ?? cid}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Location card — satellite map + footer (no button, CTA is separate below) */}
        <div style={{ background: c.surface, border: `1px solid ${c.rule}`, borderRadius: 14, overflow: 'hidden', marginBottom: 10 }}>
          <ErrorBoundary fallback={null}>
            <AnimalLocationMap animal={animal} distance={distance} geoError={geoError} />
          </ErrorBoundary>
        </div>

        {/* Directions CTA */}
        <a
          href={mapsUrl}
          target="_blank"
          rel="noreferrer"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, background: c.ink, color: c.paper, borderRadius: 14, padding: '14px 18px', textDecoration: 'none' }}
        >
          <div>
            <div style={{ fontFamily: F.display, fontSize: 15, fontWeight: 500 }}>Упътване до клетката</div>
            <div style={{ fontFamily: F.mono, fontSize: 9, color: darkMode ? 'rgba(21,23,14,0.6)' : 'rgba(244,239,227,0.6)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 2 }}>
              {distance != null ? `${formatDist(distance)} · пеша` : geoError ? 'локацията не е налична' : 'изчислява се…'}
            </div>
          </div>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: c.green, color: darkMode ? '#11140d' : c.paper, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ArrowSvg />
          </div>
        </a>
      </div>
    </div>
  )
}
