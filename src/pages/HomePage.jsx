import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

// ── Locale helpers ────────────────────────────────────────────────────────────
const BG_DAYS   = ['Неделя','Понеделник','Вторник','Сряда','Четвъртък','Петък','Събота']
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
  const open   = winter ? 8 * 60 + 30 : 9 * 60 + 30
  const close  = winter ? 17 * 60 : 19 * 60
  return {
    isOpen:   t >= open && t < close,
    hoursStr: winter ? '8:30 – 17:00' : '9:00 – 19:00',
  }
}

// ── Weather (Open-Meteo, no API key) ─────────────────────────────────────────
const WMO_BG = {
  0: 'слънчево', 1: 'предимно слънчево', 2: 'частично облачно', 3: 'облачно',
  45: 'мъгла', 48: 'мъгла',
  51: 'ситен дъжд', 53: 'дъжд', 55: 'силен дъжд',
  61: 'дъжд', 63: 'дъжд', 65: 'силен дъжд',
  71: 'сняг', 73: 'сняг', 75: 'силен сняг',
  80: 'превалявания', 81: 'превалявания', 82: 'силни превалявания',
  95: 'гръмотевица', 99: 'гръмотевица',
}
function windLabel(kmh) {
  if (kmh < 10) return 'спокойно'
  if (kmh < 30) return 'ветровито'
  return 'силен вятър'
}
function useWeather() {
  const [wx, setWx] = useState(null)
  useEffect(() => {
    fetch('https://api.open-meteo.com/v1/forecast?latitude=42.6583&longitude=23.3311&current=temperature_2m,weathercode,windspeed_10m&timezone=Europe/Sofia')
      .then(r => r.json())
      .then(d => {
        const c = d.current
        setWx({
          temp:      Math.round(c.temperature_2m),
          condition: WMO_BG[c.weathercode] ?? 'ясно',
          wind:      windLabel(c.windspeed_10m),
        })
      })
      .catch(() => {})
  }, [])
  return wx
}

// ── Feeding schedule (replace with real data when available) ──────────────────
const FEEDINGS = [
  [{ emoji: '🐧', label: 'пингвини', time: '11:00' }, { emoji: '🦭', label: 'тюлени',  time: '14:00' }],
  [{ emoji: '🐧', label: 'пингвини', time: '11:00' }, { emoji: '🦦', label: 'видри',   time: '14:30' }],
  [{ emoji: '🐧', label: 'пингвини', time: '11:00' }, { emoji: '🦁', label: 'лъвове',  time: '15:00' }],
  [{ emoji: '🐧', label: 'пингвини', time: '11:00' }, { emoji: '🦦', label: 'видри',   time: '14:30' }],
  [{ emoji: '🐧', label: 'пингвини', time: '11:00' }, { emoji: '🦭', label: 'тюлени',  time: '14:00' }],
  [{ emoji: '🐧', label: 'пингвини', time: '11:00' }, { emoji: '🦁', label: 'лъвове',  time: '15:00' }],
  [{ emoji: '🐧', label: 'пингвини', time: '11:00' }, { emoji: '🦦', label: 'видри',   time: '14:30' }, { emoji: '🐻', label: 'мечки', time: '16:00' }],
]

// ── Quick-action tiles ────────────────────────────────────────────────────────
// Icon SVGs (24×24 stroke, 1.7 weight)
function IconMap() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3L3 6.5v14L9 17l6 3.5 6-3.5V3l-6 3.5L9 3z"/>
      <line x1="9" y1="3" x2="9" y2="17"/>
      <line x1="15" y1="6.5" x2="15" y2="20.5"/>
    </svg>
  )
}
function IconPaw() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="14.5" rx="4.5" ry="3.5"/>
      <ellipse cx="7.5"  cy="11"  rx="1.4" ry="2"/>
      <ellipse cx="10"   cy="8.5" rx="1.4" ry="2"/>
      <ellipse cx="14"   cy="8.5" rx="1.4" ry="2"/>
      <ellipse cx="16.5" cy="11"  rx="1.4" ry="2"/>
    </svg>
  )
}
function IconSearch() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7"/>
      <line x1="16.5" y1="16.5" x2="21" y2="21"/>
    </svg>
  )
}
function IconTicket() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 9a2 2 0 0 1 0-4V4h20v1a2 2 0 0 1 0 4v2a2 2 0 0 1 0 4v1H2v-1a2 2 0 0 1 0-4V9z"/>
      <line x1="9" y1="4" x2="9" y2="20" strokeDasharray="2 2"/>
    </svg>
  )
}

const ACTIONS = [
  { to: '/map',     Icon: IconMap,    label: 'Карта',     sub: 'ДО ТЕБЕ',     featured: true  },
  { to: '/animals', Icon: IconPaw,    label: 'Животни',   sub: '150 ВИДА',    featured: false },
  { to: '/search',  Icon: IconSearch, label: 'Търсене',   sub: 'ПО ВИД',      featured: false },
  { to: '/info',    Icon: IconTicket, label: 'Билети',    sub: '8 / 4 ЛВ.',   featured: false },
]

// ── RSS news ──────────────────────────────────────────────────────────────────
function extractImg(html) {
  if (!html) return null
  const div = document.createElement('div')
  div.innerHTML = html
  const img = div.querySelector('img')
  return img?.getAttribute('data-src') || img?.getAttribute('src') || null
}
function newsDate(str) {
  if (!str) return ''
  const d = new Date(str)
  if (isNaN(d)) return ''
  return `${d.getDate()} ${BG_MONTHS[d.getMonth()]}`
}
function useZooNews() {
  const [news,    setNews]    = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    fetch('https://api.allorigins.win/raw?url=' + encodeURIComponent('https://zoosofia.eu/feed/'))
      .then(r => { if (!r.ok) throw new Error(); return r.text() })
      .then(xml => {
        const doc   = new DOMParser().parseFromString(xml, 'text/xml')
        const items = [...doc.querySelectorAll('item')].slice(0, 6).map(item => {
          const get = tag => item.querySelector(tag)?.textContent?.trim() ?? ''
          const ce  =
            item.getElementsByTagName('content:encoded')[0]?.textContent ||
            item.getElementsByTagNameNS('http://purl.org/rss/1.0/modules/content/', 'encoded')[0]?.textContent || ''
          // grab first <category> tag as chip label
          const cat = get('category')
          return {
            title:   get('title'),
            link:    get('guid') || get('link'),
            pubDate: get('pubDate'),
            image:   extractImg(ce),
            cat:     cat ? cat.slice(0, 16).toUpperCase() : null,
          }
        })
        setNews(items)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])
  return { news, loading }
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  const now              = new Date()
  const emoji            = dayEmoji(now)
  const dayLabel         = BG_DAYS[now.getDay()].toUpperCase()
  const dateLabel        = `${now.getDate()} ${BG_MONTHS[now.getMonth()].toUpperCase()}`
  const { isOpen, hoursStr } = getZooStatus()
  const feedings         = FEEDINGS[now.getDay()]
  const wx               = useWeather()
  const { news, loading } = useZooNews()

  return (
    <div className="flex flex-col pb-6 bg-[--color-bg-base]">

      {/* ── Greeting ──────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between px-4 pt-12 pb-2">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-zoo-brown opacity-50 mb-1">
            {dayLabel} · {dateLabel}
          </p>
          <div className="flex items-center gap-2">
            <p className="text-[30px] font-bold text-zoo-brown leading-none tracking-tight">
              Здравей ,
            </p>
            {/* Emoji badge */}
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-[--color-bg-card] border border-[--color-border] text-[22px] leading-none shadow-sm">
              {emoji}
            </span>
          </div>
        </div>

        {/* Settings cog */}
        <Link
          to="/settings"
          className="mt-1 w-9 h-9 rounded-full bg-[--color-bg-card] border border-[--color-border] flex items-center justify-center text-[16px] shadow-sm active:scale-90 transition-transform"
        >
          ✦
        </Link>
      </div>

      {/* ── Today card ────────────────────────────────────────────────────── */}
      <div className="mx-4 mt-2 mb-4 rounded-2xl border border-zoo-green/20 bg-zoo-green/10 px-4 py-3.5 relative overflow-hidden">
        {/* Pulsing live dot */}
        <span className="absolute top-3.5 right-3.5 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zoo-green opacity-50" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-zoo-green" />
        </span>

        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-zoo-green mb-1.5">
          ДНЕС В ЗООПАРКА
        </p>

        <p className={`text-[18px] font-bold leading-tight mb-1 ${isOpen ? 'text-zoo-brown' : 'text-red-500'}`}>
          {isOpen ? 'Отворено' : 'Затворено'} · {hoursStr}
        </p>

        {/* Weather line */}
        {wx && (
          <p className="text-[12px] text-zoo-brown opacity-60 mb-2.5">
            {wx.condition} · {wx.temp}° · {wx.wind}
          </p>
        )}
        {!wx && <div className="h-4 mb-2.5" />}

        {/* Feeding chips */}
        <div className="flex flex-wrap gap-1.5">
          {feedings.map((f, i) => (
            <Link
              key={i}
              to="/today"
              className="inline-flex items-center gap-1 bg-white/60 border border-zoo-green/20 rounded-full pl-1.5 pr-2.5 py-1 text-[11px] font-semibold text-zoo-brown active:scale-95 transition-transform"
            >
              <span className="w-5 h-5 rounded-full bg-zoo-green/15 flex items-center justify-center text-[11px] leading-none">
                {f.emoji}
              </span>
              {f.label} {f.time}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Quick-action 2×2 grid ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2.5 px-4 mb-5">
        {ACTIONS.map(({ to, Icon, label, sub, featured }) => (
          <Link
            key={to}
            to={to}
            className={`rounded-2xl px-4 pt-3.5 pb-3.5 flex flex-col justify-between h-[108px] active:scale-95 transition-transform border ${
              featured
                ? 'bg-[--color-text-main] border-transparent'
                : 'bg-[--color-bg-card] border-[--color-border]'
            }`}
          >
            {/* Icon in small rounded square */}
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              featured
                ? 'bg-white/15 text-white'
                : 'bg-[--color-bg-base] text-zoo-green border border-[--color-border]'
            }`}>
              <Icon />
            </div>
            {/* Label + subtitle at bottom */}
            <div>
              <p className={`font-bold text-[15px] leading-tight ${featured ? 'text-[--color-bg-base]' : 'text-zoo-brown'}`}>
                {label}
              </p>
              <p className={`font-mono text-[9px] tracking-[0.12em] mt-0.5 ${
                featured ? 'text-white/50' : 'text-zoo-brown opacity-40'
              }`}>
                {sub}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* ── News strip ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 mb-2.5">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-zoo-brown opacity-50 font-semibold">
          НОВИНИ И СЪБИТИЯ
        </p>
        <a
          href="https://zoosofia.eu/новини/"
          target="_blank"
          rel="noreferrer"
          className="text-[11px] text-zoo-brown opacity-50 active:opacity-100"
        >
          ВСИЧКИ →
        </a>
      </div>

      {/* Skeleton */}
      {loading && (
        <div className="flex gap-3 px-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="shrink-0 w-40 rounded-2xl border border-[--color-border] bg-[--color-bg-card] animate-pulse overflow-hidden">
              <div className="h-24 bg-zoo-bark/20" />
              <div className="p-2.5 space-y-1.5">
                <div className="h-2 bg-zoo-bark/30 rounded w-1/2" />
                <div className="h-3 bg-zoo-bark/20 rounded" />
                <div className="h-3 bg-zoo-bark/20 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cards */}
      {!loading && news.length > 0 && (
        <div
          className="flex gap-3 px-4 overflow-x-auto snap-x snap-mandatory pb-1"
          style={{ scrollbarWidth: 'none' }}
        >
          {news.map((item, i) => (
            <a
              key={i}
              href={item.link}
              target="_blank"
              rel="noreferrer"
              className="snap-start shrink-0 w-40 rounded-2xl border border-[--color-border] bg-[--color-bg-card] overflow-hidden active:scale-[0.97] transition-transform"
            >
              {/* Image area with category chip overlay */}
              <div className="relative h-24">
                {item.image ? (
                  <img src={item.image} alt="" className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full bg-zoo-green/10 flex items-center justify-center text-3xl">🐾</div>
                )}
                {/* Category chip on image */}
                {item.cat && (
                  <span className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm text-white font-mono text-[8px] tracking-[0.1em] px-1.5 py-0.5 rounded-md">
                    {item.cat}
                  </span>
                )}
              </div>

              {/* Text below image */}
              <div className="px-2.5 pt-2 pb-3">
                <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-zoo-brown opacity-50 mb-1">
                  {newsDate(item.pubDate)}
                </p>
                <p className="text-[11px] font-semibold text-zoo-brown leading-snug line-clamp-3">
                  {item.title}
                </p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
