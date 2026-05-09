import { Link } from 'react-router-dom'

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

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-full">
      {/* Hero */}
      <div className="bg-zoo-green px-6 pt-14 pb-8 text-center">
        <p className="text-6xl mb-3">🐾</p>
        <h1 className="text-3xl font-bold text-white tracking-wide">Зоопарк София</h1>
        <p className="text-white/70 text-sm mt-1">Неофициален наръчник на посетителя</p>
      </div>

      {/* Quick-access grid */}
      <div className="grid grid-cols-2 gap-3 p-4 flex-1">
        {sections.map(({ to, label, icon, desc, bg, border, text }) => (
          <Link
            key={to}
            to={to}
            className={`${bg} border ${border} rounded-2xl p-5 flex flex-col items-center gap-2 shadow-sm active:scale-95 transition-transform`}
          >
            <span className="text-4xl leading-none">{icon}</span>
            <span className={`font-bold text-base ${text}`}>{label}</span>
            <span className="text-xs text-zoo-brown opacity-70 text-center leading-snug">{desc}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
