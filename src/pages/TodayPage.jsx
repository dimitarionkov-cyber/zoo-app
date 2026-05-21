import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

// ── Shared helpers (mirrors HomePage) ────────────────────────────────────────
const BG_DAYS   = ['Неделя','Понеделник','Вторник','Сряда','Четвъртък','Петък','Събота']
const BG_MONTHS = ['яну','фев','мар','апр','май','юни','юли','авг','сеп','окт','ное','дек']

const SUMMER_HOURS = [
  { label: 'Каса',              time: '9:30 – 18:00' },
  { label: 'Достъп до парка',   time: 'до 19:00'     },
  { label: 'Изложбена зала',    time: '9:30 – 18:00' },
]
const WINTER_HOURS = [
  { label: 'Каса',              time: '8:30 – 16:30' },
  { label: 'Достъп до парка',   time: 'до 17:00'     },
  { label: 'Изложбена зала',    time: '9:00 – 16:30' },
]

function getZooStatus() {
  const now    = new Date()
  const month  = now.getMonth()
  const t      = now.getHours() * 60 + now.getMinutes()
  const winter = month >= 10 || month <= 2
  const open   = winter ? 8 * 60 + 30 : 9 * 60 + 30
  const close  = winter ? 17 * 60 : 19 * 60
  return {
    isOpen:   t >= open && t < close,
    hoursStr: winter ? '8:30 — 17:00' : '9:30 — 19:00',
    winter,
    rows:     winter ? WINTER_HOURS : SUMMER_HOURS,
    season:   winter ? 'Зима (ноември – март)' : 'Лято (април – октомври)',
  }
}

const FEEDINGS = [
  [{ emoji: '🐧', label: 'Пингвини', time: '11:00', note: 'Открито пред посетителите' }, { emoji: '🦭', label: 'Тюлени',  time: '14:00', note: 'При водния басейн' }],
  [{ emoji: '🐧', label: 'Пингвини', time: '11:00', note: 'Открито пред посетителите' }, { emoji: '🦦', label: 'Видри',   time: '14:30', note: 'При реката' }],
  [{ emoji: '🐧', label: 'Пингвини', time: '11:00', note: 'Открито пред посетителите' }, { emoji: '🦁', label: 'Лъвове',  time: '15:00', note: 'Африкански сектор' }],
  [{ emoji: '🐧', label: 'Пингвини', time: '11:00', note: 'Открито пред посетителите' }, { emoji: '🦦', label: 'Видри',   time: '14:30', note: 'При реката' }],
  [{ emoji: '🐧', label: 'Пингвини', time: '11:00', note: 'Открито пред посетителите' }, { emoji: '🦭', label: 'Тюлени',  time: '14:00', note: 'При водния басейн' }],
  [{ emoji: '🐧', label: 'Пингвини', time: '11:00', note: 'Открито пред посетителите' }, { emoji: '🦁', label: 'Лъвове',  time: '15:00', note: 'Африкански сектор' }],
  [{ emoji: '🐧', label: 'Пингвини', time: '11:00', note: 'Открито пред посетителите' }, { emoji: '🦦', label: 'Видри',   time: '14:30', note: 'При реката' }, { emoji: '🐻', label: 'Мечки', time: '16:00', note: 'Мечкарник' }],
]

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
  return `${d.getDate()} ${BG_MONTHS[d.getMonth()]} ${d.getFullYear()}`
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
        const items = [...doc.querySelectorAll('item')].slice(0, 3).map(item => {
          const get = tag => item.querySelector(tag)?.textContent?.trim() ?? ''
          const ce  =
            item.getElementsByTagName('content:encoded')[0]?.textContent ||
            item.getElementsByTagNameNS('http://purl.org/rss/1.0/modules/content/', 'encoded')[0]?.textContent || ''
          const raw = get('description')
          const excerpt = (() => {
            const div = document.createElement('div')
            div.innerHTML = raw
            return (div.textContent?.trim() ?? '').slice(0, 120)
          })()
          return { title: get('title'), link: get('guid') || get('link'), pubDate: get('pubDate'), image: extractImg(ce), excerpt }
        })
        setNews(items)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return { news, loading }
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function TodayPage() {
  const now       = new Date()
  const dayName   = BG_DAYS[now.getDay()]
  const dateStr   = `${now.getDate()} ${BG_MONTHS[now.getMonth()]} ${now.getFullYear()}`
  const feedings  = FEEDINGS[now.getDay()]
  const { isOpen, hoursStr, rows, season } = getZooStatus()
  const { news, loading } = useZooNews()

  return (
    <div className="flex flex-col pb-8">

      {/* Header */}
      <div className="bg-zoo-green px-4 pt-10 pb-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/60 mb-0.5">
          {dayName.toUpperCase()} · {dateStr.toUpperCase()}
        </p>
        <h1 className="text-2xl font-bold text-white">Днес в зоопарка</h1>
      </div>

      <div className="px-4 pt-4 space-y-4">

        {/* Open status */}
        <div className={`rounded-2xl border px-4 py-4 ${isOpen
          ? 'bg-zoo-green/10 border-zoo-green/25'
          : 'bg-red-50 border-red-200'
        }`}>
          <p className={`text-[17px] font-bold mb-0.5 ${isOpen ? 'text-zoo-brown' : 'text-red-600'}`}>
            {isOpen ? '🟢 Отворено' : '🔴 Затворено'}
          </p>
          <p className={`text-sm font-semibold ${isOpen ? 'text-zoo-green' : 'text-red-500'}`}>
            {hoursStr}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-zoo-brown opacity-50 mt-1">
            {season}
          </p>
        </div>

        {/* Hours breakdown */}
        <div className="bg-[--color-bg-card] rounded-2xl border border-[--color-border] overflow-hidden">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-zoo-green px-4 pt-3 pb-2">
            Работно Време
          </p>
          {rows.map((row, i) => (
            <div
              key={i}
              className={`flex items-center justify-between px-4 py-2.5 ${i < rows.length - 1 ? 'border-b border-[--color-border]' : ''}`}
            >
              <span className="text-sm text-zoo-brown">{row.label}</span>
              <span className="text-sm font-semibold text-zoo-brown">{row.time}</span>
            </div>
          ))}
        </div>

        {/* Feedings */}
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-zoo-green mb-2">
            Хранения днес
          </p>
          <div className="space-y-2">
            {feedings.map((f, i) => (
              <div
                key={i}
                className="bg-[--color-bg-card] border border-[--color-border] rounded-2xl px-4 py-3 flex items-center gap-3"
              >
                <span className="text-2xl leading-none">{f.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-zoo-brown">{f.label}</p>
                  <p className="text-[11px] text-zoo-brown opacity-60">{f.note}</p>
                </div>
                <div className="shrink-0 text-right">
                  <span className="font-mono text-sm font-bold text-zoo-green">{f.time}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-zoo-brown opacity-40 mt-2 px-1">
            * Часовете са приблизителни. Програмата може да се промени.
          </p>
        </div>

        {/* News */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-zoo-green font-semibold">
              Последни Новини
            </p>
            <a
              href="https://zoosofia.eu/новини/"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-zoo-brown opacity-50"
            >
              всички →
            </a>
          </div>

          {loading && (
            <div className="space-y-2">
              {[1,2].map(i => (
                <div key={i} className="bg-[--color-bg-card] rounded-2xl border border-[--color-border] p-4 animate-pulse">
                  <div className="h-3 bg-zoo-bark/30 rounded w-1/3 mb-2" />
                  <div className="h-4 bg-zoo-bark/20 rounded w-3/4" />
                </div>
              ))}
            </div>
          )}

          {!loading && (
            <div className="space-y-2">
              {news.map((item, i) => (
                <a
                  key={i}
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start gap-3 bg-[--color-bg-card] rounded-2xl p-3 border border-[--color-border] active:scale-[0.98] transition-transform"
                >
                  {item.image ? (
                    <img src={item.image} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" loading="lazy" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-zoo-green/10 flex items-center justify-center text-xl shrink-0">🐾</div>
                  )}
                  <div className="flex-1 min-w-0 py-0.5">
                    <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-zoo-green mb-1">
                      {newsDate(item.pubDate)}
                    </p>
                    <p className="text-sm font-semibold text-zoo-brown leading-snug line-clamp-2">
                      {item.title}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Full info link */}
        <Link
          to="/info"
          className="flex items-center gap-3 bg-[--color-bg-card] border border-[--color-border] rounded-2xl px-4 py-3.5 active:scale-[0.98] transition-transform"
        >
          <span className="text-xl">ℹ️</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-zoo-brown">Цялата информация</p>
            <p className="text-[11px] text-zoo-brown opacity-50">Цени, транспорт, контакти</p>
          </div>
          <span className="text-zoo-brown opacity-40 text-lg">›</span>
        </Link>

      </div>
    </div>
  )
}
