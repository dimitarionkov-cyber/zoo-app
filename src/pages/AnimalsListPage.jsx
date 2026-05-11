import { useMemo, useState } from 'react'
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
  земноводно:   { emoji: '🐸', label: 'Земноводни' },
  безгръбначно: { emoji: '🐌', label: 'Безгръбначни' },
}

const CONTINENT_LABELS = {
  africa:        { label: 'Африка',          emoji: '🌍' },
  asia:          { label: 'Азия',            emoji: '🌏' },
  australia:     { label: 'Австралия',       emoji: '🐨' },
  europe:        { label: 'Европа',          emoji: '🏰' },
  north_america: { label: 'Северна Америка', emoji: '🦅' },
  south_america: { label: 'Южна Америка',    emoji: '🌎' },
}

// Taxonomy group metadata — ordered for display
const TAXONOMY_GROUPS = [
  // Mammals
  { key: 'big_cats',         label: 'Едри котки',          emoji: '🐆' },
  { key: 'small_cats',       label: 'Малки котки',          emoji: '🐱' },
  { key: 'primates',         label: 'Примати',              emoji: '🐒' },
  { key: 'bears',            label: 'Мечки',                emoji: '🐻' },
  { key: 'small_carnivores', label: 'Малки хищници',        emoji: '🦡' },
  { key: 'canids',           label: 'Кучеви',               emoji: '🐺' },
  { key: 'ungulates',        label: 'Копитни и едри тревопасни', emoji: '🦛' },
  { key: 'rodents',          label: 'Гризачи',              emoji: '🐹' },
  // Birds
  { key: 'birds_of_prey',    label: 'Хищни птици',          emoji: '🦅' },
  { key: 'ratites',          label: 'Щраусови',             emoji: '🦤' },
  { key: 'parrots',          label: 'Папагали',             emoji: '🦜' },
  { key: 'hornbills',        label: 'Птици носорог',        emoji: '🐦' },
  { key: 'waterbirds',       label: 'Водни птици',          emoji: '🦢' },
  { key: 'other_birds',      label: 'Други птици',          emoji: '🐦' },
  // Reptiles
  { key: 'snakes',           label: 'Змии',                 emoji: '🐍' },
  { key: 'crocodilians',     label: 'Крокодили',            emoji: '🐊' },
  { key: 'tortoises',        label: 'Костенурки',           emoji: '🐢' },
  { key: 'lizards',          label: 'Гущери и варани',      emoji: '🦎' },
  // Fish & amphibians (flat — no subgrouping)
  { key: 'fish',             label: 'Риби',                 emoji: '🐟' },
  { key: 'amphibians',       label: 'Земноводни',           emoji: '🐸' },
  { key: 'other',            label: 'Други',                emoji: '🐾' },
]

const DIET_GROUPS = [
  { key: 'месояден',   label: 'Месоядни',   emoji: '🥩' },
  { key: 'тревопасен', label: 'Тревопасни', emoji: '🌿' },
  { key: 'всеяден',    label: 'Всеядни',    emoji: '🍽️' },
]

// Types where sub-grouping adds no value (only one logical group)
const FLAT_TYPES = new Set(['риба', 'земноводно', 'безгръбначно'])

function CollapsibleGroup({ meta, animals, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="mb-4">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 mb-2 text-left"
      >
        <span className="text-lg leading-none">{meta.emoji}</span>
        <h2 className="text-sm font-bold uppercase tracking-widest text-zoo-green flex-1">
          {meta.label}
        </h2>
        <span className="text-xs text-zoo-brown opacity-50">({animals.length})</span>
        <span className="text-zoo-brown opacity-40 text-xs">{open ? '▲' : '▼'}</span>
      </button>
      {open && <AnimalList animals={animals} />}
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

export default function AnimalsListPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { allAnimals } = useData()

  const activeType      = searchParams.get('type')
  const activeContinent = searchParams.get('continent')
  const query           = searchParams.get('q') || ''

  // Show grouping toggle only when browsing by a type that benefits from it
  const showGroupToggle = !!activeType && !FLAT_TYPES.has(activeType)
  const [groupMode, setGroupMode] = useState('taxonomy') // 'taxonomy' | 'diet'

  const headerMeta = activeType
    ? TYPE_META[activeType]
    : activeContinent
    ? CONTINENT_LABELS[activeContinent]
    : { label: 'Животните', emoji: '🐾' }

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

  // Grouped by type when browsing by continent
  const groupedByType = useMemo(() => {
    if (activeType) return null
    const groups = {}
    filtered.forEach(a => {
      if (!groups[a.animalType]) groups[a.animalType] = []
      groups[a.animalType].push(a)
    })
    return groups
  }, [filtered, activeType])

  // Taxonomy groups
  const taxonomyGroups = useMemo(() => {
    if (!activeType) return null
    const map = {}
    filtered.forEach(a => {
      const g = a.group || 'other'
      if (!map[g]) map[g] = []
      map[g].push(a)
    })
    return TAXONOMY_GROUPS.filter(g => map[g.key]?.length).map(g => ({ ...g, animals: map[g.key] }))
  }, [filtered, activeType])

  // Diet groups
  const dietGroups = useMemo(() => {
    if (!activeType) return null
    const map = {}
    filtered.forEach(a => {
      if (!map[a.diet]) map[a.diet] = []
      map[a.diet].push(a)
    })
    return DIET_GROUPS.filter(g => map[g.key]?.length).map(g => ({ ...g, animals: map[g.key] }))
  }, [filtered, activeType])

  return (
    <div className="flex flex-col h-full">
      {/* Sticky header */}
      <div className="sticky top-0 bg-zoo-green px-4 pt-10 pb-3 z-10">
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

        {/* Group mode toggle — only for types with multiple subgroups */}
        {showGroupToggle && (
          <div className="flex mt-3 bg-white/15 rounded-xl p-0.5 gap-0.5">
            <button
              onClick={() => setGroupMode('taxonomy')}
              className={`flex-1 py-1.5 rounded-[10px] text-xs font-semibold transition-colors ${
                groupMode === 'taxonomy' ? 'bg-white text-zoo-green' : 'text-white/80'
              }`}
            >
              По вид
            </button>
            <button
              onClick={() => setGroupMode('diet')}
              className={`flex-1 py-1.5 rounded-[10px] text-xs font-semibold transition-colors ${
                groupMode === 'diet' ? 'bg-white text-zoo-green' : 'text-white/80'
              }`}
            >
              По диета
            </button>
          </div>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 pt-3">
        {filtered.length === 0 ? (
          <p className="text-center text-zoo-brown opacity-60 mt-12 text-sm">
            Няма намерени животни
          </p>
        ) : groupedByType ? (
          // Browsing by continent — group by animal type
          Object.entries(groupedByType).map(([type, list]) => (
            <CollapsibleGroup
              key={type}
              meta={{ emoji: TYPE_META[type]?.emoji ?? '🐾', label: TYPE_META[type]?.label ?? type }}
              animals={list}
            />
          ))
        ) : FLAT_TYPES.has(activeType) ? (
          // Fish / amphibians — flat list
          <AnimalList animals={filtered} />
        ) : groupMode === 'taxonomy' ? (
          taxonomyGroups.map(g => (
            <CollapsibleGroup key={g.key} meta={g} animals={g.animals} />
          ))
        ) : (
          dietGroups.map(g => (
            <CollapsibleGroup key={g.key} meta={g} animals={g.animals} />
          ))
        )}
      </div>
    </div>
  )
}
