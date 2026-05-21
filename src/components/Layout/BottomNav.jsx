import { NavLink } from 'react-router-dom'

// ── SVG tab icons — outline style ─────────────────────────────────────────────
function HomeIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="1.8"
      stroke={active ? 'currentColor' : 'currentColor'}
      strokeLinecap="round" strokeLinejoin="round"
    >
      {active
        ? <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5Z" fill="currentColor" fillOpacity="0.15" />
        : null
      }
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5Z" />
      <path d="M9 21V12h6v9" />
    </svg>
  )
}

function MapIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="1.8"
      stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
    >
      {active && <path d="M9 3L3 6.5v14L9 17l6 3.5 6-3.5V3l-6 3.5L9 3z" fill="currentColor" fillOpacity="0.12" />}
      <path d="M9 3L3 6.5v14L9 17l6 3.5 6-3.5V3l-6 3.5L9 3z" />
      <line x1="9" y1="3" x2="9" y2="17" />
      <line x1="15" y1="6.5" x2="15" y2="20.5" />
    </svg>
  )
}

function PawIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="1.8"
      stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
    >
      {/* Body pad */}
      <ellipse cx="12" cy="14.5" rx="4.5" ry="3.5" fill={active ? 'currentColor' : 'none'} fillOpacity="0.15" />
      <ellipse cx="12" cy="14.5" rx="4.5" ry="3.5" />
      {/* Toe pads */}
      <ellipse cx="7.5" cy="11"  rx="1.5" ry="2" />
      <ellipse cx="10"  cy="8.5" rx="1.5" ry="2" />
      <ellipse cx="14"  cy="8.5" rx="1.5" ry="2" />
      <ellipse cx="16.5" cy="11" rx="1.5" ry="2" />
    </svg>
  )
}

function CalendarIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="1.8"
      stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" fill={active ? 'currentColor' : 'none'} fillOpacity="0.12" />
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8"  y1="2" x2="8"  y2="6" />
      <line x1="3"  y1="10" x2="21" y2="10" />
      {active && <circle cx="12" cy="16" r="2" fill="currentColor" />}
    </svg>
  )
}

function MoreIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="1.8"
      stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" fill={active ? 'currentColor' : 'none'} fillOpacity="0.1" />
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="8"  x2="12" y2="8.01" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="12" y1="12" x2="12" y2="16" />
    </svg>
  )
}

// ── Tab config ────────────────────────────────────────────────────────────────
const TABS = [
  { to: '/',         label: 'Начало',   Icon: HomeIcon     },
  { to: '/map',      label: 'Карта',    Icon: MapIcon      },
  { to: '/animals',  label: 'Животни',  Icon: PawIcon      },
  { to: '/today',    label: 'Днес',     Icon: CalendarIcon },
  { to: '/settings', label: 'Още',      Icon: MoreIcon     },
]

export default function BottomNav() {
  return (
    <nav className="bg-[--color-bg-card] border-t border-[--color-border] flex shrink-0 z-50">
      {TABS.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-2 text-[10px] font-semibold gap-0.5 transition-colors ${
              isActive ? 'text-zoo-green' : 'text-zoo-brown opacity-50'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon active={isActive} />
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
