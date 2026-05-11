import { useState, useMemo, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../context/DataContext'

const TYPE_META = {
  птица:        { emoji: '🐦', label: 'Птици' },
  бозайник:     { emoji: '🦁', label: 'Бозайници' },
  влечуго:      { emoji: '🦎', label: 'Влечуги' },
  риба:         { emoji: '🐟', label: 'Риби' },
  безгръбначно: { emoji: '🐌', label: 'Безгръбначни' },
}

const DIET_STYLE = {
  месояден:   'bg-red-100 text-red-700',
  тревопасен: 'bg-green-100 text-green-700',
  всеяден:    'bg-orange-100 text-orange-700',
}

const TYPE_OPTIONS = [
  { value: 'птица',        label: 'Птици',         emoji: '🐦' },
  { value: 'бозайник',     label: 'Бозайници',     emoji: '🦁' },
  { value: 'влечуго',      label: 'Влечуги',       emoji: '🦎' },
  { value: 'риба',         label: 'Риби',          emoji: '🐟' },
  { value: 'безгръбначно', label: 'Безгръбначни',  emoji: '🐌' },
]

const CONTINENT_OPTIONS = [
  { value: 'africa',        label: 'Африка',          emoji: '🌍' },
  { value: 'asia',          label: 'Азия',            emoji: '🌏' },
  { value: 'australia',     label: 'Австралия',       emoji: '🐨' },
  { value: 'europe',        label: 'Европа',          emoji: '🏰' },
  { value: 'north_america', label: 'С. Америка',      emoji: '🦅' },
  { value: 'south_america', label: 'Ю. Америка',      emoji: '🌎' },
]

function toggle(set, value) {
  const next = new Set(set)
  next.has(value) ? next.delete(value) : next.add(value)
  return next
}

export default function SearchPage() {
  const { allAnimals } = useData()
  const [query,            setQuery]            = useState('')
  const [selectedTypes,    setSelectedTypes]    = useState(new Set())
  const [selectedConts,    setSelectedConts]    = useState(new Set())
  const [openDropdown,     setOpenDropdown]     = useState(null) // 'type' | 'continent' | null
  const inputRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const filtered = useMemo(() => {
    if (!query && selectedTypes.size === 0 && selectedConts.size === 0) return []
    return allAnimals.filter(a => {
      const q = query.toLowerCase()
      const matchesQuery     = !q || a.nameBg.toLowerCase().includes(q) || a.nameEn.toLowerCase().includes(q) || (a.species || '').toLowerCase().includes(q)
      const matchesType      = selectedTypes.size === 0 || selectedTypes.has(a.animalType)
      const matchesContinent = selectedConts.size === 0  || (a.continents || []).some(c => selectedConts.has(c))
      return matchesQuery && matchesType && matchesContinent
    })
  }, [query, selectedTypes, selectedConts, allAnimals])

  const showResults = query || selectedTypes.size > 0 || selectedConts.size > 0

  function typeLabel() {
    if (selectedTypes.size === 0) return 'Вид'
    if (selectedTypes.size === 1) return TYPE_OPTIONS.find(o => selectedTypes.has(o.value))?.label ?? 'Вид'
    return `${selectedTypes.size} вида`
  }

  function continentLabel() {
    if (selectedConts.size === 0) return 'Произход'
    if (selectedConts.size === 1) return CONTINENT_OPTIONS.find(o => selectedConts.has(o.value))?.label ?? 'Произход'
    return `${selectedConts.size} региона`
  }

  const typeActive      = selectedTypes.size > 0
  const continentActive = selectedConts.size > 0

  return (
    <div className="flex flex-col h-full">

      {/* ── Header ── */}
      <div className="bg-zoo-primary px-4 pt-10 pb-4 z-10 space-y-3">
        <h1 className="text-xl font-bold text-white">Търсене</h1>

        {/* Search input */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 text-sm">🔍</span>
          <input
            ref={inputRef}
            type="search"
            placeholder="Търси животно, вид…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full rounded-xl border border-white/30 bg-white/15 text-white placeholder:text-white/50 pl-9 pr-4 py-2.5 text-sm outline-none focus:border-white/60 transition-colors"
          />
        </div>

        {/* Filter dropdowns row */}
        <div className="flex gap-2 relative">

          {/* Type dropdown */}
          <div className="flex-1 relative">
            <button
              onClick={() => setOpenDropdown(d => d === 'type' ? null : 'type')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-sm font-semibold transition-colors ${
                typeActive
                  ? 'bg-white text-black border-white'
                  : 'bg-white/15 text-white border-white/30'
              }`}
            >
              <span>{typeLabel()}</span>
              <span className="text-[10px] opacity-60 ml-1">{openDropdown === 'type' ? '▲' : '▼'}</span>
            </button>

            {openDropdown === 'type' && (
              <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-[--color-bg-card] border border-[--color-border] rounded-xl shadow-lg overflow-hidden">
                {TYPE_OPTIONS.map(o => (
                  <button
                    key={o.value}
                    onClick={() => setSelectedTypes(prev => toggle(prev, o.value))}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left transition-colors border-b border-[--color-border] last:border-0 ${
                      selectedTypes.has(o.value)
                        ? 'bg-zoo-green/20 font-semibold text-[--color-text-main]'
                        : 'text-[--color-text-main]'
                    }`}
                  >
                    <span>{o.emoji}</span>
                    <span className="flex-1">{o.label}</span>
                    {selectedTypes.has(o.value) && <span className="text-zoo-green text-xs font-bold">✓</span>}
                  </button>
                ))}
                {selectedTypes.size > 0 && (
                  <button
                    onClick={() => setSelectedTypes(new Set())}
                    className="w-full px-3 py-2 text-xs text-center text-zoo-brown opacity-60 bg-[--color-bg-base]"
                  >
                    Изчисти
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Continent dropdown */}
          <div className="flex-1 relative">
            <button
              onClick={() => setOpenDropdown(d => d === 'continent' ? null : 'continent')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-sm font-semibold transition-colors ${
                continentActive
                  ? 'bg-white text-black border-white'
                  : 'bg-white/15 text-white border-white/30'
              }`}
            >
              <span>{continentLabel()}</span>
              <span className="text-[10px] opacity-60 ml-1">{openDropdown === 'continent' ? '▲' : '▼'}</span>
            </button>

            {openDropdown === 'continent' && (
              <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-[--color-bg-card] border border-[--color-border] rounded-xl shadow-lg overflow-hidden">
                {CONTINENT_OPTIONS.map(o => (
                  <button
                    key={o.value}
                    onClick={() => setSelectedConts(prev => toggle(prev, o.value))}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left transition-colors border-b border-[--color-border] last:border-0 ${
                      selectedConts.has(o.value)
                        ? 'bg-zoo-green/20 font-semibold text-[--color-text-main]'
                        : 'text-[--color-text-main]'
                    }`}
                  >
                    <span>{o.emoji}</span>
                    <span className="flex-1">{o.label}</span>
                    {selectedConts.has(o.value) && <span className="text-zoo-green text-xs font-bold">✓</span>}
                  </button>
                ))}
                {selectedConts.size > 0 && (
                  <button
                    onClick={() => setSelectedConts(new Set())}
                    className="w-full px-3 py-2 text-xs text-center text-zoo-brown opacity-60 bg-[--color-bg-base]"
                  >
                    Изчисти
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Backdrop to close dropdowns */}
      {openDropdown && (
        <div className="fixed inset-0 z-20" onClick={() => setOpenDropdown(null)} />
      )}

      {/* ── Results ── */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 pt-3">
        {!showResults ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2 text-zoo-brown opacity-40">
            <span className="text-5xl">🔍</span>
            <p className="text-sm">Въведи текст или избери филтър</p>
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-zoo-brown opacity-60 mt-12 text-sm">
            Няма намерени животни
          </p>
        ) : (
          <>
            <p className="text-xs text-zoo-brown opacity-50 mb-3">
              {filtered.length} резултата
            </p>
            <ul className="space-y-2">
              {filtered.map(animal => (
                <li key={animal.id}>
                  <Link
                    to={`/animals/${animal.id}`}
                    className="flex items-center gap-3 bg-[--color-bg-card] rounded-2xl px-4 py-3 border border-[--color-border] shadow-sm active:scale-[0.98] transition-transform"
                  >
                    <span className="text-2xl w-8 text-center shrink-0">
                      {TYPE_META[animal.animalType]?.emoji ?? '🐾'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-zoo-green truncate">{animal.nameBg}</p>
                      <p className="text-xs text-zoo-brown opacity-70 italic truncate">{animal.species}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ${DIET_STYLE[animal.diet] ?? 'bg-gray-100 text-gray-600'}`}>
                      {animal.diet}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}
