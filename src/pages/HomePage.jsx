import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

// ── Quick-access tiles ────────────────────────────────────────────────────────
const sections = [
  {
    to: '/map',
    label: 'Карта',
    icon: '🗺️',
    desc: 'Разгледай зоопарка',
    bg: 'bg-zoo-green/10',
    border: 'border-zoo-green/20',
    text: 'text-zoo-green',
  },
  {
    to: '/animals',
    label: 'Животните',
    icon: '🦁',
    desc: 'Всички 150 вида',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-800',
    text: 'text-amber-700 dark:text-amber-300',
  },
  {
    to: '/search',
    label: 'Търсене',
    icon: '🔍',
    desc: 'По вид и произход',
    bg: 'bg-sky-50 dark:bg-sky-900/20',
    border: 'border-sky-200 dark:border-sky-800',
    text: 'text-sky-700 dark:text-sky-300',
  },
  {
    to: '/info',
    label: 'Информация',
    icon: 'ℹ️',
    desc: 'Часове, цени, транспорт',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    border: 'border-purple-200 dark:border-purple-800',
    text: 'text-purple-700 dark:text-purple-300',
  },
]

// ── RSS helpers ───────────────────────────────────────────────────────────────
const BG_MONTHS = [
  'яну', 'фев', 'мар', 'апр', 'май', 'юни',
  'юли', 'авг', 'сеп', 'окт', 'ное', 'дек',
]

function formatDate(str) {
  if (!str) return ''
  const d = new Date(str)
  if (isNaN(d)) return ''
  return `${d.getDate()} ${BG_MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

function stripHtml(html) {
  if (!html) return ''
  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent?.trim() ?? ''
}

function extractFirstImage(html) {
  if (!html) return null
  // Parse the content:encoded HTML and grab the first real img src
  const div = document.createElement('div')
  div.innerHTML = html
  const img = div.querySelector('img')
  // Prefer data-src (lazy-load) then src
  return img?.getAttribute('data-src') || img?.getAttribute('src') || null
}

function useZooNews() {
  const [news,    setNews]    = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    const url = 'https://api.rss2json.com/v1/api.json?rss_url=' +
      encodeURIComponent('https://zoosofia.eu/feed/')

    fetch(url, { signal: controller.signal })
      .then(r => { if (!r.ok) throw new Error('bad response'); return r.json() })
      .then(data => {
        clearTimeout(timeout)
        if (data.status !== 'ok') throw new Error('feed error')
        const items = data.items.slice(0, 3).map(item => {
          const image = item.thumbnail || extractFirstImage(item.content) || null
          const excerpt = stripHtml(item.description).slice(0, 110)
          return {
            title:   item.title,
            link:    item.link,
            pubDate: item.pubDate,
            excerpt: excerpt + (excerpt.length === 110 ? '…' : ''),
            image,
          }
        })
        setNews(items)
        setLoading(false)
      })
      .catch(() => { setError(true); setLoading(false) })

    return () => { clearTimeout(timeout); controller.abort() }
  }, [])

  return { news, loading, error }
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { news, loading, error } = useZooNews()

  return (
    <div className="flex flex-col pb-6">
      {/* Hero */}
      <div className="bg-zoo-green px-6 pt-14 pb-6 text-center">
        <p className="text-5xl mb-2">🐾</p>
        <h1 className="text-3xl font-bold text-white tracking-wide">Зоопарк София</h1>
        <p className="text-white/70 text-sm mt-1">Неофициален наръчник на посетителя</p>
      </div>

      {/* Quick-access grid — compact */}
      <div className="grid grid-cols-2 gap-3 px-4 pt-4">
        {sections.map(({ to, label, icon, desc, bg, border, text }) => (
          <Link
            key={to}
            to={to}
            className={`${bg} border ${border} rounded-2xl px-4 py-3.5 flex flex-col items-center gap-1.5 active:scale-95 transition-transform`}
          >
            <span className="text-3xl leading-none">{icon}</span>
            <span className={`font-bold text-sm ${text}`}>{label}</span>
            <span className="text-[11px] text-zoo-brown opacity-70 text-center leading-tight">{desc}</span>
          </Link>
        ))}
      </div>

      {/* News & events */}
      <div className="px-4 pt-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zoo-green">
            Новини и събития
          </h2>
          <a
            href="https://zoosofia.eu/новини/"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-zoo-brown opacity-50 active:opacity-100"
          >
            Всички →
          </a>
        </div>

        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-[--color-bg-card] rounded-2xl p-4 border border-[--color-border] animate-pulse">
                <div className="h-3 bg-zoo-bark/40 rounded w-1/3 mb-2" />
                <div className="h-4 bg-zoo-bark/40 rounded w-3/4 mb-1" />
                <div className="h-3 bg-zoo-bark/30 rounded w-full" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="bg-[--color-bg-card] rounded-2xl p-4 border border-[--color-border] text-center">
            <p className="text-sm text-zoo-brown opacity-50">Новините не са достъпни в момента</p>
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-3">
            {news.map((item, i) => (
              <a
                key={i}
                href={item.link}
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-3 bg-[--color-bg-card] rounded-2xl p-3 border border-[--color-border] active:scale-[0.98] transition-transform"
              >
                {item.image && (
                  <img
                    src={item.image}
                    alt=""
                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                    loading="lazy"
                  />
                )}
                <div className="flex-1 min-w-0 py-0.5">
                  <p className="text-[11px] text-zoo-green font-semibold uppercase tracking-wide mb-1">
                    {formatDate(item.pubDate)}
                  </p>
                  <p className="text-sm font-semibold text-zoo-brown leading-snug mb-1">
                    {item.title}
                  </p>
                  {item.excerpt && (
                    <p className="text-xs text-zoo-brown opacity-60 leading-relaxed line-clamp-2">
                      {item.excerpt}
                    </p>
                  )}
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
