import { useParams, useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext'
import DistributionMap from '../components/DistributionMap'
import AnimalLocationMap from '../components/AnimalLocationMap'
import ErrorBoundary from '../components/ErrorBoundary'

// ── Font & colour tokens (from Zoo App Dashboard Hi-Fi spec) ──────────────────
const F = {
  display: "'Newsreader', Georgia, serif",
  body:    "'Manrope', system-ui, sans-serif",
  mono:    "'JetBrains Mono', 'Courier New', monospace",
}
const LIGHT = {
  paper: '#f4efe3', surface: '#fbf8ee',
  ink: '#1a1d14', ink2: '#44473c', ink3: '#847f6e', rule: '#d5cdb6',
  green: '#2f6b3d', greenDeep: '#1f4a2a', greenTint: '#e4ecdc', greenTintBorder: '#b9cdaa',
  rose: '#b54a3e', amber: '#d9a441',
}
const DARK = {
  paper: '#15170e', surface: '#1c1e13',
  ink: '#ece5d0', ink2: '#b3ad99', ink3: '#75725f', rule: '#2f3122',
  green: '#7eb888', greenDeep: '#c4ddc9', greenTint: '#1f2c1f', greenTintBorder: '#2c3d2e',
  rose: '#e08778', amber: '#e0b35e',
}

const IUCN_LABEL = {
  LC: 'Слабо засегнат', NT: 'Близо застрашен', VU: 'Уязвим',
  EN: 'Застрашен', CR: 'Критично застрашен', EW: 'Изчезнал в природата', EX: 'Изчезнал',
}

const STATS_META = [
  { key: 'lifespan', label: 'живот' },
  { key: 'weight',   label: 'тегло' },
  { key: 'length',   label: 'дължина' },
  { key: 'height',   label: 'височина' },
]

const INFO_SECTIONS = [
  { key: 'habitat',         label: 'Местообитание' },
  { key: 'dietDescription', label: 'Храна' },
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

const BG_MONTHS = ['яну','фев','мар','апр','май','юни','юли','авг','сеп','окт','ное','дек']
function formatVisitDate(iso) {
  const d = new Date(iso)
  return `${d.getDate()} ${BG_MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

// ── Today's feeding-time lookup (mirrors the schedule shown on Home/Днес) ─────
const FEEDINGS = [
  [{ e: '🐧', t: 'пингвини', time: '11:00' }, { e: '🦭', t: 'тюлени', time: '14:00' }, { e: '🦁', t: 'лъвове', time: '16:00' }],
  [{ e: '🐧', t: 'пингвини', time: '11:00' }, { e: '🦦', t: 'видри',  time: '14:30' }, { e: '🦁', t: 'лъвове', time: '16:00' }],
  [{ e: '🐧', t: 'пингвини', time: '11:00' }, { e: '🦦', t: 'видри',  time: '14:30' }, { e: '🦁', t: 'лъвове', time: '16:00' }],
  [{ e: '🐧', t: 'пингвини', time: '11:00' }, { e: '🦦', t: 'видри',  time: '14:30' }, { e: '🦁', t: 'лъвове', time: '16:00' }],
  [{ e: '🐧', t: 'пингвини', time: '11:00' }, { e: '🦭', t: 'тюлени', time: '14:00' }, { e: '🐻', t: 'мечки',  time: '16:00' }],
  [{ e: '🐧', t: 'пингвини', time: '11:00' }, { e: '🦦', t: 'видри',  time: '14:30' }, { e: '🦁', t: 'лъвове', time: '16:00' }],
  [{ e: '🐧', t: 'пингвини', time: '11:00' }, { e: '🦦', t: 'видри',  time: '14:30' }, { e: '🐻', t: 'мечки',  time: '16:00' }],
]
const FEEDING_STEMS = { 'пингвини': 'пингвин', 'тюлени': 'тюлен', 'лъвове': 'лъв', 'видри': 'видр', 'мечки': 'мечк' }
function todaysFeeding(animal) {
  const todays = FEEDINGS[new Date().getDay()]
  const name = animal.nameBg.toLowerCase()
  return todays.find(f => name.includes(FEEDING_STEMS[f.t])) ?? null
}

// ── SVG icons ─────────────────────────────────────────────────────────────────
function BackSvg() {
  return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="m15 5-7 7 7 7"/></svg>
}
function HeartSvg({ filled }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20s-7-4.3-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.7-7 10-7 10z"/>
    </svg>
  )
}
function ClockSvg() {
  return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 8v4l3 2"/></svg>
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

  if (!animal) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: c.ink3, padding: 32, textAlign: 'center' }}>
      Животното не е намерено
    </div>
  )

  const fav = isFavorite(animal.id)
  const vis = isVisited(animal.id)
  const region = CONTINENT_LABELS[(animal.continents || [])[0]] ?? null
  const iucnColor = animal.iucn
    ? (['CR', 'EW', 'EX'].includes(animal.iucn.code) ? c.rose : ['VU', 'EN'].includes(animal.iucn.code) ? c.amber : c.green)
    : null

  const facts = []
  if (animal.stats) STATS_META.forEach(({ key, label }) => { if (animal.stats[key]) facts.push({ v: animal.stats[key], k: label }) })
  if (animal.iucn) facts.push({ v: animal.iucn.code, k: 'статус', color: iucnColor })

  const visibleSections = INFO_SECTIONS.filter(s => animal[s.key])
  const feeding = todaysFeeding(animal)
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${animal.lat},${animal.lng}&travelmode=walking`
  const grad = gradFor(animal.id)

  const eyebrowStyle = { fontFamily: F.mono, fontSize: 10, color: c.ink3, textTransform: 'uppercase', letterSpacing: '0.16em', fontWeight: 500, margin: 0 }
  const ibStyle = {
    width: 38, height: 38, borderRadius: '50%',
    background: darkMode ? 'rgba(21,23,14,0.55)' : 'rgba(244,239,227,0.92)',
    border: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.4)'}`,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    backdropFilter: 'blur(8px)', cursor: 'pointer',
  }

  return (
    <div style={{ fontFamily: F.body, background: c.paper, minHeight: '100%', paddingBottom: 24 }}>

      {/* Hero photo */}
      <div style={{
        height: 320, position: 'relative', overflow: 'hidden',
        background: animal.photo ? undefined : `radial-gradient(ellipse at 30% 25%, rgba(255,255,255,0.18), transparent 55%), linear-gradient(150deg, ${grad.a} 0%, ${grad.b} 100%)`,
      }}>
        {animal.photo && (
          <img src={animal.photo} alt={animal.nameBg} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '16px 18px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => navigate(-1)} aria-label="Назад" style={{ ...ibStyle, color: c.ink }}>
            <BackSvg />
          </button>
          <button
            onClick={() => toggleFavorite(animal.id)}
            aria-label={fav ? 'Премахни от любими' : 'Добави в любими'}
            style={{ ...ibStyle, color: c.rose }}
          >
            <HeartSvg filled={fav} />
          </button>
        </div>
      </div>

      {/* Sheet */}
      <div style={{ background: c.paper, marginTop: -22, borderRadius: '22px 22px 0 0', position: 'relative', zIndex: 2, padding: '14px 18px 24px' }}>

        {/* Eyebrow row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
          <span style={eyebrowStyle}>{animal.animalType}</span>
          {region && (<><span style={{ width: 3, height: 3, borderRadius: '50%', background: c.ink3 }} /><span style={eyebrowStyle}>{region}</span></>)}
          {animal.iucn && (<><span style={{ width: 3, height: 3, borderRadius: '50%', background: c.ink3 }} /><span style={{ ...eyebrowStyle, color: c.rose }}>{animal.iucn.code}</span></>)}
        </div>

        {/* Name */}
        <h1 style={{ fontFamily: F.display, fontSize: 34, fontWeight: 500, fontStyle: 'italic', letterSpacing: '-0.015em', lineHeight: 1, color: c.ink, margin: '6px 0 4px' }}>
          {animal.nameBg}
        </h1>
        <p style={{ fontFamily: F.display, fontStyle: 'italic', fontSize: 13, color: c.ink3, margin: 0 }}>
          {animal.species}
        </p>
        {animal.classification && (
          <p style={{ fontSize: 11, color: c.ink3, margin: '4px 0 0' }}>
            Сем. {animal.classification.family} · Разред {animal.classification.order} · Клас {animal.classification.class}
          </p>
        )}

        {/* Visited toggle */}
        <button
          onClick={() => toggleVisited(animal.id)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 10, padding: '6px 12px', borderRadius: 999,
            border: `1px solid ${c.rule}`, background: c.surface, fontSize: 11, fontWeight: 600, color: c.ink,
            fontFamily: F.body, cursor: 'pointer',
          }}
        >
          {vis ? `✅ Видяно на ${formatVisitDate(visited[animal.id])}` : '👁️ Отбележи като видяно'}
        </button>

        {/* Facts grid */}
        {facts.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, margin: '14px 0' }}>
            {facts.map((f, i) => (
              <div key={i} style={{ background: c.surface, border: `1px solid ${c.rule}`, borderRadius: 12, padding: '10px 8px', textAlign: 'center' }}>
                <div style={{ fontFamily: F.display, fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em', color: f.color ?? c.ink }}>{f.v}</div>
                <div style={{ fontFamily: F.mono, fontSize: 9, color: c.ink3, letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: 2 }}>{f.k}</div>
              </div>
            ))}
          </div>
        )}

        {/* Diet + type chips */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
          <span style={{ fontFamily: F.mono, fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '4px 9px', borderRadius: 999, background: c.surface, border: `1px solid ${c.rule}`, color: c.ink2 }}>
            {animal.diet}
          </span>
        </div>

        {/* Description sections */}
        {visibleSections.length > 0 ? (
          visibleSections.map(({ key, label }) => (
            <div key={key} style={{ marginBottom: 14 }}>
              <p style={eyebrowStyle}>{label}</p>
              <p style={{ fontSize: 13.5, lineHeight: 1.55, color: c.ink2, margin: '4px 0 0' }}>{animal[key]}</p>
            </div>
          ))
        ) : (
          <p style={{ fontSize: 13.5, lineHeight: 1.55, color: c.ink3, fontStyle: 'italic', margin: '0 0 14px' }}>
            Описанието предстои…
          </p>
        )}

        {/* Feeding-time card */}
        {feeding && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: c.greenTint, border: `1px solid ${c.greenTintBorder}`, borderRadius: 14, padding: '10px 12px', marginBottom: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: c.green, color: darkMode ? '#15170e' : '#f8f4e6', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ClockSvg />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: F.display, fontWeight: 500, fontSize: 15, color: c.greenDeep }}>Хранене днес</div>
              <div style={{ fontFamily: F.mono, fontSize: 10, color: c.ink2, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 1 }}>показва се пред публика</div>
            </div>
            <div style={{ fontFamily: F.display, fontSize: 22, fontWeight: 500, color: c.greenDeep, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums' }}>
              {feeding.time}
            </div>
          </div>
        )}

        {/* Map CTA */}
        <a
          href={mapsUrl}
          target="_blank"
          rel="noreferrer"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, background: c.ink, color: c.paper, borderRadius: 14, padding: '14px 18px', textDecoration: 'none' }}
        >
          <div>
            <div style={{ fontFamily: F.display, fontSize: 17, fontWeight: 500 }}>Покажи на картата</div>
            <div style={{ fontFamily: F.mono, fontSize: 10, color: darkMode ? 'rgba(21,23,14,0.6)' : 'rgba(244,239,227,0.6)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 2 }}>
              Google Maps · пеша
            </div>
          </div>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: c.green, color: darkMode ? '#11140d' : c.paper, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ArrowSvg />
          </div>
        </a>

        {/* Distribution + location maps — own mx-4 margin, so cancel the sheet's padding here */}
        <div style={{ margin: '0 -18px' }}>
          {animal.distributionCountries?.length > 0 && (
            <ErrorBoundary fallback={null}>
              <DistributionMap countryIds={animal.distributionCountries} />
            </ErrorBoundary>
          )}
          <ErrorBoundary fallback={null}>
            <AnimalLocationMap animal={animal} />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  )
}
