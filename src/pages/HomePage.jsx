import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../context/DataContext'

// ── Font & colour constants (from Zoo App Dashboard.html) ─────────────────────
const F = {
  display: "'Newsreader', Georgia, serif",
  body:    "'Manrope', system-ui, sans-serif",
  mono:    "'JetBrains Mono', 'Courier New', monospace",
}

const LIGHT = {
  paper:     '#f4efe3',
  card:      '#fbf8ee',
  ink:       '#1a1d14',
  ink2:      '#44473c',
  ink3:      '#847f6e',
  rule:      '#d5cdb6',
  green:     '#2f6b3d',
  greenDeep: '#1f4a2a',
  greenTint: '#e4ecdc',
}
const DARK = {
  paper:     '#15170e',
  card:      '#1c1e13',
  ink:       '#ece5d0',
  ink2:      '#b3ad99',
  ink3:      '#75725f',
  rule:      '#2f3122',
  green:     '#7eb888',
  greenDeep: '#c4ddc9',
  greenTint: '#1d2a1e',
}

// ── Date helpers ──────────────────────────────────────────────────────────────
const BG_DAYS   = ['неделя','понеделник','вторник','сряда','четвъртък','петък','събота']
const BG_MONTHS = ['яну','фев','мар','апр','май','юни','юли','авг','сеп','окт','ное','дек']

const DAY_EMOJIS = ['🦁','🐼','🐻','🦊','🦒','🐘','🦓','🦏']
function dayEmoji(d) {
  const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()
  return DAY_EMOJIS[seed % DAY_EMOJIS.length]
}

// ── Zoo status — 3 states ─────────────────────────────────────────────────────
function getZooStatus() {
  const now    = new Date()
  const month  = now.getMonth()
  const t      = now.getHours() * 60 + now.getMinutes()
  const winter  = month >= 10 || month <= 2
  const openMin  = winter ? 8*60+30 : 9*60+30
  const closeMin = winter ? 17*60   : 19*60
  const openHr   = winter ? '8:30'  : '9:30'
  const closeHr  = winter ? '17:00' : '19:00'
  const hoursStr = winter ? '8:30 — 17:00' : '9:30 — 19:00'

  let state
  if (t < openMin || t >= closeMin) state = 'closed'
  else if (t >= closeMin - 60)      state = 'closing'
  else                               state = 'open'

  return { state, hoursStr, openHr, closeHr }
}

// ── Pulse keyframes — injected once ───────────────────────────────────────────
let _pulseInjected = false
function ensurePulse() {
  if (_pulseInjected) return
  _pulseInjected = true
  const s = document.createElement('style')
  s.textContent =
    '@keyframes zoo-amber-pulse{0%,100%{box-shadow:0 0 0 0 rgba(217,164,65,0.55)}65%{box-shadow:0 0 0 5px rgba(217,164,65,0)}}' +
    '@keyframes zoo-green-pulse{0%,100%{box-shadow:0 0 0 0 rgba(47,107,61,0.45)}65%{box-shadow:0 0 0 6px rgba(47,107,61,0)}}'
  document.head.appendChild(s)
}

// ── Weather (Open-Meteo) ──────────────────────────────────────────────────────
const WMO = {
  0:'слънчево', 1:'предимно слънчево', 2:'частично облачно', 3:'облачно',
  45:'мъгла', 48:'мъгла', 51:'ситен дъжд', 53:'дъжд', 55:'силен дъжд',
  61:'дъжд', 63:'дъжд', 65:'силен дъжд', 71:'сняг', 73:'сняг', 75:'силен сняг',
  80:'превалявания', 81:'превалявания', 95:'гръмотевица',
}
function useWeather() {
  const [wx, setWx] = useState(null)
  useEffect(() => {
    fetch('https://api.open-meteo.com/v1/forecast?latitude=42.6583&longitude=23.3311&current=temperature_2m,weathercode,windspeed_10m&timezone=Europe/Sofia')
      .then(r => r.json())
      .then(d => {
        const c = d.current
        const wind = c.windspeed_10m < 10 ? 'спокойно' : c.windspeed_10m < 30 ? 'ветровито' : 'силен вятър'
        setWx({ temp: Math.round(c.temperature_2m), cond: WMO[c.weathercode] ?? 'ясно', wind })
      }).catch(() => {})
  }, [])
  return wx
}

// ── Feeding chips — per day of week ──────────────────────────────────────────
const FEEDINGS = [
  [{e:'🐧',t:'пингвини',time:'11:00'},{e:'🦭',t:'тюлени',time:'14:00'},{e:'🦁',t:'лъвове',time:'16:00'}],
  [{e:'🐧',t:'пингвини',time:'11:00'},{e:'🦦',t:'видри', time:'14:30'},{e:'🦁',t:'лъвове',time:'16:00'}],
  [{e:'🐧',t:'пингвини',time:'11:00'},{e:'🦦',t:'видри', time:'14:30'},{e:'🦁',t:'лъвове',time:'16:00'}],
  [{e:'🐧',t:'пингвини',time:'11:00'},{e:'🦦',t:'видри', time:'14:30'},{e:'🦁',t:'лъвове',time:'16:00'}],
  [{e:'🐧',t:'пингвини',time:'11:00'},{e:'🦭',t:'тюлени',time:'14:00'},{e:'🐻',t:'мечки', time:'16:00'}],
  [{e:'🐧',t:'пингвини',time:'11:00'},{e:'🦦',t:'видри', time:'14:30'},{e:'🦁',t:'лъвове',time:'16:00'}],
  [{e:'🐧',t:'пингвини',time:'11:00'},{e:'🦦',t:'видри', time:'14:30'},{e:'🐻',t:'мечки', time:'16:00'}],
]

// ── News gradient palettes ────────────────────────────────────────────────────
const GRADS = [
  { a:'#a8987a', b:'#5b4c2e' },
  { a:'#8b6a4a', b:'#3b2a1d' },
  { a:'#7a9aa1', b:'#3b5b62' },
  { a:'#b5604a', b:'#5a2918' },
  { a:'#8b9a76', b:'#4d5a3c' },
  { a:'#c98c4a', b:'#6b3d1e' },
]

const RSS_PREFIX = /^(ВАЖНИ НОВИНИ|НОВО|АКТУАЛНО|АКТУАЛО)[:·\s\-]+/i
function cleanTitle(raw) {
  const t = (raw ?? '').replace(RSS_PREFIX, '').trim()
  return t.length > 90 ? t.slice(0, 90) + '…' : t
}

function newsDate(str) {
  if (!str) return ''
  const d = new Date(str)
  return isNaN(d) ? '' : `${d.getDate()} ${BG_MONTHS[d.getMonth()]}`
}

function useZooNews() {
  const [news,    setNews]    = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    fetch('https://api.allorigins.win/raw?url=' + encodeURIComponent('https://zoosofia.eu/feed/'))
      .then(r => { if (!r.ok) throw new Error(); return r.text() })
      .then(xml => {
        const doc = new DOMParser().parseFromString(xml, 'text/xml')
        const items = [...doc.querySelectorAll('item')].slice(0, 6).map((item, i) => {
          const get = tag => item.querySelector(tag)?.textContent?.trim() ?? ''
          const cat = get('category')
          return {
            title:   cleanTitle(get('title')),
            link:    get('guid') || get('link'),
            pubDate: get('pubDate'),
            cat:     cat ? cat.slice(0, 18) : null,
            grad:    GRADS[i % GRADS.length],
          }
        })
        setNews(items)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])
  return { news, loading }
}

// ── SVG icons ─────────────────────────────────────────────────────────────────
function MapSvg() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6.5 9 4l6 2.5 6-2.5v13l-6 2.5-6-2.5L3 19.5z"/>
      <path d="M9 4v15.5M15 6.5V22"/>
    </svg>
  )
}
function PawSvg() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="7"  cy="9"   rx="1.6" ry="2.2"/>
      <ellipse cx="12" cy="6.5" rx="1.6" ry="2.2"/>
      <ellipse cx="17" cy="9"   rx="1.6" ry="2.2"/>
      <ellipse cx="5"  cy="14"  rx="1.4" ry="1.8"/>
      <ellipse cx="19" cy="14"  rx="1.4" ry="1.8"/>
      <path d="M8 17.5c0-2.5 1.8-4 4-4s4 1.5 4 4-1.8 3.5-4 3.5-4-1-4-3.5z"/>
    </svg>
  )
}
function SearchSvg() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="6"/>
      <path d="m20 20-4.5-4.5"/>
    </svg>
  )
}
function TicketSvg() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z"/>
      <path d="M12 7v10" strokeDasharray="2 2"/>
    </svg>
  )
}
function GearSvg() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.5 5.5l1.8 1.8M16.7 16.7l1.8 1.8M5.5 18.5l1.8-1.8M16.7 7.3l1.8-1.8"/>
    </svg>
  )
}
function AntennaSvg() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20v-7"/>
      <circle cx="12" cy="11" r="1.4" fill="currentColor" stroke="none"/>
      <path d="M8.7 8.7a4.6 4.6 0 0 1 6.6 0"/>
      <path d="M5.8 5.8a8.8 8.8 0 0 1 12.4 0"/>
    </svg>
  )
}
function WalkSvg() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13" cy="4" r="1.6"/>
      <path d="M10.5 8 8 10l1 4-3 6M13.5 8l2 3 3 1.5-1 4.5M10.5 8l3 0 2-2.5"/>
    </svg>
  )
}
function ChevronSvg() {
  return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m9 6 6 6-6 6"/></svg>
}

const ACTIONS = [
  { to:'/map',     Svg:MapSvg,    label:'Карта',   sub:'4 мин до пингвини', featured:true  },
  { to:'/animals', Svg:PawSvg,    label:'Животни', sub:'150 вида',           featured:false },
  { to:'/animals', Svg:SearchSvg, label:'Търсене', sub:'по вид',             featured:false },
  { to:'/info',    Svg:TicketSvg, label:'Билети',  sub:'8 / 4 лв.',          featured:false },
]

// ── Component ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { darkMode, activeVisit, startVisit, isLinked } = useData()
  const c = darkMode ? DARK : LIGHT

  ensurePulse()

  const now     = new Date()
  const dayLbl  = BG_DAYS[now.getDay()]
  const dateLbl = `${now.getDate()} ${BG_MONTHS[now.getMonth()]}`
  const emoji   = dayEmoji(now)

  const { state, hoursStr, openHr, closeHr } = getZooStatus()
  const feedings = FEEDINGS[now.getDay()]
  const wx       = useWeather()
  const { news, loading } = useZooNews()

  const wxLine = wx ? `${wx.cond} · ${wx.temp}° · ${wx.wind}` : ' '

  // ── Today card — 3-state visual tokens ───────────────────────────────────
  const card = (() => {
    if (state === 'closing') return {
      bg:         darkMode ? 'linear-gradient(160deg, #2a2210, #1e1a0a)' : 'linear-gradient(160deg, #f7e8c8, #f1dec3)',
      border:     darkMode ? '#3d2f10' : '#e0c070',
      dotColor:   '#d9a441',
      dotPulse:   true,
      eyeColor:   darkMode ? '#c4a84a' : '#7a5807',
      statusLine: `Скоро затваря · до ${closeHr}`,
      subLine:    'последни 60 минути за вход',
      pillBg:     darkMode ? 'rgba(60,44,8,0.65)' : 'rgba(255,255,255,0.58)',
      pillBorder: darkMode ? 'rgba(217,164,65,0.3)' : 'rgba(122,88,7,0.2)',
      pillText:   darkMode ? '#d9a441' : '#7a5807',
      chips: [
        { e:'🕔', label:`скоро затваря · ${closeHr}` },
        { e:'🌅', label:`утре в ${openHr}` },
      ],
    }
    if (state === 'closed') return {
      bg:         darkMode ? 'linear-gradient(160deg, #1e1c18, #181614)' : 'linear-gradient(160deg, #f1ece0, #e8e1d1)',
      border:     darkMode ? '#2e2b24' : '#cfc7b4',
      dotColor:   '#c0747a',
      dotPulse:   false,
      eyeColor:   darkMode ? '#c07880' : '#8b4a50',
      statusLine: `Затворено · отваря утре в ${openHr}`,
      subLine:    wxLine,
      pillBg:     darkMode ? 'rgba(40,36,32,0.7)' : 'rgba(255,255,255,0.55)',
      pillBorder: darkMode ? 'rgba(192,116,122,0.25)' : 'rgba(139,74,80,0.18)',
      pillText:   darkMode ? '#c07880' : '#8b4a50',
      chips: [
        { e:'⏰', label:`утре в ${openHr}` },
        { e:'🌤', label: wx?.cond ?? 'прогноза' },
      ],
    }
    return {
      bg:         darkMode ? 'linear-gradient(160deg, #1f2c1f, #15201a)' : 'linear-gradient(160deg, #e4ecdc, #d9e6cf)',
      border:     darkMode ? '#2c3d2e' : '#b9cdaa',
      dotColor:   darkMode ? '#7eb888' : '#2f6b3d',
      dotPulse:   false,
      eyeColor:   darkMode ? '#c4ddc9' : '#1f4a2a',
      statusLine: `Отворено · ${hoursStr}`,
      subLine:    wxLine,
      pillBg:     darkMode ? 'rgba(20,28,20,0.6)' : 'rgba(255,255,255,0.6)',
      pillBorder: darkMode ? 'rgba(126,184,136,0.25)' : 'rgba(31,74,42,0.18)',
      pillText:   darkMode ? '#c4ddc9' : '#1f4a2a',
      chips:      null,
    }
  })()

  return (
    <div style={{ background: c.paper, minHeight: '100%', paddingBottom: 28, fontFamily: F.body }}>

      {/* ── Greeting ──────────────────────────────────────────────────────── */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 18px 14px' }}>
        <div>
          <p style={{ fontFamily:F.mono, fontSize:10, color:c.ink3, textTransform:'uppercase', letterSpacing:'0.16em', fontWeight:500, margin:0 }}>
            {dayLbl} &middot; {dateLbl}
          </p>
          <p style={{ fontFamily:F.display, fontSize:30, fontWeight:500, letterSpacing:'-0.015em', lineHeight:1, fontStyle:'italic', color:c.ink, margin:'4px 0 0' }}>
            {'Здравей'}<span style={{ fontStyle:'normal', fontFamily:F.body, marginLeft:3 }}>, {emoji}</span>
          </p>
        </div>
        <div style={{ display:'flex', gap:8, flexShrink:0 }}>
          <Link
            to="/settings"
            aria-label={isLinked ? 'Синхронизацията е включена' : 'Включи синхронизация'}
            style={{ width:36, height:36, borderRadius:'50%', background:c.card, border:`1px solid ${c.rule}`, display:'inline-flex', alignItems:'center', justifyContent:'center', color: isLinked ? c.green : c.ink3, textDecoration:'none' }}
          >
            <AntennaSvg />
          </Link>
          <Link
            to="/settings"
            style={{ width:36, height:36, borderRadius:'50%', background:c.card, border:`1px solid ${c.rule}`, display:'inline-flex', alignItems:'center', justifyContent:'center', color:c.ink, textDecoration:'none' }}
          >
            <GearSvg />
          </Link>
        </div>
      </div>

      {/* ── Today card ────────────────────────────────────────────────────── */}
      <div style={{ margin:'0 18px 16px', padding:'14px 16px', borderRadius:16, background:card.bg, border:`1px solid ${card.border}`, position:'relative', overflow:'hidden' }}>
        {/* Ambient glow */}
        <div style={{ position:'absolute', right:-20, top:-20, width:80, height:80, borderRadius:'50%', background:'radial-gradient(circle, rgba(217,164,65,0.35), transparent 70%)', pointerEvents:'none' }} />

        {/* Eyebrow + dot */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontFamily:F.mono, fontSize:10, color:card.eyeColor, textTransform:'uppercase', letterSpacing:'0.16em', fontWeight:500 }}>
            {'ДНЕС В ЗООПАРКА'}
          </span>
          <span style={{
            width:8, height:8, borderRadius:'50%', background:card.dotColor,
            display:'inline-block', flexShrink:0,
            animation: card.dotPulse ? 'zoo-amber-pulse 1.4s ease-out infinite' : 'none',
          }} />
        </div>

        {/* Status line — Newsreader */}
        <p style={{ fontFamily:F.display, fontWeight:500, fontSize:18, letterSpacing:'-0.01em', color:card.eyeColor, marginTop:6, marginBottom:0 }}>
          {card.statusLine}
        </p>

        {/* Subline — JetBrains Mono */}
        <p style={{ fontFamily:F.mono, fontSize:11, color:c.ink2, marginTop:2, marginBottom:0 }}>
          {card.subLine}
        </p>

        {/* Chips */}
        <div style={{ display:'flex', gap:6, marginTop:12, flexWrap:'wrap' }}>
          {state === 'open'
            ? feedings.map((f, i) => (
                <Link
                  key={i}
                  to="/today"
                  style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'5px 10px', borderRadius:999, background:card.pillBg, border:`1px solid ${card.pillBorder}`, fontSize:11, fontWeight:600, color:c.ink, fontFamily:F.body, whiteSpace:'nowrap', textDecoration:'none' }}
                >
                  {f.e}{' '}
                  <span style={{ fontFamily:F.mono, fontWeight:500, color:card.pillText }}>{f.t}</span>
                  {' '}{f.time}
                </Link>
              ))
            : card.chips.map((ch, i) => (
                <span
                  key={i}
                  style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'5px 10px', borderRadius:999, background:card.pillBg, border:`1px solid ${card.pillBorder}`, fontSize:11, fontFamily:F.body, fontWeight:600, color:card.pillText, whiteSpace:'nowrap' }}
                >
                  {ch.e}{' '}{ch.label}
                </span>
              ))
          }
        </div>
      </div>

      {/* ── Visit banner ──────────────────────────────────────────────────── */}
      <Link
        to="/visit"
        onClick={() => { if (!activeVisit) startVisit() }}
        style={{
          display:'flex', alignItems:'center', gap:12, textDecoration:'none',
          background: activeVisit ? c.greenTint : c.ink,
          border: `1px solid ${activeVisit ? (darkMode ? '#2c3d2e' : '#b9cdaa') : c.ink}`,
          borderRadius:16, padding:'14px 16px', margin:'0 18px 16px',
        }}
      >
        <span style={{
          width:34, height:34, borderRadius:'50%', flexShrink:0,
          background: activeVisit ? c.card : 'rgba(244,239,227,0.14)',
          border: activeVisit ? `1px solid ${c.rule}` : 'none',
          color: c.paper,
          display:'inline-flex', alignItems:'center', justifyContent:'center',
        }}>
          {activeVisit
            ? <span style={{ width:10, height:10, borderRadius:'50%', background:c.green, animation:'zoo-green-pulse 1.6s ease-out infinite' }} />
            : <WalkSvg />}
        </span>
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontFamily:F.display, fontSize:17, fontWeight:500, letterSpacing:'-0.01em', color: activeVisit ? c.greenDeep : c.paper, margin:0 }}>
            {activeVisit ? 'Текущо посещение' : 'Започни посещение'}
          </p>
          <p style={{ fontFamily:F.mono, fontSize:10, textTransform:'uppercase', letterSpacing:'0.1em', color: activeVisit ? c.ink2 : 'rgba(244,239,227,0.6)', margin:'2px 0 0' }}>
            {activeVisit
              ? (() => { const n = Object.keys(activeVisit.seen).length; return `на живо · ${n} ${n === 1 ? 'видяно' : 'видени'}` })()
              : 'отбелязвай животните, докато обикаляш'}
          </p>
        </div>
        <span style={{ color: activeVisit ? c.ink3 : 'rgba(244,239,227,0.5)', flexShrink:0 }}>
          <ChevronSvg />
        </span>
      </Link>

      {/* ── Quick actions 2x2 ─────────────────────────────────────────────── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, margin:'0 18px 18px' }}>
        {ACTIONS.map(({ to, Svg, label, sub, featured }) => {
          const bg     = featured ? c.ink   : c.card
          const border = featured ? c.ink   : c.rule
          const fg     = featured ? c.paper : c.ink
          const iconBg = featured ? 'rgba(244,239,227,0.12)' : c.greenTint
          const iconFg = featured ? c.paper : c.greenDeep
          const subFg  = featured ? 'rgba(244,239,227,0.55)' : c.ink3
          return (
            <Link
              key={label}
              to={to}
              style={{ display:'flex', flexDirection:'column', justifyContent:'space-between', background:bg, border:`1px solid ${border}`, borderRadius:14, padding:'12px 12px 11px', minHeight:82, textDecoration:'none' }}
            >
              <div style={{ width:32, height:32, borderRadius:10, background:iconBg, color:iconFg, display:'inline-flex', alignItems:'center', justifyContent:'center' }}>
                <Svg />
              </div>
              <div>
                <p style={{ fontFamily:F.display, fontSize:18, fontWeight:500, letterSpacing:'-0.01em', color:fg, margin:'12px 0 0' }}>
                  {label}
                </p>
                <p style={{ fontFamily:F.mono, fontSize:10, color:subFg, textTransform:'uppercase', letterSpacing:'0.1em', margin:'2px 0 0' }}>
                  {sub}
                </p>
              </div>
            </Link>
          )
        })}
      </div>

      {/* ── Section head ──────────────────────────────────────────────────── */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', margin:'4px 18px 10px' }}>
        <span style={{ fontFamily:F.mono, fontSize:10, color:c.ink3, textTransform:'uppercase', letterSpacing:'0.16em', fontWeight:500 }}>
          {'НОВИНИ И СЪБИТИЯ'}
        </span>
        <a
          href="https://zoosofia.eu/новини/"
          target="_blank"
          rel="noreferrer"
          style={{ fontFamily:F.mono, fontSize:11, color:c.green, letterSpacing:'0.06em', textDecoration:'none' }}
        >
          {'всички →'}
        </a>
      </div>

      {/* ── News strip ────────────────────────────────────────────────────── */}
      <div style={{ display:'flex', gap:10, padding:'0 18px 4px', overflowX:'auto', scrollbarWidth:'none' }}>

        {loading && GRADS.slice(0, 3).map((g, i) => (
          <div key={i} style={{ flex:'0 0 152px', borderRadius:12, overflow:'hidden', background:c.card, border:`1px solid ${c.rule}`, opacity:0.55 }}>
            <div style={{ height:86, background:`linear-gradient(150deg, ${g.a}, ${g.b})` }} />
            <div style={{ padding:'8px 10px 10px' }}>
              <div style={{ height:7, borderRadius:3, background:c.rule, width:'38%', marginBottom:6 }} />
              <div style={{ height:9, borderRadius:3, background:c.rule, marginBottom:4 }} />
              <div style={{ height:9, borderRadius:3, background:c.rule, width:'72%' }} />
            </div>
          </div>
        ))}

        {!loading && news.map((item, i) => (
          <a
            key={i}
            href={item.link}
            target="_blank"
            rel="noreferrer"
            style={{ flex:'0 0 152px', borderRadius:12, overflow:'hidden', background:c.card, border:`1px solid ${c.rule}`, display:'flex', flexDirection:'column', textDecoration:'none', color:'inherit' }}
          >
            {/* Gradient placeholder + bottom-fade veil */}
            <div style={{ height:86, position:'relative', flexShrink:0, background:`radial-gradient(ellipse at 30% 25%, rgba(255,255,255,0.18), transparent 55%), linear-gradient(150deg, ${item.grad.a} 0%, ${item.grad.b} 100%)` }}>
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.55) 100%)', pointerEvents:'none' }} />
              {item.cat && (
                <span style={{ position:'absolute', left:8, bottom:7, fontFamily:F.mono, fontSize:8, letterSpacing:'0.18em', textTransform:'uppercase', color:'rgba(255,255,255,0.82)', zIndex:1 }}>
                  {item.cat}
                </span>
              )}
            </div>
            {/* Date + title */}
            <div style={{ padding:'8px 10px 10px' }}>
              <p style={{ fontFamily:F.mono, fontSize:9, color:c.ink3, letterSpacing:'0.14em', textTransform:'uppercase', margin:0 }}>
                {newsDate(item.pubDate)}
              </p>
              <p style={{ fontFamily:F.display, fontSize:14, lineHeight:1.2, fontWeight:500, margin:'4px 0 0', letterSpacing:'-0.01em', color:c.ink }}>
                {item.title}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
