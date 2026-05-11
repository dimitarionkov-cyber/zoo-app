import { useState } from 'react'

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzt4r4hSbr42bK8Uxy88CBX1GmX6fBfO1OvPfbM8nIcNiNrMks_kHadtknnspAlvbFhlA/exec'

const TYPES = [
  { key: 'bug',     emoji: '🐛', label: 'Грешка' },
  { key: 'feature', emoji: '💡', label: 'Идея'   },
  { key: 'general', emoji: '💬', label: 'Общо'   },
]

const PLACEHOLDERS = {
  bug:     { title: 'напр. Картата не се зарежда',         desc: 'Опишете проблема и как да бъде възпроизведен…' },
  feature: { title: 'напр. Добавете функция за любими',    desc: 'Опишете идеята и защо ще бъде полезна…'        },
  general: { title: 'напр. Мнение за приложението',        desc: 'Вашето мнение…'                                },
}

export default function FeedbackModal({ open, onClose }) {
  const [type,        setType]        = useState('bug')
  const [title,       setTitle]       = useState('')
  const [description, setDescription] = useState('')
  const [status,      setStatus]      = useState('idle') // idle | sending | success | error

  if (!open) return null

  function reset() {
    setType('bug')
    setTitle('')
    setDescription('')
    setStatus('idle')
  }

  function handleClose() {
    reset()
    onClose()
  }

  async function handleSubmit() {
    if (!title.trim() || !description.trim()) return
    setStatus('sending')
    try {
      const params = new URLSearchParams({
        type,
        title:       title.trim(),
        description: description.trim(),
        userAgent:   navigator.userAgent,
        screen:      `${screen.width}×${screen.height}@${window.devicePixelRatio}x`,
        appVersion:  typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev',
        page:        window.location.pathname,
      })
      await fetch(`${SCRIPT_URL}?${params}`, { mode: 'no-cors' })
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  const ph = PLACEHOLDERS[type]
  const canSubmit = title.trim().length > 0 && description.trim().length > 0

  return (
    <div className="absolute inset-0 z-50 flex flex-col" style={{ backgroundColor: 'var(--color-bg-base)' }}>

      {/* Header */}
      <div className="bg-zoo-green px-4 pt-10 pb-4 flex items-center gap-3 shrink-0">
        <h1 className="flex-1 text-xl font-bold text-white">Обратна връзка</h1>
        <button
          onClick={handleClose}
          className="text-white/80 text-2xl w-9 h-9 flex items-center justify-center rounded-xl active:bg-white/20"
          aria-label="Затвори"
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4">
        {status === 'success' ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 py-16 text-center">
            <span className="text-6xl">🎉</span>
            <p className="text-2xl font-bold text-zoo-green">Изпратено!</p>
            <p className="text-sm text-zoo-brown opacity-70 max-w-xs">
              Благодарим за обратната връзка. Ще се постараем да я вземем предвид.
            </p>
            <button
              onClick={handleClose}
              className="mt-4 bg-zoo-green text-white px-10 py-3 rounded-2xl font-semibold text-sm"
            >
              Затвори
            </button>
          </div>
        ) : (
          <div className="space-y-5">

            {/* Type */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-zoo-brown mb-2">Тип</p>
              <div className="flex gap-2">
                {TYPES.map(t => (
                  <button
                    key={t.key}
                    onClick={() => setType(t.key)}
                    className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border text-xs font-semibold transition-colors ${
                      type === t.key
                        ? 'bg-zoo-green text-white border-zoo-green'
                        : 'text-[--color-text-main] border-[--color-border]'
                    }`}
                    style={type !== t.key ? { backgroundColor: 'var(--color-bg-card)' } : {}}
                  >
                    <span className="text-xl leading-none">{t.emoji}</span>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-zoo-brown">
                Заглавие *
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder={ph.title}
                maxLength={100}
                className="mt-1 w-full rounded-xl border border-[--color-border] px-3 py-2.5 text-sm text-[--color-text-main] outline-none focus:border-zoo-green transition-colors"
                style={{ backgroundColor: 'var(--color-bg-card)' }}
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-zoo-brown">
                Описание *
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder={ph.desc}
                rows={5}
                maxLength={1000}
                className="mt-1 w-full rounded-xl border border-[--color-border] px-3 py-2.5 text-sm text-[--color-text-main] outline-none focus:border-zoo-green transition-colors resize-none"
                style={{ backgroundColor: 'var(--color-bg-card)' }}
              />
              <p className="text-right text-[10px] text-zoo-brown opacity-40 mt-0.5">
                {description.length}/1000
              </p>
            </div>

            {/* Auto-collect notice */}
            <p className="text-[11px] text-zoo-brown opacity-50 text-center leading-relaxed">
              🔍 Устройство, браузър, резолюция и версия се добавят автоматично.
            </p>

            {status === 'error' && (
              <p className="text-xs text-red-500 text-center">
                Грешка при изпращане. Проверете интернет връзката и опитайте отново.
              </p>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!canSubmit || status === 'sending'}
              className="w-full bg-zoo-green text-white py-3 rounded-2xl font-semibold text-sm disabled:opacity-40 transition-opacity active:opacity-80"
            >
              {status === 'sending' ? 'Изпращане…' : 'Изпрати'}
            </button>

          </div>
        )}
      </div>
    </div>
  )
}
