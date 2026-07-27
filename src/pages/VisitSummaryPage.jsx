import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GoogleMap, Marker } from '@react-google-maps/api'
import { useData } from '../context/DataContext'
import { useMaps } from '../context/MapsContext'
import ErrorBoundary from '../components/ErrorBoundary'

// ── Font & colour tokens (Hi-Fi spec, shared with Home/Animals/Detail) ────────
const F = {
  display: "'Newsreader', Georgia, serif",
  body:    "'Manrope', system-ui, sans-serif",
  mono:    "'JetBrains Mono', 'Courier New', monospace",
}
const LIGHT = {
  paper: '#f4efe3', surface: '#fbf8ee',
  ink: '#1a1d14', ink2: '#44473c', ink3: '#847f6e', rule: '#d5cdb6',
  green: '#2f6b3d', greenDeep: '#1f4a2a', greenTint: '#e4ecdc',
}
const DARK = {
  paper: '#15170e', surface: '#1c1e13',
  ink: '#ece5d0', ink2: '#b3ad99', ink3: '#75725f', rule: '#2f3122',
  green: '#7eb888', greenDeep: '#c4ddc9', greenTint: '#1d2a1e',
}

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

const ZOO_CENTER = { lat: 42.6583263, lng: 23.3311395 }
const MAP_OPTIONS = {
  mapTypeId: 'satellite',
  disableDefaultUI: true,
  gestureHandling: 'none',
  zoomControl: false,
  clickableIcons: false,
  minZoom: 16,
  maxZoom: 19,
}

const BG_MONTHS = ['яну','фев','мар','апр','май','юни','юли','авг','сеп','окт','ное','дек']
function formatVisitDate(iso) {
  const d = new Date(iso)
  return `${d.getDate()} ${BG_MONTHS[d.getMonth()]} ${d.getFullYear()}`
}
function formatVisitDateTime(iso) {
  const d = new Date(iso)
  const time = d.toLocaleTimeString('bg', { hour: '2-digit', minute: '2-digit' })
  return `${d.getDate()} ${BG_MONTHS[d.getMonth()]}, ${time}`
}
function formatElapsed(ms) {
  const totalMin = Math.max(0, Math.floor(ms / 60000))
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  return h > 0 ? `${h}ч ${m}мин` : `${m}мин`
}

function BackSvg() {
  return <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m15 5-7 7 7 7"/></svg>
}

function VisitedRow({ animal, c }) {
  const grad = gradFor(animal.id)
  return (
    <Link
      to={`/animals/${animal.id}`}
      style={{ display: 'flex', alignItems: 'center', gap: 12, background: c.surface, border: `1px solid ${c.rule}`, borderRadius: 14, padding: 10, textDecoration: 'none' }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 12, flexShrink: 0, overflow: 'hidden',
        background: animal.photo ? c.greenTint : `radial-gradient(ellipse at 30% 25%, rgba(255,255,255,0.18), transparent 55%), linear-gradient(150deg, ${grad.a} 0%, ${grad.b} 100%)`,
      }}>
        {animal.photo && <img src={animal.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: F.display, fontSize: 16, fontWeight: 500, letterSpacing: '-0.01em', color: c.ink, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {animal.nameBg}
        </p>
        <p style={{ fontFamily: F.display, fontSize: 11, fontStyle: 'italic', color: c.ink3, margin: '2px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {animal.species}
        </p>
      </div>
      <span style={{ fontFamily: F.mono, fontSize: 10, color: c.ink3, flexShrink: 0 }}>
        {formatVisitDate(animal.visitedAt)}
      </span>
    </Link>
  )
}

export default function VisitSummaryPage() {
  const navigate = useNavigate()
  const { allAnimals, darkMode, visited, visits, lastVisit } = useData()
  const { isLoaded } = useMaps()
  const c = darkMode ? DARK : LIGHT

  const visitedList = useMemo(() => {
    return allAnimals
      .filter(a => visited[a.id])
      .map(a => ({ ...a, visitedAt: visited[a.id] }))
      .sort((a, b) => new Date(b.visitedAt) - new Date(a.visitedAt))
  }, [allAnimals, visited])

  const recap = useMemo(() => {
    if (!lastVisit) return null
    const entries = Object.values(lastVisit.seen || {})
    const firstTimeCount = entries.filter(e => e.firstTime).length
    const duration = formatElapsed(new Date(lastVisit.endedAt) - new Date(lastVisit.startedAt))
    return { total: entries.length, firstTimeCount, duration }
  }, [lastVisit])

  const pastVisits = useMemo(() => {
    return visits
      .filter(v => v.endedAt)
      .sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt))
  }, [visits])

  const total = allAnimals.length
  const seen = visitedList.length
  const pct = total ? Math.round((seen / total) * 100) : 0

  return (
    <div style={{ background: c.paper, minHeight: '100%', paddingBottom: 24, fontFamily: F.body }}>
      <div style={{ padding: '6px 18px 14px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0 2px' }}>
          <button
            onClick={() => navigate(-1)}
            aria-label="Назад"
            style={{ width: 36, height: 36, borderRadius: '50%', background: c.surface, border: `1px solid ${c.rule}`, color: c.ink, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >
            <BackSvg />
          </button>
          <p style={{ fontFamily: F.mono, fontSize: 10, color: c.ink3, textTransform: 'uppercase', letterSpacing: '0.16em', fontWeight: 500, margin: 0 }}>
            моят напредък
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '10px 0 4px' }}>
          <p style={{ fontFamily: F.display, fontSize: 30, fontWeight: 500, letterSpacing: '-0.015em', lineHeight: 1, fontStyle: 'italic', color: c.ink, margin: 0 }}>
            Видени животни
          </p>
        </div>
        <p style={{ fontFamily: F.mono, fontSize: 11, color: c.ink3, letterSpacing: '0.08em', margin: '4px 0 12px' }}>
          {seen} от {total} видени · {pct}%
        </p>

        {/* Last-visit recap */}
        {recap && (
          <div style={{ background: c.greenTint, border: `1px solid ${darkMode ? '#2c3d2e' : '#b9cdaa'}`, borderRadius: 14, padding: '12px 14px', marginBottom: 16 }}>
            <p style={{ fontFamily: F.mono, fontSize: 10, color: c.greenDeep, textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 500, margin: 0 }}>
              последно посещение
            </p>
            <p style={{ fontFamily: F.display, fontSize: 16, fontWeight: 500, color: c.greenDeep, margin: '4px 0 0' }}>
              {recap.firstTimeCount > 0
                ? `🎉 ${recap.firstTimeCount} ${recap.firstTimeCount === 1 ? 'ново животно' : 'нови животни'} за ${recap.duration}`
                : `Видяхте ${recap.total} ${recap.total === 1 ? 'животно' : 'животни'} за ${recap.duration}`}
            </p>
            {recap.firstTimeCount > 0 && recap.total > recap.firstTimeCount && (
              <p style={{ fontFamily: F.mono, fontSize: 10, color: c.ink2, margin: '2px 0 0' }}>
                общо {recap.total} видени това посещение
              </p>
            )}
          </div>
        )}

        {/* Progress bar */}
        <div style={{ height: 8, borderRadius: 999, background: c.rule, overflow: 'hidden', marginBottom: 18 }}>
          <div style={{ height: '100%', width: `${pct}%`, background: c.green, borderRadius: 999, transition: 'width 0.3s ease' }} />
        </div>

        {seen === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <p style={{ fontSize: 40, margin: '0 0 10px' }}>🐾</p>
            <p style={{ fontFamily: F.body, fontSize: 14, color: c.ink2, margin: '0 0 16px' }}>
              Все още нямате отбелязани животни. Отбележете ги като видени от страницата на всяко животно.
            </p>
            <Link
              to="/animals"
              style={{ display: 'inline-block', background: c.ink, color: c.paper, borderRadius: 999, padding: '10px 20px', fontFamily: F.body, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}
            >
              Разгледай животните
            </Link>
          </div>
        ) : (
          <>
            {/* Overview map */}
            <div style={{ height: 180, borderRadius: 14, overflow: 'hidden', border: `1px solid ${c.rule}`, marginBottom: 16 }}>
              <ErrorBoundary fallback={null}>
                {isLoaded ? (
                  <GoogleMap mapContainerStyle={{ width: '100%', height: '100%' }} center={ZOO_CENTER} zoom={17} options={MAP_OPTIONS}>
                    {visitedList.map(a => (
                      <Marker key={a.id} position={{ lat: a.lat, lng: a.lng }} />
                    ))}
                  </GoogleMap>
                ) : (
                  <div style={{ width: '100%', height: '100%', background: c.greenTint, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: c.ink3, fontSize: 13 }}>Зарежда карта…</span>
                  </div>
                )}
              </ErrorBoundary>
            </div>

            {/* List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {visitedList.map(animal => (
                <VisitedRow key={animal.id} animal={animal} c={c} />
              ))}
            </div>
          </>
        )}

        {/* Visit history */}
        {pastVisits.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <p style={{ fontFamily: F.mono, fontSize: 10, color: c.ink3, textTransform: 'uppercase', letterSpacing: '0.16em', fontWeight: 500, margin: '0 0 10px' }}>
              история на посещенията
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {pastVisits.map(v => {
                const count = Object.keys(v.seen || {}).length
                return (
                  <div
                    key={v.id}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: c.surface, border: `1px solid ${c.rule}`, borderRadius: 14, padding: '10px 14px' }}
                  >
                    <span style={{ fontFamily: F.body, fontSize: 13, fontWeight: 600, color: c.ink }}>
                      {formatVisitDateTime(v.startedAt)}
                    </span>
                    <span style={{ fontFamily: F.mono, fontSize: 11, color: c.ink3 }}>
                      {count} {count === 1 ? 'животно' : 'животни'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
