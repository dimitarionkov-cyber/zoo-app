import { useState } from 'react'

// ── Data (source: zoosofia.eu) ────────────────────────────────────────────────

const HOURS = [
  {
    season: 'Лято',
    period: 'Април – Октомври',
    rows: [
      { label: 'Каса',              time: '9:30 – 18:00' },
      { label: 'Достъп до парка',   time: 'до 19:00'     },
      { label: 'Изложбена зала',    time: '9:30 – 18:00' },
    ],
  },
  {
    season: 'Зима',
    period: 'Ноември – Март',
    rows: [
      { label: 'Каса',              time: '8:30 – 16:30' },
      { label: 'Достъп до парка',   time: 'до 17:00'     },
      { label: 'Изложбена зала',    time: '9:00 – 16:30' },
    ],
  },
]

const PRICES = [
  { label: 'Деца до 3 г.',                        price: 'Безплатно', free: true  },
  { label: 'Деца и младежи (3–18 г.)',             price: '€2.56'                 },
  { label: 'Възрастни (18+)',                      price: '€5.11'                 },
  { label: 'Пенсионери / Студенти / Докторанти',   price: '€2.56'                 },
  { label: 'Хора с увреждания (50%+)',             price: '€2.56'                 },
  { label: 'Деца с увреждания + придружител',      price: 'Безплатно', free: true  },
]

const FAMILY_PRICES = [
  { label: '2 родители + 1 дете (3–18 г.)',   price: '€10.23' },
  { label: '2 родители + 2+ деца (3–18 г.)',  price: '€12.78' },
]

const GROUP_PRICES = [
  { label: 'Деца 3–18 г. (група от 15+)',  price: '€2.05' },
  { label: 'Възрастни 18+ (група от 15+)', price: '€3.05' },
]

const SUBSCRIPTION = [
  { label: 'Годишна карта (2 посещения/ден)', price: '€76.69' },
  { label: 'Издаване на карта',               price: '€3.07'  },
]

const TRANSPORT = [
  {
    type: 'Метро + Автобус',
    icon: '🚇',
    colour: 'bg-blue-100 text-blue-800 border-blue-300',
    note: 'Метро Линия 2 → спирка „Витоша" → автобус до Западен вход (ул. Сребърна 1)',
    lines: ['64', '66', '68', '83', '88', '98', '120', '288', '805'],
    warning: 'Линии 68 и 805 — само в делнични дни',
  },
  {
    type: 'Автобус → Централен вход',
    icon: '🚌',
    colour: 'bg-green-100 text-green-800 border-green-300',
    note: 'Спирка „ЖК Дианабад" · бул. Симеоновско шосе',
    lines: ['67', '102'],
    warning: null,
  },
]

const CONTACTS = [
  { icon: '📍', label: 'Главен вход',   value: 'бул. Симеоновско шосе (ЖК Дианабад)' },
  { icon: '📍', label: 'Западен вход',  value: 'ул. Сребърна 1, 1407 София' },
  { icon: '📞', label: 'Телефон',       value: '0878 640 375',               href: 'tel:+359878640375',       note: 'Пон–Пет, 8:00–17:00' },
  { icon: '📧', label: 'Имейл',         value: 'zoosofia@zoosofia.eu',       href: 'mailto:zoosofia@zoosofia.eu' },
  { icon: '🌐', label: 'Уебсайт',       value: 'zoosofia.eu',                href: 'https://zoosofia.eu'      },
]

const ENTRANCES = [
  {
    label: 'Главен вход',
    sublabel: 'бул. Симеоновско шосе',
    icon: '🚪',
    lat: 42.6597941,
    lng: 23.3340426,
  },
  {
    label: 'Западен вход',
    sublabel: 'ул. Сребърна 1',
    icon: '🚪',
    lat: 42.660139,
    lng: 23.3307871,
  },
]

// ── Collapsible section ───────────────────────────────────────────────────────
function Section({ icon, title, open, onToggle, children }) {
  return (
    <div className="bg-[--color-bg-card] rounded-2xl border border-[--color-border] overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-4 text-left"
      >
        <span className="text-2xl leading-none">{icon}</span>
        <span className="flex-1 font-bold text-zoo-green">{title}</span>
        <span
          className="text-zoo-brown opacity-50 text-xl leading-none transition-transform duration-200"
          style={{ display: 'inline-block', transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}
        >
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

function PriceRow({ label, price, free }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[--color-border] last:border-0">
      <span className="text-sm text-zoo-brown pr-3 leading-snug">{label}</span>
      <span className={`text-sm font-bold shrink-0 ${free ? 'text-zoo-green' : 'text-zoo-brown'}`}>
        {price}
      </span>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function InfoPage() {
  const [openSection, setOpenSection] = useState('hours')

  function toggle(key) {
    setOpenSection(s => s === key ? null : key)
  }

  return (
    <div className="flex flex-col pb-8">
      {/* Header */}
      <div className="bg-zoo-primary px-4 pt-10 pb-5">
        <h1 className="text-2xl font-bold text-white">Информация</h1>
        <p className="text-white/70 text-sm mt-0.5">Зоопарк София · zoosofia.eu</p>
      </div>

      <div className="flex flex-col gap-3 px-4 mt-4">

        {/* Working hours */}
        <Section icon="🕘" title="Работно време" open={openSection === 'hours'} onToggle={() => toggle('hours')}>
          <p className="text-xs text-zoo-brown opacity-60 mt-3 mb-1">
            Отворен всеки ден, включително официални празници.
          </p>
          {HOURS.map(h => (
            <div key={h.season} className="mt-3">
              <div className="flex items-baseline gap-2 mb-1">
                <p className="text-sm font-bold text-zoo-green">{h.season}</p>
                <p className="text-xs text-zoo-brown opacity-50">{h.period}</p>
              </div>
              {h.rows.map(r => (
                <div key={r.label} className="flex justify-between items-center py-1.5 border-b border-[--color-border] last:border-0">
                  <span className="text-xs text-zoo-brown opacity-70">{r.label}</span>
                  <span className="text-xs font-semibold text-zoo-brown">{r.time}</span>
                </div>
              ))}
            </div>
          ))}
        </Section>

        {/* Ticket prices */}
        <Section icon="🎟️" title="Цени на билети" open={openSection === 'tickets'} onToggle={() => toggle('tickets')}>
          <div className="mt-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zoo-brown opacity-50 mb-1">Индивидуални</p>
            {PRICES.map(p => <PriceRow key={p.label} {...p} />)}
          </div>

          <div className="mt-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zoo-brown opacity-50 mb-1">Семейни билети</p>
            {FAMILY_PRICES.map(p => <PriceRow key={p.label} {...p} />)}
          </div>

          <div className="mt-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zoo-brown opacity-50 mb-1">Групи (15+ човека · 16-ият безплатно)</p>
            {GROUP_PRICES.map(p => <PriceRow key={p.label} {...p} />)}
          </div>

          <div className="mt-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zoo-brown opacity-50 mb-1">Абонамент</p>
            {SUBSCRIPTION.map(p => <PriceRow key={p.label} {...p} />)}
          </div>

          <p className="text-[11px] text-zoo-brown opacity-40 mt-4">
            Плащане: в брой, ПОС терминал или билетни автомати. Цените са в евро.
          </p>
        </Section>

        {/* Public transport */}
        <Section icon="🚌" title="Обществен транспорт" open={openSection === 'transport'} onToggle={() => toggle('transport')}>
          <div className="space-y-5 mt-3">
            {TRANSPORT.map(t => (
              <div key={t.type}>
                <p className="text-xs font-bold text-zoo-brown opacity-70 mb-1">
                  {t.icon} {t.type}
                </p>
                <p className="text-xs text-zoo-brown opacity-60 mb-2 leading-relaxed">{t.note}</p>
                <div className="flex flex-wrap gap-1.5">
                  {t.lines.map(num => (
                    <span key={num} className={`px-2.5 py-1 rounded-lg border text-xs font-black ${t.colour}`}>
                      {num}
                    </span>
                  ))}
                </div>
                {t.warning && (
                  <p className="text-[11px] text-amber-600 mt-2">⚠ {t.warning}</p>
                )}
              </div>
            ))}
          </div>
        </Section>

        {/* Contact */}
        <Section icon="📞" title="Контакти и адрес" open={openSection === 'contact'} onToggle={() => toggle('contact')}>
          <div className="mt-3">
            {CONTACTS.map(c => (
              <div key={c.label} className="flex items-start gap-3 py-2.5 border-b border-[--color-border] last:border-0">
                <span className="text-lg leading-tight mt-0.5 shrink-0">{c.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-zoo-brown opacity-50 uppercase tracking-wide">{c.label}</p>
                  {c.href ? (
                    <a href={c.href} className="text-sm font-medium text-zoo-green truncate block">
                      {c.value}
                    </a>
                  ) : (
                    <p className="text-sm font-medium text-zoo-brown">{c.value}</p>
                  )}
                  {c.note && <p className="text-[11px] text-zoo-brown opacity-40">{c.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Directions — two half-width buttons */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-zoo-brown opacity-50 mb-2 px-1">
            Упътвания
          </p>
          <div className="grid grid-cols-2 gap-2">
            {ENTRANCES.map(e => (
              <a
                key={e.label}
                href={`https://www.google.com/maps/dir/?api=1&destination=${e.lat},${e.lng}&travelmode=transit`}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center gap-1.5 bg-zoo-primary rounded-2xl px-3 py-4 active:opacity-80 transition-opacity"
              >
                <span className="text-2xl leading-none">🗺️</span>
                <p className="font-bold text-sm text-white text-center leading-tight">{e.label}</p>
                <p className="text-[11px] text-white/70 text-center leading-tight">{e.sublabel}</p>
              </a>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
