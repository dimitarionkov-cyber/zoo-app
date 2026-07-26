import { useState, useEffect, useMemo } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext'

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

function formatElapsed(ms) {
  const totalMin = Math.max(0, Math.floor(ms / 60000))
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  return h > 0 ? `${h}ч ${m}мин` : `${m}мин`
}
function formatTime(iso) {
  const d = new Date(iso)
  return d.toLocaleTimeString('bg', { hour: '2-digit', minute: '2-digit' })
}

function BackSvg() {
  return <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m15 5-7 7 7 7"/></svg>
}

function VisitRow({ animal, c }) {
  const grad = gradFor(animal.id)
  return (
    <Link
      to={`/animals/${animal.id}`}
      style={{ display: 'flex', alignItems: 'center', gap: 12, background: c.surface, border: `1px solid ${c.rule}`, borderRadius: 14, padding: 10, textDecoration: 'none' }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 11, flexShrink: 0, overflow: 'hidden',
        background: animal.photo ? c.greenTint : `radial-gradient(ellipse at 30% 25%, rgba(255,255,255,0.18), transparent 55%), linear-gradient(150deg, ${grad.a} 0%, ${grad.b} 100%)`,
      }}>
        {animal.photo && <img src={animal.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: F.display, fontSize: 15, fontWeight: 500, letterSpacing: '-0.01em', color: c.ink, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {animal.nameBg}
        </p>
      </div>
      <span style={{ fontFamily: F.mono, fontSize: 10, color: c.ink3, flexShrink: 0 }}>
        {formatTime(animal.visitedAt)}
      </span>
    </Link>
  )
}

export default function VisitPage() {
  const navigate = useNavigate()
  const { allAnimals, darkMode, visited, activeVisit, endVisit } = useData()
  const c = darkMode ? DARK : LIGHT

  // Snapshot at mount — ending the visit sets activeVisit to null in context,
  // but this page is already navigating away at that point and shouldn't
  // react to that change (avoids a race with the navigate('/visited') call).
  const [visitSnapshot] = useState(() => activeVisit)

  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(id)
  }, [])

  const seenThisVisit = useMemo(() => {
    if (!visitSnapshot) return []
    const startedAt = new Date(visitSnapshot.startedAt).getTime()
    return allAnimals
      .filter(a => visited[a.id] && new Date(visited[a.id]).getTime() >= startedAt)
      .map(a => ({ ...a, visitedAt: visited[a.id] }))
      .sort((a, b) => new Date(b.visitedAt) - new Date(a.visitedAt))
  }, [allAnimals, visited, visitSnapshot])

  if (!visitSnapshot) return <Navigate to="/" replace />

  const elapsed = formatElapsed(now - new Date(visitSnapshot.startedAt).getTime())

  const pillStyle = {
    flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    padding: '11px 12px', borderRadius: 12, border: `1px solid ${c.rule}`, background: c.surface,
    color: c.ink, fontFamily: F.body, fontSize: 13, fontWeight: 600, textDecoration: 'none',
  }

  function handleEnd() {
    endVisit()
    navigate('/visited')
  }

  return (
    <div style={{ background: c.paper, minHeight: '100%', paddingBottom: 24, fontFamily: F.body }}>
      <div style={{ padding: '6px 18px 14px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0 2px' }}>
          <button
            onClick={() => navigate('/')}
            aria-label="Начало"
            style={{ width: 36, height: 36, borderRadius: '50%', background: c.surface, border: `1px solid ${c.rule}`, color: c.ink, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >
            <BackSvg />
          </button>
          <p style={{ fontFamily: F.mono, fontSize: 10, color: c.ink3, textTransform: 'uppercase', letterSpacing: '0.16em', fontWeight: 500, margin: 0 }}>
            на живо
          </p>
        </div>

        <p style={{ fontFamily: F.display, fontSize: 30, fontWeight: 500, letterSpacing: '-0.015em', lineHeight: 1, fontStyle: 'italic', color: c.ink, margin: '10px 0 4px' }}>
          Текущо посещение
        </p>
        <p style={{ fontFamily: F.mono, fontSize: 11, color: c.ink3, letterSpacing: '0.08em', margin: '4px 0 16px' }}>
          {elapsed} · {seenThisVisit.length} видени
        </p>

        {/* Shortcuts */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
          <Link to="/animals" style={pillStyle}>🐾 Животни</Link>
          <Link to="/map" style={pillStyle}>🗺️ Карта</Link>
        </div>

        {/* Live list */}
        {seenThisVisit.length === 0 ? (
          <p style={{ fontSize: 13.5, color: c.ink3, fontStyle: 'italic', textAlign: 'center', padding: '20px 10px' }}>
            Все още не сте отбелязали животно. Разгледайте животните и отбележете кое сте видели.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 22 }}>
            {seenThisVisit.map(animal => (
              <VisitRow key={animal.id} animal={animal} c={c} />
            ))}
          </div>
        )}

        {/* End visit */}
        <button
          onClick={handleEnd}
          style={{ width: '100%', background: c.ink, color: c.paper, border: 'none', borderRadius: 14, padding: '14px 18px', fontFamily: F.display, fontSize: 16, fontWeight: 500, cursor: 'pointer' }}
        >
          Приключи посещението
        </button>
      </div>
    </div>
  )
}
