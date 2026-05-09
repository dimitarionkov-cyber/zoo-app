/**
 * AnimalsListPage — filtered list view.
 * Reads ?type=<animalType> or ?continent=<code> from URL.
 * Rendered by AnimalsHubPage when a filter is active,
 * and also by SearchPage for its results.
 */
import { useMemo } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext'

const DIET_STYLE = {
  месояден:   { chip: 'bg-red-100 text-red-700',    dot: '#ef4444' },
  тревопасен: { chip: 'bg-green-100 text-green-700', dot: '#22c55e' },
  всеяден:    { chip: 'bg-orange-100 text-orange-700', dot: '#f97316' },
}

const TYPE_META = {
  птица:        { emoji: '🐦', label: 'Птици' },
  бозайник:     { emoji: '🦁', label: 'Бозайници' },
  влечуго:      { emoji: '🦎', label: 'Влечуги' },
  риба:         { emoji: '🐟', label: 'Риби' },
  безгръбначно: { emoji: '🐌', label: 'Безгръбначни' },
}

const TYPE_TILES = {
  птица:        { label: 'Птици',         emoji: '🐦' },
  бозайник:     { label: 'Бозайници',     emoji: '🦁' },
  влечуго:      { label: 'Влечуги',       emoji: '🦎' },
  риба:         { label: 'Риби',          emoji: '🐟' },
  безгръбначно: { label: 'Безгръбначни',  emoji: '🐌' },
}

const CONTINENT_LABELS = {
  africa:        { label: 'Африка',         emoji: '🌍' },
  asia:          { label: 'Азия',           emoji: '🌏' },
  australia:     { label: 'Австралия',      emoji: '🐨' },
  europe:        { label: 'Европа',         emoji: '🏰' },
  north_america: { label: 'Северна Америка',emoji: '🦅' },
  south_america: { label: 'Южна Америка',   emoji: '🌎' },
}

export default function AnimalsListPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { allAnimals } = useData()

  const activeType      = searchParams.get('type')
  const activeContinent = searchParams.get('continent')
  const query           = searchParams.get('q') || ''

  // Determine header label
  const headerMeta = activeType
    ? TYPE_TILES[activeType]
    : activeContinent
    ? CONTINENT_LABELS[activeContinent]
    : { label: 'Животните', emoji: '🐾' }

  // Filter
  const filtered = useMemo(() => {
    return allAnimals.filter(a => {
      const matchesType      = !activeType      || a.animalType === activeType
      const matchesContinent = !activeContinent || (a.continents || []).includes(activeContinent)
      const q = query.toLowerCase()
      const matchesQuery     = !q ||
        a.nameBg.toLowerCase().includes(q) ||
        a.nameEn.toLowerCase().includes(q) ||
        (a.species || '').toLowerCase().includes(q)
      return matchesType && matchesContinent && matchesQuery
    })
  }, [allAnimals, activeType, activeContinent, query])

  // Group by type when browsing by continent, flat list when browsing by type
  const grouped = useMemo(() => {
    if (activeType) return null   // flat
    const groups = {}
    filtered.forEach(a => {
      if (!groups[a.animalType]) groups[a.animalType] = []
      groups[a.animalType].push(a)
    })
    return groups
  }, [filtered, activeType])

  return (
    <div className="flex flex-col h-full">
      {/* Sticky header */}
      <div className="sticky top-0 bg-zoo-green px-4 pt-10 pb-4 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="text-white/80 text-2xl leading-none shrink-0"
            aria-label="Назад"
          >
            ‹
          </button>
          <span className="text-2xl leading-none">{headerMeta?.emoji}</span>
          <div>
            <h1 className="text-xl font-bold text-white leading-tight">{headerMeta?.label}</h1>
            <p className="text-white/60 text-xs">{filtered.length} животни</p>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 pt-3">
        {filtered.length === 0 ? (
          <p className="text-center text-zoo-brown opacity-60 mt-12 text-sm">
            Няма намерени животни
          </p>
        ) : grouped ? (
          Object.entries(grouped).map(([type, list]) => (
            <div key={type} className="mb-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{TYPE_META[type]?.emoji ?? '🐾'}</span>
                <h2 className="text-sm font-bold uppercase tracking-widest text-zoo-green">
                  {TYPE_META[type]?.label ?? type}
                </h2>
                <span className="text-xs text-zoo-brown opacity-50">({list.length})</span>
              </div>
              <AnimalList animals={list} />
            </div>
          ))
        ) : (
          <AnimalList animals={filtered} />
        )}
      </div>
    </div>
  )
}

function AnimalList({ animals }) {
  return (
    <ul className="space-y-2">
      {animals.map(animal => (
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
            <span className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ${DIET_STYLE[animal.diet]?.chip ?? 'bg-gray-100 text-gray-600'}`}>
              {animal.diet}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
