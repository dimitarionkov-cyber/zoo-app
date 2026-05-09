import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/',         label: 'Начало',    icon: '🏠' },
  { to: '/map',      label: 'Карта',     icon: '🗺️' },
  { to: '/animals',  label: 'Животни',   icon: '🦁' },
  { to: '/search',   label: 'Търсене',   icon: '🔍' },
  { to: '/info',     label: 'Инфо',      icon: 'ℹ️' },
  { to: '/settings', label: 'Настройки', icon: '⚙️' },
]

export default function BottomNav() {
  return (
    <nav className="bg-[--color-bg-card] border-t border-[--color-border] flex shrink-0 z-50">
      {tabs.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-2.5 text-[10px] font-medium gap-0.5 transition-colors ${
              isActive ? 'text-zoo-green' : 'text-zoo-brown opacity-60'
            }`
          }
        >
          <span className="text-xl leading-none">{icon}</span>
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
