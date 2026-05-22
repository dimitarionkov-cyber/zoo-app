import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import BottomNav from './BottomNav'
import FeedbackModal from '../FeedbackModal'

// ── Beta FAB feature flag ─────────────────────────────────────────────────────
const BETA_FAB = true

// ── Speech-bubble SVG (spec: 20px, 1.5px stroke, cream color) ────────────────
function BubbleSvg() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  )
}

export default function Layout() {
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const { darkMode } = useData()

  // FAB colours — ink bg, paper icon, per spec
  const fabBg   = darkMode ? '#ece5d0' : '#1a1d14'
  const fabFg   = darkMode ? '#15170e' : '#f4efe3'

  return (
    <div className="relative flex flex-col h-svh w-full max-w-lg mx-auto bg-[--color-zoo-sand]">
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      {/* ── Beta feedback FAB ─────────────────────────────────────────────── */}
      {BETA_FAB && (
        <button
          onClick={() => setFeedbackOpen(true)}
          aria-label="Обратна връзка"
          style={{
            position:      'absolute',
            right:         14,
            bottom:        94,
            zIndex:        50,
            width:         48,
            height:        48,
            borderRadius:  '50%',
            background:    fabBg,
            color:         fabFg,
            border:        'none',
            cursor:        'pointer',
            display:       'flex',
            alignItems:    'center',
            justifyContent:'center',
            boxShadow:     '0 4px 16px rgba(0,0,0,0.28)',
            flexShrink:    0,
          }}
        >
          <BubbleSvg />
          {/* BETA chip */}
          <span style={{
            position:    'absolute',
            top:         -6,
            right:       -6,
            fontFamily:  "'JetBrains Mono', 'Courier New', monospace",
            fontSize:    8,
            fontWeight:  500,
            letterSpacing:'0.04em',
            background:  '#d9a441',
            color:       '#f4efe3',
            border:      '1.5px solid #f4efe3',
            borderRadius:4,
            padding:     '2px 4px',
            lineHeight:  1.2,
            pointerEvents:'none',
          }}>
            BETA
          </span>
        </button>
      )}

      <BottomNav />

      <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </div>
  )
}
