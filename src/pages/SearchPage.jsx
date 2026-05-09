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

const TYPE_FILTERS = [
  { value: null,          label: 'Всички',      emoji: '🐾' },
  { value: 'птица',       label: 'Птици',       emoji: '🐦' },
  { value: 'бозайник',    label: 'Бозайници',   emoji: '🦁' },
  { value: 'влечуго',     label: 'Влечуги',     emoji: '🦎' },
  { value: 'риба',        label: 'Риби',        emoji: '🐟' },
  { value: 'безгръбначно',label: 'Безгр.',      emoji: '🐌' },
]

const CONTINENT_FILTERS = [
  { value: null,            label: 'Всички',         emoji: '🌐' },
  { value: 'africa',        label: 'Африка',         emoji: '🌍' },
  { value: 'asia',          label: 'Азия',           emoji: '🌏' },
  { value: 'australia',     label: 'Австралия',      emoji: '🐨' },
  { value: 'europe',        label: 'Европа',         emoji: '🏰' },
  { value: 'north_america', label: 'С. Америка',     emoji: '🦅' },
  { value: 'south_america', label: 'Ю. Америка',     emoji: '🌎' },
]

export default function SearchPage() {
  const { allAnimals } = useData()
  const [query,     setQuery]     = useState('')
  const [activeType,      setType]       = useState(null)
  const [activeContinent, setContinent]  = useState(null)
  const inputRef = useRef(null)

  // Auto-focus search field on mount
  useEffect(() => { inputRef.current?.focus() }, [])

  const filtered = useMemo(() => {
    if (!query && !activeType && !activeContinent) return []
    return allAnimals.filter(a => {
      const q = query.toLowerCase()
      const matchesQuery = !q ||
        a.nameBg.toLowerCase().includes(q) ||
        a.nameEn.toLowerCase().includes(q) ||
        (a.species || '').toLowerCase().includes(q)
      const matchesType      = !activeType      || a.animalType === activeType
      const matchesContinent = !activeContinent || (a.continents || []).includes(activeContinent)
      return matchesQuery && matchesType && matchesContinent
    })
  }, [query, activeType, activeContinent, allAnimals])

  const showResults = query || activeType || activeContinent

  return (
    <div className="flex flex-col h-full">
      {/* Sticky header */}
      <div className="sticky top-0 bg-[--color-bg-base] px-4 pt-10 pb-3 z-10 space-y-3 shadow-sm">
        <h1 className="text-xl font-bold text-zoo-green">Търсене</h1>

        {/* Search input */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zoo-brown opacity-50 text-sm">🔍</span>
          <input
            ref={inputRef}
            type="search"
            placeholder="Търси животно, вид…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full rounded-xl border border-[--color-border] bg-[--color-bg-card] text-[--color-text-main] pl-9 pr-4 py-2.5 text-sm outline-none focus:border-zoo-green transition-colors"
          />
        </div>

        {/* Type filter chips */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-0.5">
          {TYPE_FILTERS.map(f => (
            <button
              key={String(f.value)}
              onClick={() => setType(f.value === activeType ? null : f.value)}
              className={`flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-full border text-xs font-semibold transition-colors ${
                f.value === activeType
                  ? 'bg-zoo-green text-white border-zoo-green'
                  : 'border-[--color-border] text-zoo-brown bg-[--color-bg-card]'
              }`}
            >
              <span>{f.emoji}</span>
              {f.label}
            </button>
          ))}
        </div>

        {/* Continent filter chips */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-0.5">
          {CONTINENT_FILTERS.map(f => (
            <button
              key={String(f.value)}
              onClick={() => setContinent(f.value === activeContinent ? null : f.value)}
              className={`flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-full border text-xs font-semibold transition-colors ${
                f.value === activeContinent
                  ? 'bg-zoo-brown text-white border-zoo-brown'
                  : 'border-[--color-border] text-zoo-brown bg-[--color-bg-card]'
              }`}
            >
              <span>{f.emoji}</span>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 pt-2">
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
