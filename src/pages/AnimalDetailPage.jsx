import { useParams, useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext'
import DistributionMap from '../components/DistributionMap'
import AnimalLocationMap from '../components/AnimalLocationMap'
import ErrorBoundary from '../components/ErrorBoundary'

const IUCN_STYLE = {
  LC: { bg: 'bg-green-600', label: 'text-white' },
  NT: { bg: 'bg-lime-500', label: 'text-white' },
  VU: { bg: 'bg-yellow-400', label: 'text-gray-900' },
  EN: { bg: 'bg-orange-500', label: 'text-white' },
  CR: { bg: 'bg-red-600', label: 'text-white' },
  EW: { bg: 'bg-gray-700', label: 'text-white' },
  EX: { bg: 'bg-gray-900', label: 'text-white' },
}

const TYPE_EMOJI = { птица: '🐦', бозайник: '🦁', влечуго: '🦎' }

const DIET_COLOUR = {
  месояден: 'bg-red-100 text-red-700 border-red-200',
  тревопасен: 'bg-green-100 text-green-700 border-green-200',
  всеяден: 'bg-orange-100 text-orange-700 border-orange-200',
}

const STATS_META = [
  { key: 'lifespan', icon: '❤️', label: 'Живот' },
  { key: 'weight',   icon: '⚖️', label: 'Тегло' },
  { key: 'length',   icon: '📏', label: 'Дължина' },
  { key: 'height',   icon: '📐', label: 'Височина' },
]

const INFO_SECTIONS = [
  { key: 'habitat',       label: 'Местообитание' },
  { key: 'dietDescription', label: 'Храна' },
  { key: 'reproduction',  label: 'Размножаване' },
  { key: 'curiousFacts',  label: 'Любопитно' },
  { key: 'distribution',  label: 'Разпространение' },
]

export default function AnimalDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { allAnimals } = useData()
  const animal = allAnimals.find(a => a.id === id)

  if (!animal) return (
    <div className="flex items-center justify-center h-full text-zoo-brown p-8 text-center">
      Животното не е намерено
    </div>
  )

  const iucnStyle = animal.iucn ? (IUCN_STYLE[animal.iucn.code] ?? IUCN_STYLE.LC) : null
  const visibleSections = INFO_SECTIONS.filter(s => animal[s.key])

  return (
    <div className="flex flex-col pb-6">

      {/* Green header */}
      <div className="bg-zoo-primary px-4 pt-12 pb-4 relative">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 text-white/80 text-2xl leading-none"
          aria-label="Назад"
        >
          ‹
        </button>

        <div className="flex justify-between items-start gap-3">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white tracking-wide uppercase">
              {animal.nameBg}
            </h1>
            <p className="text-white/80 text-base font-medium">{animal.nameEn}</p>
            <p className="text-white/60 text-sm italic mt-0.5">({animal.species})</p>
          </div>

          {animal.classification && (
            <div className="text-right text-white/70 text-xs leading-5 shrink-0">
              <p>Сем. {animal.classification.family}</p>
              <p>Разред {animal.classification.order}</p>
              <p>Клас {animal.classification.class}</p>
            </div>
          )}
        </div>
      </div>

      {/* Photo */}
      <div className="bg-zoo-green/20 aspect-[4/3] flex items-center justify-center overflow-hidden">
        {animal.photo ? (
          <img src={animal.photo} alt={animal.nameBg} className="w-full h-full object-cover" />
        ) : (
          <span className="text-9xl opacity-30">{TYPE_EMOJI[animal.animalType] ?? '🐾'}</span>
        )}
      </div>

      {/* IUCN status */}
      {animal.iucn && (
        <div className={`flex items-center justify-between px-4 py-3 ${iucnStyle.bg}`}>
          <div>
            <p className={`text-xs font-semibold uppercase tracking-widest ${iucnStyle.label} opacity-70`}>
              IUCN Статус
            </p>
            <p className={`text-lg font-bold uppercase ${iucnStyle.label}`}>
              {animal.iucn.labelBg}
            </p>
          </div>
          <div className="text-right">
            <p className={`text-xs font-semibold uppercase tracking-widest ${iucnStyle.label} opacity-70`}>
              IUCN Status
            </p>
            <p className={`text-base font-bold ${iucnStyle.label}`}>
              {animal.iucn.labelEn}
            </p>
          </div>
        </div>
      )}

      {/* Stats grid */}
      {animal.stats && (
        <div className="grid grid-cols-2 border-b border-zoo-bark">
          {STATS_META.map(({ key, icon, label }) => animal.stats[key] && (
            <div
              key={key}
              className="flex flex-col items-center justify-center py-4 border-r border-b border-zoo-bark last:border-r-0 odd:last:col-span-2"
            >
              <p className="text-xs text-zoo-brown opacity-60 uppercase tracking-wide mb-1">
                {icon} {label}
              </p>
              <p className="text-2xl font-bold text-zoo-green">
                {animal.stats[key]}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Diet + type badges (if no stats) */}
      {!animal.stats && (
        <div className="flex flex-wrap gap-2 px-4 pt-4">
          <span className={`text-sm font-medium px-3 py-1 rounded-full border ${DIET_COLOUR[animal.diet] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
            {animal.diet}
          </span>
          <span className="text-sm font-medium px-3 py-1 rounded-full border bg-[--color-bg-base] text-zoo-brown border-[--color-border]">
            {TYPE_EMOJI[animal.animalType]} {animal.animalType}
          </span>
        </div>
      )}

      {/* Info sections */}
      {visibleSections.length > 0 && (
        <div className="divide-y divide-[--color-zoo-bark] border-t border-zoo-bark mt-4 mx-4 rounded-2xl overflow-hidden bg-[--color-bg-card] shadow-sm">
          {visibleSections.map(({ key, label }) => (
            <div key={key} className="px-4 py-4">
              <p className="text-xs font-bold uppercase tracking-widest text-zoo-green mb-1">
                {label}
              </p>
              <p className="text-sm text-zoo-brown leading-relaxed">
                {animal[key]}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Species (always shown) */}
      {!visibleSections.length && (
        <div className="mx-4 mt-4 bg-[--color-bg-card] rounded-2xl border border-[--color-border] p-4">
          <p className="text-xs text-zoo-brown opacity-60 uppercase tracking-wide mb-1">Вид</p>
          <p className="text-sm italic text-zoo-brown">{animal.species}</p>
          <p className="text-sm text-zoo-brown opacity-40 italic mt-3">Описанието предстои…</p>
        </div>
      )}

      {/* Distribution map */}
      {animal.distributionCountries?.length > 0 && (
        <ErrorBoundary fallback={null}>
          <DistributionMap countryIds={animal.distributionCountries} />
        </ErrorBoundary>
      )}

      {/* Location map + directions */}
      <ErrorBoundary fallback={null}>
        <AnimalLocationMap animal={animal} />
      </ErrorBoundary>
    </div>
  )
}
