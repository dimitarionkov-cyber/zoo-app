import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

// ── Date / locale helpers ─────────────────────────────────────────────────────
const BG_DAYS   = ['Неделя','Понеделник','Вторник','Сряда','Четвъртък','Петък','Събота']
const BG_MONTHS = ['яну','фев','мар','апр','май','юни','юли','авг','сеп','окт','ное','дек']

// Stable emoji per calendar day — seeded from date so it never flickers
const DAY_EMOJIS = ['🦁','🐼','🐻','🦊','🦒','🐘','🦓','🦏']
function dayEmoji(d) {
  const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()
  return DAY_EMOJIS[seed % DAY_EMOJIS.length]
}

// ── Zoo open/closed logic ─────────────────────────────────────────────────────
// Summer: Apr–Oct  |  Winter: Nov–Mar
function getZooStatus() {
  const now    = new Date()
  const month  = now.getMonth()          // 0-indexed
  const t      = now.getHours() * 60 + now.getMinutes()
  const winter = month >= 10 || month <= 2
  const open   = winter ? 8 * 60 + 30 : 9 * 60 + 30   // ticket office
  const close  = winter ? 17 * 60      : 19 * 60        // park access
  return {
    isOpen:   t >= open && t < close,
    hoursStr: winter ? '8:30 — 17:00' : '9:30 — 19:00',
  }
}

// ── Feeding schedule (static — replace with real data when available) ─────────
// Index 0 = Sunday … 6 = Saturday
const FEEDINGS = [
  [{ emoji: '🐧', label: 'Пингвини', time: '11:00' }, { emoji: '🦭', label: 'Тюлени',  time: '14:00' }],
  [{ emoji: '🐧', label: 'Пингвини', time: '11:00' }, { emoji: '🦦', label: 'Видри',   time: '14:30' }],
  [{ emoji: '🐧', label: 'Пингвини', time: '11:00' }, { emoji: '🦁', label: 'Лъвове',  time: '15:00' }],
  [{ emoji: '🐧', label: 'Пингвини', time: '11:00' }, { emoji: '🦦', label: 'Видри',   time: '14:30' }],
  [{ emoji: '🐧', label: 'Пингвини', time: '11:00' }, { emoji: '🦭', label: 'Тюлени',  time: '14:00' }],
  [{ emoji: '🐧', label: 'Пингвини', time: '11:00' }, { emoji: '🦁', label: 'Лъвове',  time: '15:00' }],
  [{ emoji: '🐧', label: 'Пингвини', time: '11:00' }, { emoji: '🦦', label: 'Видри',   time: '14:30' }, { emoji: '🐻', label: 'Мечки', time: '16:00' }],
]

// ── Quick-access grid ─────────────────────────────────────────────────────────
const ACTIONS = [
  { to: '/map',      icon: '🗺️', label: 'Карта',      sub: 'до тебе'       },
  { to: '/animals',  icon: '🐾', label: 'Животните',  sub: '150 вида'      },
  { to: '/search',   icon: '🔍', label: 'Търсене',    sub: 'по вид'        },
  { to: '/info',     icon: '🎟️', label: 'Билети',     sub: 'цени и часове' },
]

// ── RSS news ──────────────────────────────────────────────────────────────────
function newsDate(str) {
  if (!str) return ''
  const d = new Date(str)
  if (isNaN(d)) return ''
  return `${d.getDate()} ${BG_MONTHS[d.getMonth()].toUpperCase()}`
}

function extractImg(html) {
  if (!html) return null
  const div = document.createElement('div')
  div.innerHTML = html
  const img = div.querySelector('img')
  return img?.getAttribute('data-src') || img?.getAttribute('src') || null
}

function useZooNews() {
  const [news,    setNews]    = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const url = 'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://zoosofia.eu/feed/')
    fetch(url)
      .then(r => { if (!r.ok) throw new Error(); return r.text() })
      .then(xml => {
        const doc   = new DOMParser().parseFromString(xml, 'text/xml')
        const items = [...doc.querySelectorAll('item')].slice(0, 6).map(item => {
          const get = tag => item.querySelector(tag)?.textContent?.trim() ?? ''
          const ce  =
            item.getElementsByTagName('content:encoded')[0]?.textContent ||
            item.getElementsByTagNameNS('http://purl.org/rss/1.0/modules/content/', 'encoded')[0]?.textContent || ''
          return { title: get('title'), link: get('guid') || get('link'), pubDate: get('pubDate'), image: extractImg(ce) }
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
  const { news, loading } = useZooNews()

  return (
    <div className="flex flex-col pb-6">

      {/* ── Greeting bar ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 pt-12 pb-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-zoo-brown opacity-50 mb-0.5">
            {dayLabel} · {dateLabel}
          </p>
          <p className="text-[22px] font-bold text-zoo-brown leading-tight">
            Здравей! {emoji}
          </p>
        </div>
        <Link
          to="/settings"
          className="w-9 h-9 rounded-full bg-[--color-bg-card] border border-[--color-border] flex items-center justify-center text-[18px] active:scale-90 transition-transform shadow-sm"
        >
          ⚙️
        </Link>
      </div>

      {/* ── Today card ────────────────────────────────────────────────────── */}
      <div className="mx-4 mb-4 rounded-2xl border border-zoo-green/25 bg-zoo-green/10 px-4 py-3.5">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-zoo-green mb-1.5">
          ДНЕС В ЗООПАРКА
        </p>
        <p className={`text-[15px] font-bold mb-3 leading-tight ${isOpen ? 'text-zoo-brown' : 'text-red-500'}`}>
          {isOpen ? '🟢 Отворено' : '🔴 Затворено'} · {hoursStr}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {feedings.map((f, i) => (
            <Link
              key={i}
              to="/today"
              className="inline-flex items-center gap-1 bg-white/50 border border-zoo-green/20 rounded-full px-2.5 py-1 text-[11px] font-semibold text-zoo-green active:scale-95 transition-transform"
            >
              {f.emoji} {f.label} · {f.time}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Quick actions 2×2 ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2.5 px-4 mb-5">
        {ACTIONS.map(({ to, icon, label, sub }) => (
          <Link
            key={to}
            to={to}
            className="bg-[--color-bg-card] border border-[--color-border] rounded-2xl px-4 py-4 flex items-center gap-3 active:scale-95 transition-transform"
          >
            <span className="text-2xl leading-none shrink-0">{icon}</span>
            <div className="min-w-0">
              <p className="font-bold text-[13px] text-zoo-brown leading-tight">{label}</p>
              <p className="font-mono text-[10px] text-zoo-brown opacity-50 mt-0.5 leading-tight">{sub}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* ── News strip ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 mb-2.5">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-zoo-green font-semibold">
          Новини и събития
        </p>
        <a
          href="https://zoosofia.eu/новини/"
          target="_blank"
          rel="noreferrer"
          className="text-[11px] text-zoo-brown opacity-50 active:opacity-100"
        >
          всички →
        </a>
      </div>

      {loading && (
        <div className="flex gap-3 px-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="shrink-0 w-36 rounded-2xl border border-[--color-border] bg-[--color-bg-card] animate-pulse overflow-hidden">
              <div className="h-16 bg-zoo-bark/20" />
              <div className="p-2.5 space-y-1.5">
                <div className="h-2 bg-zoo-bark/30 rounded w-1/2" />
                <div className="h-3 bg-zoo-bark/20 rounded" />
                <div className="h-3 bg-zoo-bark/20 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      )}

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
              className="snap-start shrink-0 w-36 rounded-2xl border border-[--color-border] bg-[--color-bg-card] overflow-hidden active:scale-[0.97] transition-transform"
            >
              {item.image ? (
                <img src={item.image} alt="" className="w-full h-16 object-cover" loading="lazy" />
              ) : (
                <div className="w-full h-16 bg-zoo-green/10 flex items-center justify-center text-2xl">🐾</div>
              )}
              <div className="px-2.5 pt-2 pb-3">
                <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-zoo-green mb-1">
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
