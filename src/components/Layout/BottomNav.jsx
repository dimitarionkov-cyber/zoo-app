import { NavLink } from 'react-router-dom'
import { useData } from '../../context/DataContext'

// Font & colour constants (from Zoo App Dashboard.html)
const F = {
  body: "'Manrope', system-ui, sans-serif",
}
const LIGHT = { paper:'#f4efe3', ink:'#1a1d14', ink3:'#847f6e', green:'#2f6b3d', rule:'#d5cdb6' }
const DARK  = { paper:'#15170e', ink:'#ece5d0', ink3:'#75725f', green:'#7eb888', rule:'#2f3122' }

// ── SVG icons — exact viewBox + paths from Zoo App Dashboard.html ─────────────
const ICONS = {
  home: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 11.2 12 4l8.5 7.2"/>
      <path d="M5.5 10v9h13v-9"/>
      <path d="M10 19v-5h4v5"/>
    </svg>
  ),
  map: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6.5 9 4l6 2.5 6-2.5v13l-6 2.5-6-2.5L3 19.5z"/>
      <path d="M9 4v15.5M15 6.5V22"/>
    </svg>
  ),
  paw: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="7"  cy="9"   rx="1.6" ry="2.2"/>
      <ellipse cx="12" cy="6.5" rx="1.6" ry="2.2"/>
      <ellipse cx="17" cy="9"   rx="1.6" ry="2.2"/>
      <ellipse cx="5"  cy="14"  rx="1.4" ry="1.8"/>
      <ellipse cx="19" cy="14"  rx="1.4" ry="1.8"/>
      <path d="M8 17.5c0-2.5 1.8-4 4-4s4 1.5 4 4-1.8 3.5-4 3.5-4-1-4-3.5z"/>
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="5" width="16" height="15" rx="2"/>
      <path d="M4 9h16M8 3v4M16 3v4"/>
    </svg>
  ),
  gear: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.5 5.5l1.8 1.8M16.7 16.7l1.8 1.8M5.5 18.5l1.8-1.8M16.7 7.3l1.8-1.8"/>
    </svg>
  ),
}

const TABS = [
  { to:'/',         label:'Начало',  icon:'home'     },
  { to:'/map',      label:'Карта',   icon:'map'      },
  { to:'/animals',  label:'Животни', icon:'paw'      },
  { to:'/today',    label:'Днес',    icon:'calendar' },
  { to:'/settings', label:'Още',     icon:'gear'     },
]

export default function BottomNav() {
  const { darkMode } = useData()
  const c = darkMode ? DARK : LIGHT

  return (
    <nav style={{
      flexShrink: 0,
      height: 78,
      background: darkMode ? 'rgba(21,23,14,0.92)' : 'rgba(244,239,227,0.92)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderTop: `1px solid ${c.rule}`,
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'flex-start',
      padding: '10px 8px 0',
    }}>
      {TABS.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, flex:1, textDecoration:'none' }}
        >
          {({ isActive }) => (
            <>
              <span style={{ color: isActive ? c.green : c.ink3, lineHeight:1 }}>
                {ICONS[icon]}
              </span>
              <span style={{ fontSize:10, fontWeight:600, letterSpacing:'0.02em', fontFamily:F.body, color: isActive ? c.ink : c.ink3, lineHeight:1 }}>
                {label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
