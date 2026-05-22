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

// ── Zoo status ────────────────────────────────────────────────────────────────
function getZooStatus() {
  const now    = new Date()
  const month  = now.getMonth()
  const t      = now.getHours() * 60 + now.getMinutes()
  const winter = month >= 10 || month <= 2
  return {
    isOpen:   t >= (winter ? 8*60+30 : 9*60+30) && t < (winter ? 17*60 : 19*60),
    hoursStr: winter ? '8:30 — 17:00' : '9:00 — 19:00',
  }
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

// ── Feeding chips — exactly 3, per day of week ────────────────────────────────
const FEEDINGS = [
  [{e:'🐧',t:'пингвини',time:'11:00'},{e:'🦭',t:'тюлени',time:'14:00'},{e:'🦁',t:'лъвове',time:'16:00'}],
  [{e:'🐧',t:'пингвини',time:'11:00'},{e:'🦦',t:'видри', time:'14:30'},{e:'🦁',t:'лъвове',time:'16:00'}],
  [{e:'🐧',t:'пингвини',time:'11:00'},{e:'🦦',t:'видри', time:'14:30'},{e:'🦁',t:'лъвове',time:'16:00'}],
  [{e:'🐧',t:'пингвини',time:'11:00'},{e:'🦦',t:'видри', time:'14:30'},{e:'🦁',t:'лъвове',time:'16:00'}],
  [{e:'🐧',t:'пингвини',time:'11:00'},{e:'🦭',t:'тюлени',time:'14:00'},{e:'🐻',t:'мечки', time:'16:00'}],
  [{e:'🐧',t:'пингвини',time:'11:00'},{e:'🦦',t:'видри', time:'14:30'},{e:'🦁',t:'лъвове',time:'16:00'}],
  [{e:'🐧',t:'пингвини',time:'11:00'},{e:'🦦',t:'видри', time:'14:30'},{e:'🐻',t:'мечки', time:'16:00'}],
]

// ── News gradient palettes (tinted placeholders, no real photos per spec) ─────
const GRADS = [
  { a:'#a8987a', b:'#5b4c2e' },
  { a:'#8b6a4a', b:'#3b2a1d' },
  { a:'#7a9aa1', b:'#3b5b62' },
  { a:'#b5604a', b:'#5a2918' },
  { a:'#8b9a76', b:'#4d5a3c' },
  { a:'#c98c4a', b:'#6b3d1e' },
]

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
            title:   get('title'),
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

// ── SVG icons — exact paths from Zoo App Dashboard.html ───────────────────────
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
      <ellipse cx="7"  cy="9"  rx="1.6" ry="2.2"/>
      <ellipse cx="12" cy="6.5" rx="1.6" ry="2.2"/>
      <ellipse cx="17" cy="9"  rx="1.6" ry="2.2"/>
      <ellipse cx="5"  cy="14" rx="1.4" ry="1.8"/>
      <ellipse cx="19" cy="14" rx="1.4" ry="1.8"/>
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

const ACTIONS = [
  { to:'/map',     Svg:MapSvg,    label:'Карта',   sub:'4 мин до пингвини', featured:true  },
  { to:'/animals', Svg:PawSvg,    label:'Животни', sub:'150 вида',           featured:false },
  { to:'/search',  Svg:SearchSvg, label:'Търсене', sub:'по вид',             featured:false },
  { to:'/info',    Svg:TicketSvg, label:'Билети',  sub:'8 / 4 лв.',          featured:false },
]

// ── Component ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { darkMode } = useData()
  const c = darkMode ? DARK : LIGHT

  const now      = new Date()
  const dayLbl   = BG_DAYS[now.getDay()]
  const dateLbl  = `${now.getDate()} ${BG_MONTHS[now.getMonth()]}`
  const emoji    = dayEmoji(now)

  const { isOpen, hoursStr } = getZooStatus()
  const feedings = FEEDINGS[now.getDay()]
  const wx       = useWeather()
  const { news, loading } = useZooNews()

  // Today card colours
  const todayBg     = darkMode
    ? 'linear-gradient(160deg, #1f2c1f, #15201a)'
    : 'linear-gradient(160deg, #e4ecdc, #d9e6cf)'
  const todayBorder = darkMode ? '#2c3d2e' : '#b9cdaa'
  const pillBg      = darkMode ? 'rgba(20,28,20,0.6)'       : 'rgba(255,255,255,0.6)'
  const pillBorder  = darkMode ? 'rgba(126,184,136,0.25)'   : 'rgba(31,74,42,0.18)'
  const dotShadow   = darkMode ? 'rgba(126,184,136,0.2)'    : 'rgba(47,107,61,0.18)'

  return (
    <div style={{ background: c.paper, minHeight: '100%', paddingBottom: 28, fontFamily: F.body }}>

      {/* ── Greeting ──────────────────────────────────────────────────────── */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 18px 14px' }}>
        <div>
          <p style={{ fontFamily:F.mono, fontSize:10, color:c.ink3, textTransform:'uppercase', letterSpacing:'0.16em', fontWeight:500, margin:0 }}>
            {dayLbl} · {dateLbl}
          </p>
          <p style={{ fontFamily:F.display, fontSize:30, fontWeight:500, letterSpacing:'-0.015em', lineHeight:1, marginTop:4, fontStyle:'italic', color:c.ink, margin:'4px 0 0' }}>
            Здравей<span style={{ fontStyle:'normal', fontFamily:F.body, marginLeft:3 }}>, {emoji}</span>
          </p>
        </div>

        <Link
          to="/settings"
          style={{ width:36, height:36, borderRadius:'50%', background:c.card, border:`1px solid ${c.rule}`, display:'inline-flex', alignItems:'center', justifyContent:'center', color:c.ink, textDecoration:'none', flexShrink:0 }}
        >
          <GearSvg />
        </Link>
      </div>

      {/* ── Today card ────────────────────────────────────────────────────── */}
      <div style={{ margin:'0 18px 16px', padding:'14px 16px', borderRadius:16, background:todayBg, border:`1px solid ${todayBorder}`, position:'relative', overflow:'hidden' }}>
        {/* Amber radial glow top-right */}
        <div style={{ position:'absolute', right:-20, top:-20, width:80, height:80, borderRadius:'50%', background:'radial-gradient(circle, rgba(217,164,65,0.4), transparent 70%)', pointerEvents:'none' }} />

        {/* Eyebrow + live dot */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontFamily:F.mono, fontSize:10, color:c.greenDeep, textTransform:'uppercase', letterSpacing:'0.16em', fontWeight:500 }}>
            ДНЕС В ЗООПАРКА
          </span>
          <span style={{ width:8, height:8, borderRadius:'50%', background:c.green, boxShadow:`0 0 0 3px ${dotShadow}`, display:'inline-block', flexShrink:0 }} />
        </div>

        {/* Open status — Newsreader serif */}
        <p style={{ fontFamily:F.display, fontWeight:500, fontSize:18, letterSpacing:'-0.01em', color:c.greenDeep, marginTop:6, marginBottom:0 }}>
          {isOpen ? 'Отворено' : 'Затворено'} · {hoursStr}
        </p>

        {/* Weather subline — JetBrains Mono */}
        <p style={{ fontFamily:F.mono, fontSize:11, color:c.ink2, marginTop:2, marginBottom:0 }}>
          {wx ? `${wx.cond} · ${wx.temp}° · ${wx.wind}` : ' '}
        </p>

        {/* Feeding chips */}
        <div style={{ display:'flex', gap:6, marginTop:12, flexWrap:'wrap' }}>
          {feedings.map((f, i) => (
            <Link
              key={i}
              to="/today"
              style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'5px 10px', borderRadius:999, background:pillBg, border:`1px solid ${pillBorder}`, fontSize:11, fontWeight:600, color:c.ink, fontFamily:F.body, whiteSpace:'nowrap', textDecoration:'none' }}
            >
              {f.e}{' '}
              <span style={{ fontFamily:F.mono, fontWeight:500, color:c.greenDeep }}>{f.t}</span>
              {' '}{f.time}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Quick actions 2×2 ─────────────────────────────────────────────── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, margin:'0 18px 18px' }}>
        {ACTIONS.map(({ to, Svg, label, sub, featured }) => {
          const bg      = featured ? c.ink  : c.card
          const border  = featured ? c.ink  : c.rule
          const fg      = featured ? c.paper : c.ink
          const iconBg  = featured ? 'rgba(244,239,227,0.12)' : c.greenTint
          const iconFg  = featured ? c.paper : c.greenDeep
          const subFg   = featured ? 'rgba(244,239,227,0.55)' : c.ink3
          return (
            <Link
              key={to}
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
          НОВИНИ И СЪБИТИЯ
        </span>
        <a
          href="https://zoosofia.eu/новини/"
          target="_blank"
          rel="noreferrer"
          style={{ fontFamily:F.mono, fontSize:11, color:c.green, letterSpacing:'0.06em', textDecoration:'none' }}
        >
          всички →
        </a>
      </div>

      {/* ── News strip ────────────────────────────────────────────────────── */}
      <div style={{ display:'flex', gap:10, padding:'0 18px 4px', overflowX:'auto', scrollbarWidth:'none' }}>

        {loading && GRADS.slice(0,3).map((g, i) => (
          <div key={i} style={{ flex:'0 0 152px', borderRadius:12, overflow:'hidden', background:c.card, border:`1px solid ${c.rule}`, opacity:0.55 }}>
            <div style={{ height:86, background:`linear-gradient(150deg, ${g.a}, ${g.b})` }} />
            <div style={{ padding:'8px 10px 10px' }}>
              <div style={{ height:7, borderRadius:3, background:c.rule, width:'38%', marginBottom:6 }} />
              <div style={{ height:9,  borderRadius:3, background:c.rule, marginBottom:4 }} />
              <div style={{ height:9,  borderRadius:3, background:c.rule, width:'72%' }} />
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
            {/* Gradient photo placeholder — radial highlight + diagonal texture via gradient */}
            <div style={{ height:86, position:'relative', background:`radial-gradient(ellipse at 30% 25%, rgba(255,255,255,0.18), transparent 55%), linear-gradient(150deg, ${item.grad.a} 0%, ${item.grad.b} 100%)` }}>
              {item.cat && (
                <span style={{ position:'absolute', left:8, bottom:8, fontFamily:F.mono, fontSize:8, letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(255,255,255,0.78)', background:'rgba(0,0,0,0.28)', padding:'3px 6px', borderRadius:4 }}>
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
