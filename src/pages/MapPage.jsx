import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleMap, Marker, Polyline } from '@react-google-maps/api'
import { useData } from '../context/DataContext'
import { useMaps } from '../context/MapsContext'
import pathsData from '../data/paths.json'
import mainMainData from '../data/routes/main-main.json'
import mainWestData from '../data/routes/main-west.json'
import westWestData from '../data/routes/west-west.json'
import westMainData from '../data/routes/west-main.json'

const ROUTE_OPTIONS = [
  { key: 'main-main', labelShort: 'Гл ↺',    labelLong: 'Главен (кръг)',    parking: '🅿 65',      data: mainMainData },
  { key: 'main-west', labelShort: 'Гл → Зап', labelLong: 'Главен → Западен', parking: '🅿 65 → 32', data: mainWestData },
  { key: 'west-west', labelShort: 'Зап ↺',   labelLong: 'Западен (кръг)',   parking: '🅿 32',      data: westWestData },
  { key: 'west-main', labelShort: 'Зап → Гл', labelLong: 'Западен → Главен', parking: '🅿 32 → 65', data: westMainData },
]

const ZOO_CENTER = { lat: 42.6583263, lng: 23.3311395 }

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
  return m < 1000 ? `${Math.round(m)} м` : `${(m / 1000).toFixed(1)} км`
}

const mapOptions = {
  mapTypeId: 'satellite',
  disableDefaultUI: true,
  zoomControl: true,
  gestureHandling: 'greedy',
  minZoom: 16,
  maxZoom: 20,
}

const DIET_COLOUR = {
  месояден:   '#ef4444',
  тревопасен: '#22c55e',
  всеяден:    '#f97316',
}

const IUCN_COLOUR = {
  LC: '#16a34a', NT: '#65a30d', VU: '#ca8a04',
  EN: '#ea580c', CR: '#dc2626', EW: '#374151', EX: '#111827',
}

const TYPE_EMOJI = {
  птица:      '🐦',
  бозайник:   '🦁',
  влечуго:    '🦎',
  риба:       '🐟',
  земноводно: '🐸',
}

const POI_EMOJI = {
  food: '🍔', medical: '🏥', entrance: '🚪',
  ticket: '🎟️', shop: '🛍️', attraction: '🎠',
  parking: '🅿️', bus_stop: '🚌',
}

const POI_LABEL = {
  food: 'Хранене', medical: 'Медицински', entrance: 'Вход',
  ticket: 'Каса', shop: 'Магазин', attraction: 'Атракция',
  parking: 'Паркинг', bus_stop: 'Спирка',
}

const FILTERS = [
  { key: null,         emoji: '🐾', label: 'Всички'   },
  { key: 'europe',     emoji: '🏰', label: 'Европа'   },
  { key: 'africa',     emoji: '🌍', label: 'Африка'   },
  { key: 'asia',       emoji: '🌏', label: 'Азия'     },
  { key: 'americas',   emoji: '🌎', label: 'Америка'  },
  { key: 'australia',  emoji: '🐨', label: 'Австралия'},
  { key: 'food',       emoji: '🍔', label: 'Храна'    },
  { key: 'services',   emoji: '🏥', label: 'Услуги'   },
]

const CONTINENT_FILTERS = new Set(['europe', 'africa', 'asia', 'americas', 'australia'])
const SERVICE_CATEGORIES = new Set(['medical', 'entrance', 'ticket', 'shop', 'attraction', 'parking', 'bus_stop'])

function animalIcon(diet) {
  return {
    path: 'M 0,-8 C -5,-8 -8,-4 -8,0 C -8,5 -4,8 0,8 C 4,8 8,5 8,0 C 8,-4 5,-8 0,-8 Z',
    fillColor: DIET_COLOUR[diet] ?? '#6b7280',
    fillOpacity: 1,
    strokeColor: '#fff',
    strokeWeight: 1.5,
    scale: 1,
  }
}

function AnimalSheet({ animal, onViewDetail, dist }) {
  const iucnColour = animal.iucn ? (IUCN_COLOUR[animal.iucn.code] ?? '#16a34a') : null
  const dietColour = DIET_COLOUR[animal.diet] ?? '#6b7280'

  return (
    <>
      <div className="flex items-start gap-3">
        <span className="text-3xl leading-none mt-0.5 shrink-0">
          {TYPE_EMOJI[animal.animalType] ?? '🐾'}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[15px] text-[--color-text-main] leading-tight">{animal.nameBg}</p>
          <p className="text-xs italic text-zoo-brown opacity-60 truncate">{animal.species}</p>
          {dist != null && (
            <p className="text-[11px] font-semibold text-blue-500 mt-0.5">📍 {formatDist(dist)}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span
            className="text-[10px] font-bold text-white px-2 py-0.5 rounded-full"
            style={{ backgroundColor: dietColour }}
          >
            {animal.diet}
          </span>
          {animal.iucn && (
            <span
              className="text-[10px] font-bold text-white px-2 py-0.5 rounded-full"
              style={{ backgroundColor: iucnColour }}
            >
              {animal.iucn.code}
            </span>
          )}
        </div>
      </div>

      {animal.habitat && (
        <p className="mt-2 text-xs text-zoo-brown opacity-60 line-clamp-2 leading-relaxed">
          {animal.habitat}
        </p>
      )}

      <button
        onClick={onViewDetail}
        className="mt-3 w-full py-2.5 bg-zoo-primary text-white text-sm font-semibold rounded-xl active:opacity-80 transition-opacity"
      >
        Виж профила →
      </button>
    </>
  )
}

function PoiSheet({ poi }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-3xl leading-none shrink-0">{POI_EMOJI[poi.category] ?? '📍'}</span>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-[15px] text-[--color-text-main]">{poi.nameBg}</p>
        <p className="text-xs text-zoo-brown opacity-60 uppercase tracking-wide">
          {POI_LABEL[poi.category] ?? poi.category}
        </p>
        {poi.openingHours && (
          <p className="text-xs text-zoo-brown opacity-50 mt-0.5">🕐 {poi.openingHours}</p>
        )}
      </div>
    </div>
  )
}

export default function MapPage() {
  const { allAnimals, allPois } = useData()
  const [selected,     setSelected]     = useState(null)
  const [showRoute,    setShowRoute]    = useState(false)
  const [activeRoute,  setActiveRoute]  = useState('main-main')
  const [activeFilter, setActiveFilter] = useState(null)
  const [userPos,      setUserPos]      = useState(null)
  const watchIdRef = useRef(null)
  const navigate = useNavigate()

  const currentRoute  = ROUTE_OPTIONS.find(r => r.key === activeRoute).data
  const routePolyline = currentRoute.fullPolyline.map(([lat, lng]) => ({ lat, lng }))
  const { isLoaded, loadError } = useMaps()

  useEffect(() => {
    if (!navigator.geolocation) return
    watchIdRef.current = navigator.geolocation.watchPosition(
      pos => setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 },
    )
    return () => {
      if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current)
    }
  }, [])

  const visibleAnimals = allAnimals.filter(a => {
    if (!activeFilter || !CONTINENT_FILTERS.has(activeFilter)) return !activeFilter || activeFilter === null
    if (activeFilter === 'americas') return (a.continents ?? []).some(c => c === 'north_america' || c === 'south_america')
    return (a.continents ?? []).includes(activeFilter)
  })

  const visiblePois = allPois.filter(p => {
    if (!activeFilter) return true
    if (activeFilter === 'food')     return p.category === 'food'
    if (activeFilter === 'services') return SERVICE_CATEGORIES.has(p.category)
    return false
  })

  if (loadError) return (
    <div className="flex items-center justify-center h-full text-red-500 p-4">
      Грешка: {loadError.message}
    </div>
  )

  if (!isLoaded) return (
    <div className="flex items-center justify-center h-full text-zoo-brown">
      Зарежда се…
    </div>
  )

  return (
    <div className="flex flex-col w-full h-full">

      {/* ── Header ── */}
      <div className="bg-zoo-primary px-4 pt-10 pb-3 z-20">

        {/* Title row + route toggle */}
        <div className="flex items-center gap-3 mb-3">
          <h1 className="flex-1 text-xl font-bold text-white tracking-wide">Карта</h1>
          <button
            onClick={() => { setShowRoute(r => !r); setSelected(null) }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
              showRoute
                ? 'bg-white text-zoo-green border-white'
                : 'text-white/80 border-white/30'
            }`}
          >
            <span>🦶</span>
            <span>Маршрут</span>
          </button>
        </div>

        {/* Route selector — visible when route is on */}
        {showRoute && (
          <div className="flex gap-2 overflow-x-auto scrollbar-none mb-2.5">
            {ROUTE_OPTIONS.map(r => (
              <button
                key={r.key}
                onClick={() => { setActiveRoute(r.key); setSelected(null) }}
                className={`shrink-0 flex flex-col items-start px-3 py-1.5 rounded-xl border text-[10px] font-semibold transition-colors ${
                  activeRoute === r.key
                    ? 'bg-white text-zoo-green border-white'
                    : 'text-white/80 border-white/30'
                }`}
              >
                <span className="text-[11px] font-bold leading-tight">{r.labelShort}</span>
                <span className="opacity-70 mt-0.5">{r.parking}</span>
              </button>
            ))}
            {/* Distance badge for selected route */}
            <div className="shrink-0 flex flex-col items-start px-3 py-1.5 rounded-xl border border-white/20 text-[10px] text-white/60">
              <span className="font-bold leading-tight">
                {(ROUTE_OPTIONS.find(r => r.key === activeRoute).data.totalDistanceM / 1000).toFixed(1)} км
              </span>
              <span className="opacity-70 mt-0.5">{ROUTE_OPTIONS.find(r => r.key === activeRoute).data.animalCount} спирки</span>
            </div>
          </div>
        )}

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-0.5">
          {FILTERS.map(f => (
            <button
              key={String(f.key)}
              onClick={() => { setActiveFilter(f.key); setSelected(null) }}
              className={`shrink-0 flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl border text-[10px] font-semibold transition-colors ${
                activeFilter === f.key
                  ? 'bg-white text-zoo-green border-white'
                  : 'text-white/80 border-white/30'
              }`}
            >
              <span className="text-base leading-none">{f.emoji}</span>
              <span>{f.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Map fills remaining height ── */}
      <div className="flex-1 relative">
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={ZOO_CENTER}
          zoom={17}
          options={mapOptions}
          onClick={() => setSelected(null)}
        >
          {/* Zoo pathways */}
          {pathsData.map(path => (
            <Polyline
              key={path.id}
              path={path.coords.map(([lat, lng]) => ({ lat, lng }))}
              options={{
                strokeColor: path.type === 'steps' ? '#f97316' : '#ffffff',
                strokeOpacity: path.type === 'steps' ? 0.9 : 0.55,
                strokeWeight: path.type === 'steps' ? 2 : 3,
                clickable: false,
                zIndex: 1,
              }}
            />
          ))}

          {/* Optimal tour route overlay */}
          <Polyline
            path={routePolyline}
            options={{
              strokeColor: '#facc15',
              strokeOpacity: 0.9,
              strokeWeight: 4,
              icons: [{
                icon: {
                  path: window.google.maps.SymbolPath.FORWARD_OPEN_ARROW,
                  scale: 3,
                  strokeColor: '#facc15',
                },
                repeat: '80px',
              }],
              clickable: false,
              zIndex: 3,
              visible: showRoute,
            }}
          />

          {/* Animal markers */}
          {visibleAnimals.map(animal => {
            const routeStep = showRoute
              ? currentRoute.steps.find(s => s.id === animal.id)
              : null
            return (
              <Marker
                key={animal.id}
                position={{ lat: animal.lat, lng: animal.lng }}
                icon={routeStep ? null : animalIcon(animal.diet)}
                label={routeStep ? {
                  text: String(routeStep.step),
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 'bold',
                } : undefined}
                title={animal.nameBg}
                onClick={() => setSelected({ type: 'animal', data: animal })}
              />
            )
          })}

          {/* POI markers */}
          {visiblePois.map(poi => (
            <Marker
              key={poi.id}
              position={{ lat: poi.lat, lng: poi.lng }}
              label={{ text: POI_EMOJI[poi.category] ?? '📍', fontSize: '18px' }}
              title={poi.nameBg}
              onClick={() => setSelected({ type: 'poi', data: poi })}
            />
          ))}

          {/* User location */}
          {userPos && (
            <Marker
              position={userPos}
              title="Моята локация"
              zIndex={20}
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                fillColor: '#3b82f6',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 3,
                scale: 10,
              }}
              label={{
                text: '●',
                color: '#ffffff',
                fontSize: '6px',
              }}
            />
          )}
        </GoogleMap>

        {/* ── Bottom sheet ── */}
        {selected && (
          <div className="absolute bottom-0 left-0 right-0 z-20 px-3 pb-3">
            <div
              className="rounded-2xl border border-[--color-border] shadow-2xl px-4 pt-2 pb-4"
              style={{ backgroundColor: 'var(--color-bg-card)' }}
            >
              {/* Close row */}
              <div className="flex justify-end mb-1">
                <button
                  onClick={() => setSelected(null)}
                  className="w-7 h-7 flex items-center justify-center text-zoo-brown opacity-40 text-base leading-none active:opacity-70"
                  aria-label="Затвори"
                >
                  ✕
                </button>
              </div>

              {selected.type === 'animal'
                ? <AnimalSheet
                    animal={selected.data}
                    onViewDetail={() => navigate(`/animals/${selected.data.id}`)}
                    dist={userPos ? haversine(userPos.lat, userPos.lng, selected.data.lat, selected.data.lng) : null}
                  />
                : <PoiSheet poi={selected.data} />
              }
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
