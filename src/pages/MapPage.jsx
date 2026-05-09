import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleMap, Marker, InfoWindow, Polyline } from '@react-google-maps/api'
import { useData } from '../context/DataContext'
import { useMaps } from '../context/MapsContext'
import pathsData from '../data/paths.json'
import routeData from '../data/route.json'

const ZOO_CENTER = { lat: 42.6583263, lng: 23.3311395 }

const mapOptions = {
  mapTypeId: 'satellite',
  disableDefaultUI: true,
  zoomControl: true,
  gestureHandling: 'greedy',
  minZoom: 16,
  maxZoom: 20,
}

const DIET_COLOUR = {
  месояден:  '#ef4444',
  тревопасен:'#22c55e',
  всеяден:   '#f97316',
}

const IUCN_COLOUR = {
  LC: '#16a34a', NT: '#65a30d', VU: '#ca8a04',
  EN: '#ea580c', CR: '#dc2626', EW: '#374151', EX: '#111827',
}

const TYPE_EMOJI = {
  птица:     '🐦',
  бозайник:  '🦁',
  влечуго:   '🦎',
  риба:      '🐟',
  земноводно:'🐸',
}

const POI_EMOJI = {
  food: '🍔', medical: '🏥', entrance: '🚪',
  ticket: '🎟️', shop: '🛍️', attraction: '🎠',
}

const POI_LABEL = {
  food: 'Хранене', medical: 'Медицински', entrance: 'Вход',
  ticket: 'Каса', shop: 'Магазин', attraction: 'Атракция',
}

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

const DARK_COLOURS = {
  bg:      '#252836',
  card:    '#1c1f2e',
  green:   '#7bc876',
  brown:   '#e8ddd0',
  text:    '#f0ede8',
  muted:   'rgba(240,237,232,0.6)',
  border:  '#3d4052',
}
const LIGHT_COLOURS = {
  bg:      '#ffffff',
  card:    '#f5f0e8',
  green:   '#3a6b35',
  brown:   '#8b5e3c',
  text:    '#1a1a1a',
  muted:   '#555',
  border:  '#d4b896',
}

// InfoWindow content uses inline styles — rendered outside React tree by Google Maps
function AnimalPopup({ animal, onViewDetail, dark }) {
  const c = dark ? DARK_COLOURS : LIGHT_COLOURS
  const iucnColour = animal.iucn ? (IUCN_COLOUR[animal.iucn.code] ?? '#16a34a') : null
  const dietColour = DIET_COLOUR[animal.diet] ?? '#6b7280'

  return (
    <div style={{ fontFamily: 'Segoe UI, sans-serif', width: 220, overflow: 'hidden', borderRadius: 8, backgroundColor: c.bg, color: c.text }}>
      {/* Green header — always zoo-green regardless of dark mode */}
      <div style={{ backgroundColor: dark ? '#5a9e52' : '#3a6b35', padding: '8px 10px', margin: '-8px -8px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 20, lineHeight: 1 }}>{TYPE_EMOJI[animal.animalType] ?? '🐾'}</span>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: '#fff', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {animal.nameBg}
          </p>
        </div>
        <p style={{ margin: '2px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.75)' }}>
          {animal.nameEn}
        </p>
        <p style={{ margin: '1px 0 0', fontSize: 10, color: 'rgba(255,255,255,0.55)', fontStyle: 'italic' }}>
          {animal.species}
        </p>
      </div>

      {/* IUCN bar */}
      {animal.iucn && (
        <div style={{ backgroundColor: iucnColour, padding: '4px 10px', margin: '0 -8px' }}>
          <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: 1 }}>
            IUCN · {animal.iucn.labelBg}
          </p>
        </div>
      )}

      {/* Diet badge */}
      <div style={{ padding: '8px 0 4px', display: 'flex', gap: 6, alignItems: 'center' }}>
        <span style={{
          display: 'inline-block', width: 8, height: 8,
          borderRadius: '50%', backgroundColor: dietColour, flexShrink: 0,
        }} />
        <span style={{ fontSize: 12, color: c.brown, fontWeight: 600 }}>{animal.diet}</span>
        {animal.classification && (
          <span style={{ fontSize: 11, color: c.muted, marginLeft: 4 }}>
            · {animal.classification.class}
          </span>
        )}
      </div>

      {/* Stats mini-grid */}
      {animal.stats && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, padding: '4px 0 8px' }}>
          {[
            { icon: '❤️', label: 'Живот', key: 'lifespan' },
            { icon: '⚖️', label: 'Тегло', key: 'weight' },
          ].filter(s => animal.stats[s.key]).map(s => (
            <div key={s.key} style={{ backgroundColor: c.card, borderRadius: 6, padding: '4px 6px', textAlign: 'center', border: `1px solid ${c.border}` }}>
              <p style={{ margin: 0, fontSize: 9, color: c.brown, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {s.icon} {s.label}
              </p>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: c.green }}>
                {animal.stats[s.key]}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Habitat snippet */}
      {animal.habitat && (
        <p style={{ margin: '0 0 8px', fontSize: 11, color: c.muted, lineHeight: 1.4 }}>
          <strong style={{ color: c.green }}>Местообитание: </strong>{animal.habitat}
        </p>
      )}

      {/* View detail button */}
      <button
        onClick={onViewDetail}
        style={{
          display: 'block', width: '100%', padding: '7px 0',
          backgroundColor: dark ? '#5a9e52' : '#3a6b35', color: '#fff',
          border: 'none', borderRadius: 8, fontSize: 12,
          fontWeight: 600, cursor: 'pointer', marginTop: 2,
        }}
      >
        Виж профила →
      </button>
    </div>
  )
}

function PoiPopup({ poi, dark }) {
  const c = dark ? DARK_COLOURS : LIGHT_COLOURS
  return (
    <div style={{ fontFamily: 'Segoe UI, sans-serif', minWidth: 160, backgroundColor: c.bg, color: c.text, padding: 4, borderRadius: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <span style={{ fontSize: 20 }}>{POI_EMOJI[poi.category] ?? '📍'}</span>
        <div>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: c.green }}>{poi.nameBg}</p>
          <p style={{ margin: 0, fontSize: 10, color: c.brown, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {POI_LABEL[poi.category] ?? poi.category}
          </p>
        </div>
      </div>
      {poi.openingHours && (
        <p style={{ margin: 0, fontSize: 11, color: c.muted, lineHeight: 1.5 }}>
          🕐 {poi.openingHours}
        </p>
      )}
    </div>
  )
}

export default function MapPage() {
  const { allAnimals, allPois, darkMode } = useData()
  const [selected,   setSelected]   = useState(null)
  const [showRoute,  setShowRoute]  = useState(false)
  const navigate = useNavigate()

  // Full route polyline — actual path through the graph (315 pts)
  const routePolyline = routeData.fullPolyline.map(([lat, lng]) => ({ lat, lng }))

  const { isLoaded, loadError } = useMaps()

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
    <div className="relative w-full h-full">

    {/* Route toggle button */}
    <button
      onClick={() => { setShowRoute(r => !r); setSelected(null) }}
      className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg transition-colors"
      style={{
        backgroundColor: showRoute ? '#3a6b35' : 'rgba(255,255,255,0.92)',
        color: showRoute ? '#fff' : '#3a6b35',
        border: '2px solid #3a6b35',
      }}
    >
      🦶 {showRoute ? `Маршрут · ${(routeData.totalDistanceM/1000).toFixed(2)} км` : 'Покажи маршрут'}
    </button>

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

      {/* Optimal tour route overlay — always mounted, toggled via visible */}
      <Polyline
        path={routePolyline}
        options={{
          strokeColor: '#facc15',
          strokeOpacity: 0.9,
          strokeWeight: 4,
          icons: [{
            icon: { path: window.google.maps.SymbolPath.FORWARD_OPEN_ARROW, scale: 3, strokeColor: '#facc15' },
            repeat: '80px',
          }],
          clickable: false,
          zIndex: 3,
          visible: showRoute,
        }}
      />

      {/* Animal markers — show step number when route is active */}
      {allAnimals.map(animal => {
        const routeStep = showRoute
          ? routeData.steps.find(s => s.id === animal.id)
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

      {allPois.map(poi => (
        <Marker
          key={poi.id}
          position={{ lat: poi.lat, lng: poi.lng }}
          label={{ text: POI_EMOJI[poi.category] ?? '📍', fontSize: '18px' }}
          title={poi.nameBg}
          onClick={() => setSelected({ type: 'poi', data: poi })}
        />
      ))}

      {selected && (
        <InfoWindow
          position={{ lat: selected.data.lat, lng: selected.data.lng }}
          onCloseClick={() => setSelected(null)}
          options={{ pixelOffset: new window.google.maps.Size(0, -10) }}
        >
          {selected.type === 'animal'
            ? <AnimalPopup
                animal={selected.data}
                onViewDetail={() => navigate(`/animals/${selected.data.id}`)}
                dark={darkMode}
              />
            : <PoiPopup poi={selected.data} dark={darkMode} />
          }
        </InfoWindow>
      )}
    </GoogleMap>
    </div>
  )
}
