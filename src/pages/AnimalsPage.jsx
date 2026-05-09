import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../context/DataContext'

const DIET_STYLE = {
  месояден:  { chip: 'bg-red-100 text-red-700',    dot: '#ef4444' },
  тревопасен:{ chip: 'bg-green-100 text-green-700', dot: '#22c55e' },
  всеяден:   { chip: 'bg-orange-100 text-orange-700',dot: '#f97316' },
}

const TYPE_META = {
  птица:    { emoji: '🐦', label: 'Птици' },
  бозайник: { emoji: '🦁', label: 'Бозайници' },
  влечуго:  { emoji: '🦎', label: 'Влечуги' },
  риба:     { emoji: '🐟', label: 'Риби' },
  земноводно:{ emoji: '🐸', label: 'Земноводни' },
}

const DIET_FILTERS = [
  { value: 'all',       label: 'Всички' },
  { value: 'месояден',  label: 'Месоядни' },
  { value: 'тревопасен',label: 'Тревопасни' },
  { value: 'всеяден',   label: 'Всеядни' },
]


export default function AnimalsPage() {
  const { allAnimals, updateCoordinates } = useData()
  const [query, setQuery]           = useState('')
  const [activeType, setActiveType] = useState('all')
  const [activeDiet, setActiveDiet] = useState('all')
  const [editMode, setEditMode]     = useState(false)
  const [editing, setEditing]       = useState(null) // { id, lat, lng }
  const animals = allAnimals

  const allTypes = useMemo(() => {
    const types = [...new Set(animals.map(a => a.animalType))]
    return types.sort()
  }, [])

  const filtered = useMemo(() => {
    return animals.filter(a => {
      const matchesQuery = !query ||
        a.nameBg.toLowerCase().includes(query.toLowerCase()) ||
        a.nameEn.toLowerCase().includes(query.toLowerCase()) ||
        a.species.toLowerCase().includes(query.toLowerCase())
      const matchesType = activeType === 'all' || a.animalType === activeType
      const matchesDiet = activeDiet === 'all' || a.diet === activeDiet
      return matchesQuery && matchesType && matchesDiet
    })
  }, [query, activeType, activeDiet])

  // Group by type when no type filter is active
  const grouped = useMemo(() => {
    if (activeType !== 'all') return null
    const groups = {}
    filtered.forEach(a => {
      if (!groups[a.animalType]) groups[a.animalType] = []
      groups[a.animalType].push(a)
    })
    return groups
  }, [filtered, activeType])

  return (
    <div className="flex flex-col h-full">
      {/* Sticky header with search + filters */}
      <div className="sticky top-0 bg-[--color-bg-base] px-4 pt-4 pb-3 z-10 space-y-2 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-zoo-green">Животните</h1>
          <button
            onClick={() => { setEditMode(e => !e); setEditing(null) }}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
              editMode ? 'bg-zoo-green text-white border-zoo-green' : 'border-[--color-border] text-zoo-brown'
            }`}
          >
            {editMode ? '✓ Готово' : '📍 Редактирай'}
          </button>
        </div>

        <input
          type="search"
          placeholder="Търси животно…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full rounded-xl border border-[--color-border] bg-[--color-bg-card] text-[--color-text-main] px-4 py-2.5 text-sm outline-none focus:border-zoo-green transition-colors"
        />

        {/* Filters — type + diet dropdowns */}
        <div className="grid grid-cols-2 gap-2">
          <select
            value={activeType}
            onChange={e => setActiveType(e.target.value)}
            className="w-full rounded-xl border border-[--color-border] bg-[--color-bg-card] px-3 py-2 text-sm text-[--color-text-main] outline-none focus:border-zoo-green transition-colors"
          >
            <option value="all">Всички видове</option>
            {allTypes.map(type => (
              <option key={type} value={type}>
                {TYPE_META[type]?.emoji} {TYPE_META[type]?.label ?? type}
              </option>
            ))}
          </select>

          <select
            value={activeDiet}
            onChange={e => setActiveDiet(e.target.value)}
            className="w-full rounded-xl border border-[--color-border] bg-[--color-bg-card] px-3 py-2 text-sm text-[--color-text-main] outline-none focus:border-zoo-green transition-colors"
          >
            {DIET_FILTERS.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 pt-2">
        {filtered.length === 0 ? (
          <p className="text-center text-zoo-brown opacity-60 mt-12 text-sm">
            Няма намерени животни
          </p>
        ) : grouped ? (
          // Grouped view
          Object.entries(grouped).map(([type, list]) => (
            <div key={type} className="mb-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{TYPE_META[type]?.emoji ?? '🐾'}</span>
                <h2 className="text-sm font-bold uppercase tracking-widest text-zoo-green">
                  {TYPE_META[type]?.label ?? type}
                </h2>
                <span className="text-xs text-zoo-brown opacity-50">({list.length})</span>
              </div>
              <AnimalList animals={list} editMode={editMode} editing={editing} setEditing={setEditing} onSave={(id, lat, lng) => { updateCoordinates(id, lat, lng); setEditing(null) }} />
            </div>
          ))
        ) : (
          <AnimalList animals={filtered} editMode={editMode} editing={editing} setEditing={setEditing} onSave={(id, lat, lng) => { updateCoordinates(id, lat, lng); setEditing(null) }} />
        )}
      </div>
    </div>
  )
}

function AnimalList({ animals, editMode, editing, setEditing, onSave }) {
  return (
    <ul className="space-y-2">
      {animals.map(animal => {
        const isEditing = editing?.id === animal.id
        return (
          <li key={animal.id}>
            {editMode ? (
              <div className="bg-[--color-bg-card] rounded-2xl px-4 py-3 border border-[--color-border] shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="text-2xl w-8 text-center shrink-0">{TYPE_META[animal.animalType]?.emoji ?? '🐾'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-zoo-green truncate">{animal.nameBg}</p>
                    <p className="text-xs text-zoo-brown opacity-60 truncate">
                      {animal.lat.toFixed(6)}, {animal.lng.toFixed(6)}
                    </p>
                  </div>
                  <button
                    onClick={() => setEditing(isEditing ? null : { id: animal.id, lat: String(animal.lat), lng: String(animal.lng) })}
                    className="text-xs px-2 py-1 rounded-lg border border-[--color-border] text-zoo-brown shrink-0"
                  >
                    {isEditing ? '▲' : '📍'}
                  </button>
                </div>

                {isEditing && (
                  <div className="mt-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-zoo-brown">Ширина (lat)</label>
                        <input
                          type="number" step="any"
                          value={editing.lat}
                          onChange={e => setEditing(p => ({ ...p, lat: e.target.value }))}
                          className="w-full mt-0.5 rounded-lg border border-[--color-border] bg-[--color-bg-base] px-2 py-1.5 text-sm outline-none focus:border-zoo-green"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-zoo-brown">Дължина (lng)</label>
                        <input
                          type="number" step="any"
                          value={editing.lng}
                          onChange={e => setEditing(p => ({ ...p, lng: e.target.value }))}
                          className="w-full mt-0.5 rounded-lg border border-[--color-border] bg-[--color-bg-base] px-2 py-1.5 text-sm outline-none focus:border-zoo-green"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => onSave(animal.id, editing.lat, editing.lng)}
                      className="w-full bg-zoo-green text-white rounded-lg py-2 text-sm font-semibold"
                    >
                      Запази координатите
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to={`/animals/${animal.id}`}
                className="flex items-center gap-3 bg-[--color-bg-card] rounded-2xl px-4 py-3 border border-[--color-border] shadow-sm active:scale-[0.98] transition-transform"
              >
                <span className="text-2xl w-8 text-center shrink-0">{TYPE_META[animal.animalType]?.emoji ?? '🐾'}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-zoo-green truncate">{animal.nameBg}</p>
                  <p className="text-xs text-zoo-brown opacity-70 italic truncate">{animal.species}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ${DIET_STYLE[animal.diet]?.chip ?? 'bg-gray-100 text-gray-600'}`}>
                  {animal.diet}
                </span>
              </Link>
            )}
          </li>
        )
      })}
    </ul>
  )
}
