import { useState } from 'react'

// ── Data ─────────────────────────────────────────────────────────────────────

const HOURS = [
  { season: 'Лято',   period: 'Април – Октомври', time: '09:00 – 19:00' },
  { season: 'Зима',   period: 'Ноември – Март',   time: '09:00 – 17:00' },
]

const PRICES = [
  { label: 'Възрастни',           price: '12 лв' },
  { label: 'Деца (3–14 г.)',      price: '6 лв'  },
  { label: 'Пенсионери',          price: '6 лв'  },
  { label: 'Деца до 3 г.',        price: 'Безплатно' },
  { label: 'Семеен билет (2+2)',  price: '28 лв' },
]

const TRANSPORT = [
  {
    type: 'Трамвай',
    icon: '🚋',
    colour: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    lines: [
      { num: '1',  stop: 'Зоологическа градина' },
      { num: '7',  stop: 'Зоологическа градина' },
      { num: '10', stop: 'Зоологическа градина' },
    ],
  },
  {
    type: 'Тролейбус',
    icon: '🚎',
    colour: 'bg-blue-100 text-blue-800 border-blue-300',
    lines: [
      { num: '5',  stop: 'Зоологическа градина' },
      { num: '11', stop: 'Зоологическа градина' },
    ],
  },
  {
    type: 'Автобус',
    icon: '🚌',
    colour: 'bg-green-100 text-green-800 border-green-300',
    lines: [
      { num: '68', stop: 'Зоологическа градина' },
    ],
  },
]

const CONTACTS = [
  { icon: '📍', label: 'Адрес',    value: 'ул. Сребърна 1, 1407 София' },
  { icon: '📞', label: 'Телефон',  value: '+359 2 862 40 22', href: 'tel:+35928624022' },
  { icon: '🌐', label: 'Уебсайт', value: 'sofia-zoo.com', href: 'https://sofia-zoo.com' },
  { icon: '📧', label: 'Имейл',   value: 'zoosofia@sofia-zoo.com', href: 'mailto:zoosofia@sofia-zoo.com' },
]

// ── Collapsible section ───────────────────────────────────────────────────────
function Section({ icon, title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="bg-[--color-bg-card] rounded-2xl border border-[--color-border] overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-4 text-left"
      >
        <span className="text-2xl leading-none">{icon}</span>
        <span className="flex-1 font-bold text-zoo-green">{title}</span>
        <span className={`text-zoo-brown opacity-50 text-lg leading-none transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          ›
        </span>
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-[--color-border]">
          {children}
        </div>
      )}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function InfoPage() {
  return (
    <div className="flex flex-col pb-8">
      {/* Header */}
      <div className="bg-zoo-green px-4 pt-10 pb-5">
        <h1 className="text-2xl font-bold text-white">Информация</h1>
        <p className="text-white/70 text-sm mt-0.5">Зоопарк София</p>
      </div>

      <div className="flex flex-col gap-3 px-4 mt-4">

        {/* Working hours */}
        <Section icon="🕘" title="Работно време" defaultOpen>
          <p className="text-xs text-zoo-brown opacity-60 mt-3 mb-3">
            Отворен всеки ден, включително официални празници.
          </p>
          <div className="space-y-2">
            {HOURS.map(h => (
              <div key={h.season} className="flex items-center justify-between py-2.5 border-b border-[--color-border] last:border-0">
                <div>
                  <p className="font-semibold text-zoo-green text-sm">{h.season}</p>
                  <p className="text-xs text-zoo-brown opacity-60">{h.period}</p>
                </div>
                <span className="text-sm font-bold text-zoo-brown">{h.time}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Ticket prices */}
        <Section icon="🎟️" title="Цени на билети">
          <div className="space-y-0 mt-3">
            {PRICES.map(p => (
              <div key={p.label} className="flex items-center justify-between py-2.5 border-b border-[--color-border] last:border-0">
                <span className="text-sm text-zoo-brown">{p.label}</span>
                <span className={`text-sm font-bold ${p.price === 'Безплатно' ? 'text-zoo-green' : 'text-zoo-brown'}`}>
                  {p.price}
                </span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-zoo-brown opacity-40 mt-3">
            * Цените може да са актуализирани — проверете официалния сайт.
          </p>
        </Section>

        {/* Public transport */}
        <Section icon="🚌" title="Обществен транспорт">
          <div className="space-y-4 mt-3">
            {TRANSPORT.map(t => (
              <div key={t.type}>
                <p className="text-xs font-bold uppercase tracking-widest text-zoo-brown opacity-60 mb-2">
                  {t.icon} {t.type}
                </p>
                <div className="flex flex-wrap gap-2">
                  {t.lines.map(l => (
                    <div key={l.num} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold ${t.colour}`}>
                      <span className="text-base font-black">{l.num}</span>
                      <span className="opacity-80">{l.stop}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-zoo-green/10 rounded-xl p-3">
            <p className="text-xs text-zoo-green font-semibold">💡 Съвет</p>
            <p className="text-xs text-zoo-brown mt-1 leading-relaxed">
              Слезте на спирка „Зоологическа градина" — главният вход е на ул. Сребърна 1.
            </p>
          </div>
        </Section>

        {/* Contact */}
        <Section icon="📞" title="Контакти и адрес">
          <div className="space-y-0 mt-3">
            {CONTACTS.map(c => (
              <div key={c.label} className="flex items-start gap-3 py-2.5 border-b border-[--color-border] last:border-0">
                <span className="text-lg leading-tight mt-0.5">{c.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-zoo-brown opacity-50 uppercase tracking-wide">{c.label}</p>
                  {c.href ? (
                    <a href={c.href} className="text-sm font-medium text-zoo-green underline-offset-2 hover:underline truncate block">
                      {c.value}
                    </a>
                  ) : (
                    <p className="text-sm font-medium text-zoo-brown">{c.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Google Maps static link */}
        <a
          href="https://www.google.com/maps/dir/?api=1&destination=42.6583263,23.3311395&travelmode=transit"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 bg-zoo-green text-white rounded-2xl py-3.5 font-semibold text-sm active:opacity-80 transition-opacity"
        >
          🗺️ Упътване до зоопарка
        </a>

      </div>
    </div>
  )
}
