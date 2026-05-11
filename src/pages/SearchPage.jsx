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
  { value: 'птица',        label: 'Птици',        emoji: '🐦' },
  { value: 'бозайник',     label: 'Бозайници',    emoji: '🦁' },
  { value: 'влечуго',      label: 'Влечуги',      emoji: '🦎' },
  { value: 'риба',         label: 'Риби',         emoji: '🐟' },
  { value: 'безгръбначно', label: 'Безгръбначни', emoji: '🐌' },
]

const CONTINENT_OPTIONS = [
  { value: 'africa',        label: 'Африка',     emoji: '🌍' },
  { value: 'asia',          label: 'Азия',       emoji: '🌏' },
  { value: 'australia',     label: 'Австралия',  emoji: '🐨' },
  { value: 'europe',        label: 'Европа',     emoji: '🏰' },
  { value: 'north_america', label: 'С. Америка', emoji: '🦅' },
  { value: 'south_america', label: 'Ю. Америка', emoji: '🌎' },
]

function toggleSet(set, value) {
  const next = new Set(set)
  next.has(value) ? next.delete(value) : next.add(value)
  return next
}

function FilterDropdown({ label, options, selected, onToggle, onClear, onClose }) {
  const hasSelection = selected.size > 0

  function buttonLabel() {
    if (selected.size === 0) return label
    if (selected.size === 1) return options.find(o => selected.has(o.value))?.label ?? label
    return `${selected.size} избрани`
  }

  return (
    <div
      className="rounded-xl shadow-xl overflow-hidden"
      style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
    >
      {/* Items */}
      {options.map(o => (
        <button
          key={o.value}
          onClick={() => onToggle(o.value)}
          className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left transition-colors"
          style={{
            borderBottom: '1px solid var(--color-border)',
            backgroundColor: selected.has(o.value) ? 'rgba(58,107,53,0.12)' : 'transparent',
            color: 'var(--color-text-main)',
            fontWeight: selected.has(o.value) ? '600' : '400',
          }}
        >
          <span>{o.emoji}</span>
          <span className="flex-1">{o.label}</span>
          {selected.has(o.value) && <span className="text-zoo-green text-xs font-bold">✓</span>}
        </button>
      ))}

      {/* Footer: clear + OK */}
      <div
        className="flex gap-2 px-3 py-2"
        style={{ borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-base)' }}
      >
        <button
          onClick={onClear}
          disabled={!hasSelection}
          className="flex-1 text-xs font-semibold py-1.5 rounded-lg border border-[--color-border] text-zoo-brown disabled:opacity-30 transition-opacity"
        >
          Изчисти
        </button>
        <button
          onClick={onClose}
          className="flex-1 text-xs font-bold py-1.5 rounded-lg text-white bg-zoo-primary"
        >
          OK
        </button>
      </div>
    </div>
  )
}

export default function SearchPage() {
  const { allAnimals } = useData()
  const [query,         setQuery]         = useState('')
  const [selectedTypes, setSelectedTypes] = useState(new Set())
  const [selectedConts, setSelectedConts] = useState(new Set())
  const [openDropdown,  setOpenDropdown]  = useState(null) // 'type' | 'continent' | null
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

  function typeButtonLabel() {
    if (selectedTypes.size === 0) return 'Вид'
    if (selectedTypes.size === 1) return TYPE_OPTIONS.find(o => selectedTypes.has(o.value))?.label ?? 'Вид'
    return `${selectedTypes.size} вида`
  }

  function continentButtonLabel() {
    if (selectedConts.size === 0) return 'Произход'
    if (selectedConts.size === 1) return CONTINENT_OPTIONS.find(o => selectedConts.has(o.value))?.label ?? 'Произход'
    return `${selectedConts.size} региона`
  }

  return (
    <div className="flex flex-col h-full">

      {/* ── Header ── */}
      <div className="bg-zoo-primary px-4 pt-10 pb-4 space-y-3" style={{ position: 'relative' }}>
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
        <div className="flex gap-2">

          {/* Type dropdown trigger */}
          <div className="flex-1">
            <button
              onClick={() => setOpenDropdown(d => d === 'type' ? null : 'type')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-sm font-semibold transition-colors ${
                selectedTypes.size > 0
                  ? 'bg-white text-black border-white'
                  : 'bg-white/15 text-white border-white/30'
              }`}
            >
              <span>{typeButtonLabel()}</span>
              <span className="text-[10px] opacity-60 ml-1">{openDropdown === 'type' ? '▲' : '▼'}</span>
            </button>

            {/* Type panel */}
            {openDropdown === 'type' && (
              <div className="absolute left-4 right-4 mt-1" style={{ zIndex: 40 }}>
                <FilterDropdown
                  label="Вид"
                  options={TYPE_OPTIONS}
                  selected={selectedTypes}
                  onToggle={v => setSelectedTypes(prev => toggleSet(prev, v))}
                  onClear={() => setSelectedTypes(new Set())}
                  onClose={() => setOpenDropdown(null)}
                />
              </div>
            )}
          </div>

          {/* Continent dropdown trigger */}
          <div className="flex-1">
            <button
              onClick={() => setOpenDropdown(d => d === 'continent' ? null : 'continent')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-sm font-semibold transition-colors ${
                selectedConts.size > 0
                  ? 'bg-white text-black border-white'
                  : 'bg-white/15 text-white border-white/30'
              }`}
            >
              <span>{continentButtonLabel()}</span>
              <span className="text-[10px] opacity-60 ml-1">{openDropdown === 'continent' ? '▲' : '▼'}</span>
            </button>

            {/* Continent panel */}
            {openDropdown === 'continent' && (
              <div className="absolute left-4 right-4 mt-1" style={{ zIndex: 40 }}>
                <FilterDropdown
                  label="Произход"
                  options={CONTINENT_OPTIONS}
                  selected={selectedConts}
                  onToggle={v => setSelectedConts(prev => toggleSet(prev, v))}
                  onClear={() => setSelectedConts(new Set())}
                  onClose={() => setOpenDropdown(null)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Backdrop — closes dropdown when tapping outside */}
      {openDropdown && (
        <div className="fixed inset-0" style={{ zIndex: 35 }} onClick={() => setOpenDropdown(null)} />
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
            <p className="text-xs text-zoo-brown opacity-50 mb-3">{filtered.length} резултата</p>
            <ul className="space-y-2">
              {filtered.map(animal => (
                <li key={animal.id}>
                  <Link
                    to={`/animals/${animal.id}`}
                    className="flex items-center gap-3 rounded-2xl px-4 py-3 border shadow-sm active:scale-[0.98] transition-transform"
                    style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
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
