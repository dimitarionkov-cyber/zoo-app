import { useState, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useData } from '../context/DataContext'
import AnimalsListPage from './AnimalsListPage'

// ── Category tiles ────────────────────────────────────────────────────────────
const TYPE_TILES = [
  { value: 'птица',        label: 'Птици',         labelEn: 'Birds',        emoji: '🐦', bg: 'bg-sky-50    dark:bg-sky-900/20',   border: 'border-sky-200  dark:border-sky-700',   text: 'text-sky-700   dark:text-sky-300' },
  { value: 'бозайник',     label: 'Бозайници',     labelEn: 'Mammals',      emoji: '🦁', bg: 'bg-amber-50  dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-700', text: 'text-amber-700 dark:text-amber-300' },
  { value: 'влечуго',      label: 'Влечуги',       labelEn: 'Reptiles',     emoji: '🦎', bg: 'bg-green-50  dark:bg-green-900/20', border: 'border-green-200 dark:border-green-700', text: 'text-green-700 dark:text-green-300' },
  { value: 'риба',         label: 'Риби',          labelEn: 'Fish',         emoji: '🐟', bg: 'bg-blue-50   dark:bg-blue-900/20',  border: 'border-blue-200  dark:border-blue-700',  text: 'text-blue-700  dark:text-blue-300' },
  { value: 'безгръбначно', label: 'Безгръбначни',  labelEn: 'Invertebrates',emoji: '🐌', bg: 'bg-stone-50  dark:bg-stone-800/40', border: 'border-stone-200 dark:border-stone-600', text: 'text-stone-600 dark:text-stone-300' },
]

// ── Continent tiles ───────────────────────────────────────────────────────────
const CONTINENT_TILES = [
  { value: 'africa',        label: 'Африка',          labelEn: 'Africa',        emoji: '🌍' },
  { value: 'asia',          label: 'Азия',             labelEn: 'Asia',          emoji: '🌏' },
  { value: 'australia',     label: 'Австралия',        labelEn: 'Australia',     emoji: '🐨' },
  { value: 'europe',        label: 'Европа',           labelEn: 'Europe',        emoji: '🏰' },
  { value: 'north_america', label: 'Северна Америка',  labelEn: 'North America', emoji: '🦅' },
  { value: 'south_america', label: 'Южна Америка',     labelEn: 'South America', emoji: '🌎' },
]

export default function AnimalsHubPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { allAnimals, favoriteIds } = useData()

  const activeType      = searchParams.get('type')
  const activeContinent = searchParams.get('continent')
  const activeFavorites = searchParams.get('favorites') === '1'

  // ── Count animals per category / continent ──────────────────────────────────
  // Must stay above any conditional return (Rules of Hooks)
  const typeCounts = useMemo(() => {
    const counts = {}
    allAnimals.forEach(a => { counts[a.animalType] = (counts[a.animalType] || 0) + 1 })
    return counts
  }, [allAnimals])

  const continentCounts = useMemo(() => {
    const counts = {}
    allAnimals.forEach(a => {
      (a.continents || []).forEach(c => { counts[c] = (counts[c] || 0) + 1 })
    })
    return counts
  }, [allAnimals])

  const [activeTab, setActiveTab] = useState('type') // 'type' | 'origin'

  // If a filter is active, delegate to the list view
  if (activeType || activeContinent || activeFavorites) {
    return <AnimalsListPage />
  }

  return (
    <div className="flex flex-col pb-6">
      {/* Header */}
      <div className="bg-zoo-primary px-4 pt-10 pb-5">
        <h1 className="text-2xl font-bold text-white tracking-wide">Животните</h1>
        <p className="text-white/70 text-sm mt-0.5">
          {allAnimals.length} вида в Зоопарк София
        </p>
      </div>

      {/* Любими quick access */}
      {favoriteIds.length > 0 && (
        <div className="px-4 mt-4">
          <Link
            to="/animals/list?favorites=1"
            className="flex items-center gap-4 px-5 py-4 rounded-2xl border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 active:scale-[0.98] transition-transform"
          >
            <span className="text-4xl leading-none">❤️</span>
            <div className="flex-1 min-w-0">
              <p className="text-lg font-bold leading-tight text-red-700 dark:text-red-300">Любими</p>
            </div>
            <span className="text-2xl font-bold tabular-nums text-red-700 dark:text-red-300 opacity-80">{favoriteIds.length}</span>
          </Link>
        </div>
      )}

      {/* Tab switcher */}
      <div className="flex mx-4 mt-4 bg-[--color-bg-card] rounded-2xl p-1 border border-[--color-border]">
        <button
          onClick={() => setActiveTab('type')}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
            activeTab === 'type'
              ? 'bg-zoo-primary text-white shadow-sm'
              : 'text-zoo-brown opacity-60'
          }`}
        >
          По вид
        </button>
        <button
          onClick={() => setActiveTab('origin')}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
            activeTab === 'origin'
              ? 'bg-zoo-primary text-white shadow-sm'
              : 'text-zoo-brown opacity-60'
          }`}
        >
          По произход
        </button>
      </div>

      {/* Tiles */}
      <div className="flex flex-col gap-3 px-4 mt-4">
        {activeTab === 'type' ? (
          TYPE_TILES.map(tile => {
            const count = typeCounts[tile.value] || 0
            if (count === 0) return null
            return (
              <button
                key={tile.value}
                onClick={() => setSearchParams({ type: tile.value })}
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl border ${tile.bg} ${tile.border} active:scale-[0.98] transition-transform text-left`}
              >
                <span className="text-4xl leading-none">{tile.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-lg font-bold leading-tight ${tile.text}`}>{tile.label}</p>
                </div>
                <span className={`text-2xl font-bold tabular-nums ${tile.text} opacity-80`}>{count}</span>
              </button>
            )
          })
        ) : (
          CONTINENT_TILES.map(tile => {
            const count = continentCounts[tile.value] || 0
            return (
              <button
                key={tile.value}
                onClick={() => setSearchParams({ continent: tile.value })}
                className="flex items-center gap-4 px-5 py-4 rounded-2xl border border-[--color-border] bg-[--color-bg-card] active:scale-[0.98] transition-transform text-left"
              >
                <span className="text-4xl leading-none">{tile.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-bold leading-tight text-zoo-green">{tile.label}</p>
                </div>
                <span className="text-2xl font-bold tabular-nums text-zoo-green opacity-80">{count}</span>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
