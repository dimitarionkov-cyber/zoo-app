import { useMemo, useState, useEffect, useRef } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext'

// ── Constants ─────────────────────────────────────────────────────────────────

const DIET_STYLE = {
  месояден:   { chip: 'bg-red-100 text-red-700' },
  тревопасен: { chip: 'bg-green-100 text-green-700' },
  всеяден:    { chip: 'bg-orange-100 text-orange-700' },
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

const TAXONOMY_GROUPS = [
  { key: 'big_cats',         label: 'Едри котки',               emoji: '🐆' },
  { key: 'small_cats',       label: 'Малки котки',              emoji: '🐱' },
  { key: 'primates',         label: 'Примати',                  emoji: '🐒' },
  { key: 'bears',            label: 'Мечки',                    emoji: '🐻' },
  { key: 'small_carnivores', label: 'Малки хищници',            emoji: '🦡' },
  { key: 'canids',           label: 'Кучеви',                   emoji: '🐺' },
  { key: 'ungulates',        label: 'Копитни и едри тревопасни',emoji: '🦛' },
  { key: 'rodents',          label: 'Гризачи',                  emoji: '🐹' },
  { key: 'birds_of_prey',    label: 'Хищни птици',              emoji: '🦅' },
  { key: 'ratites',          label: 'Щраусови',                 emoji: '🦤' },
  { key: 'parrots',          label: 'Папагали',                 emoji: '🦜' },
  { key: 'hornbills',        label: 'Птици носорог',            emoji: '🐦' },
  { key: 'waterbirds',       label: 'Водни птици',              emoji: '🦢' },
  { key: 'other_birds',      label: 'Други птици',              emoji: '🐦' },
  { key: 'snakes',           label: 'Змии',                     emoji: '🐍' },
  { key: 'crocodilians',     label: 'Крокодили',                emoji: '🐊' },
  { key: 'tortoises',        label: 'Костенурки',               emoji: '🐢' },
  { key: 'lizards',          label: 'Гущери и варани',          emoji: '🦎' },
  { key: 'fish',             label: 'Риби',                     emoji: '🐟' },
  { key: 'amphibians',       label: 'Земноводни',               emoji: '🐸' },
  { key: 'other',            label: 'Други',                    emoji: '🐾' },
]

const DIET_GROUPS = [
  { key: 'месояден',   label: 'Месоядни',   emoji: '🥩' },
  { key: 'тревопасен', label: 'Тревопасни', emoji: '🌿' },
  { key: 'всеяден',    label: 'Всеядни',    emoji: '🍽️' },
]

// Types where sub-grouping adds no value
const FLAT_TYPES = new Set(['риба', 'земноводно', 'безгръбначно'])

// ── Haversine distance (metres) ───────────────────────────────────────────────
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function formatDist(m) {
  if (m == null) return null
  return m < 1000 ? `${Math.round(m)} м` : `${(m / 1000).toFixed(1)} км`
}

// ── Sub-components ────────────────────────────────────────────────────────────

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
        <span className="text-zoo-brown opacity-40 text-xs ml-1">{open ? '▲' : '▼'}</span>
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
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${DIET_STYLE[animal.diet]?.chip ?? 'bg-gray-100 text-gray-600'}`}>
                {animal.diet}
              </span>
              {animal._dist != null && (
                <span className="text-[10px] font-semibold text-zoo-brown opacity-60">
                  📍 {formatDist(animal._dist)}
                </span>
              )}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AnimalsListPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { allAnimals } = useData()

  const activeType      = searchParams.get('type')
  const activeContinent = searchParams.get('continent')
  const query           = searchParams.get('q') || ''

  const showGroupToggle = !!activeType && !FLAT_TYPES.has(activeType)
  const [groupMode, setGroupMode] = useState('taxonomy') // 'taxonomy' | 'diet'

  // ── Distance / geolocation ────────────────────────────────────────────────
  const [sortByDist,   setSortByDist]   = useState(false)
  const [userPos,      setUserPos]      = useState(null)   // { lat, lng }
  const [gpsState,     setGpsState]     = useState('idle') // 'idle'|'loading'|'ok'|'error'
  const watchIdRef = useRef(null)

  // Start/stop watchPosition based on sortByDist toggle
  useEffect(() => {
    if (!sortByDist) {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
      return
    }
    if (!navigator.geolocation) {
      setGpsState('error')
      setSortByDist(false)
      return
    }
    setGpsState('loading')
    watchIdRef.current = navigator.geolocation.watchPosition(
      pos => {
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setGpsState('ok')
      },
      () => {
        setGpsState('error')
        setSortByDist(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    )
    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
    }
  }, [sortByDist])

  const handleDistToggle = () => {
    if (gpsState === 'error') return
    setSortByDist(v => !v)
  }

  // ── Filter ────────────────────────────────────────────────────────────────
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

  // Attach live distance and sort
  const withDist = useMemo(() => {
    return filtered.map(a => ({
      ...a,
      _dist: userPos ? haversine(userPos.lat, userPos.lng, a.lat, a.lng) : null,
    }))
  }, [filtered, userPos])

  const sorted = useMemo(() => {
    return [...withDist].sort((a, b) => {
      if (sortByDist && a._dist != null && b._dist != null) return a._dist - b._dist
      return a.nameBg.localeCompare(b.nameBg, 'bg')
    })
  }, [withDist, sortByDist])

  // Group helpers
  const groupedByType = useMemo(() => {
    if (activeType) return null
    const map = {}
    sorted.forEach(a => {
      if (!map[a.animalType]) map[a.animalType] = []
      map[a.animalType].push(a)
    })
    return map
  }, [sorted, activeType])

  const taxonomyGroups = useMemo(() => {
    if (!activeType) return null
    const map = {}
    sorted.forEach(a => { const g = a.group || 'other'; (map[g] ??= []).push(a) })
    return TAXONOMY_GROUPS.filter(g => map[g.key]?.length).map(g => ({ ...g, animals: map[g.key] }))
  }, [sorted, activeType])

  const dietGroups = useMemo(() => {
    if (!activeType) return null
    const map = {}
    sorted.forEach(a => { (map[a.diet] ??= []).push(a) })
    return DIET_GROUPS.filter(g => map[g.key]?.length).map(g => ({ ...g, animals: map[g.key] }))
  }, [sorted, activeType])

  const headerMeta = activeType
    ? TYPE_META[activeType]
    : activeContinent
    ? CONTINENT_LABELS[activeContinent]
    : { label: 'Животните', emoji: '🐾' }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full">

      {/* Sticky header */}
      <div className="sticky top-0 bg-zoo-primary px-4 pt-10 pb-5 z-10">
        <div className="flex items-center gap-3 mb-3">
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
            <p className="text-white/60 text-xs">{sorted.length} животни</p>
          </div>
        </div>

        {/* Sort controls — only when browsing by type */}
        {showGroupToggle && (
          <div>
            <p className="text-white/50 text-[10px] font-semibold uppercase tracking-widest mb-1.5">
              Сортирай по:
            </p>
            <div className="flex gap-1.5">
              {/* Вид */}
              <button
                onClick={() => setGroupMode('taxonomy')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-colors border ${
                  groupMode === 'taxonomy'
                    ? 'bg-white text-zoo-green border-white'
                    : 'text-white/80 border-white/30'
                }`}
              >
                Вид
              </button>

              {/* Диета */}
              <button
                onClick={() => setGroupMode('diet')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-colors border ${
                  groupMode === 'diet'
                    ? 'bg-white text-zoo-green border-white'
                    : 'text-white/80 border-white/30'
                }`}
              >
                Диета
              </button>

              {/* Разстояние */}
              <button
                onClick={handleDistToggle}
                disabled={gpsState === 'error'}
                className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-colors border ${
                  gpsState === 'error'
                    ? 'text-white/30 border-white/20 cursor-not-allowed'
                    : sortByDist
                    ? 'bg-white text-zoo-green border-white'
                    : 'text-white/80 border-white/30'
                }`}
              >
                {gpsState === 'loading' ? '⏳' : gpsState === 'error' ? '📍✕' : '📍 Разст.'}
              </button>
            </div>

            {gpsState === 'error' && (
              <p className="text-white/50 text-[10px] mt-1.5 text-center">
                Локацията не е налична
              </p>
            )}
          </div>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 pt-3">
        {sorted.length === 0 ? (
          <p className="text-center text-zoo-brown opacity-60 mt-12 text-sm">
            Няма намерени животни
          </p>
        ) : groupedByType ? (
          Object.entries(groupedByType).map(([type, list]) => (
            <CollapsibleGroup
              key={type}
              meta={{ emoji: TYPE_META[type]?.emoji ?? '🐾', label: TYPE_META[type]?.label ?? type }}
              animals={list}
            />
          ))
        ) : FLAT_TYPES.has(activeType) ? (
          <AnimalList animals={sorted} />
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
