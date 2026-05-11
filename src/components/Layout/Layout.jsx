import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'
import FeedbackModal from '../FeedbackModal'

export default function Layout() {
  const [feedbackOpen, setFeedbackOpen] = useState(false)

  return (
    <div className="relative flex flex-col h-svh w-full max-w-lg mx-auto bg-[--color-zoo-sand]">
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      {/* Floating feedback button — above nav bar */}
      <button
        onClick={() => setFeedbackOpen(true)}
        className="absolute bottom-20 right-4 z-40 bg-zoo-green text-white w-11 h-11 rounded-full shadow-lg flex items-center justify-center text-lg active:scale-95 transition-transform"
        aria-label="Обратна връзка"
      >
        💬
      </button>

      <BottomNav />

      <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </div>
  )
}
