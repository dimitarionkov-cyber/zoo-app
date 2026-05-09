import { Link } from 'react-router-dom'

const sections = [
  { to: '/map',     label: 'Карта',     icon: '🗺️', desc: 'Разгледай зоопарка' },
  { to: '/animals', label: 'Животните', icon: '🦁', desc: 'Всички видове'       },
]

export default function HomePage() {
  return (
    <div className="p-4">
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold text-[--color-zoo-green]">Зоопарк София</h1>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {sections.map(({ to, label, icon, desc }) => (
          <Link
            key={to}
            to={to}
            className="bg-[--color-bg-card] rounded-2xl p-5 flex flex-col items-center gap-2 shadow-sm border border-[--color-border] active:scale-95 transition-transform"
          >
            <span className="text-4xl">{icon}</span>
            <span className="font-semibold text-[--color-zoo-green]">{label}</span>
            <span className="text-xs text-[--color-zoo-brown] opacity-70">{desc}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
