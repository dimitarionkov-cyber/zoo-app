/**
 * AnimalLocationMap
 * Compact embedded map showing a single animal marker,
 * with a directions button and live distance from the user.
 */
import { useState, useEffect, useCallback } from 'react'
import { GoogleMap, Marker } from '@react-google-maps/api'
import { useMaps } from '../context/MapsContext'

const MAP_OPTIONS = {
  mapTypeId: 'satellite',
  disableDefaultUI: true,
  gestureHandling: 'none',   // static — the main zoo map is for navigation
  zoomControl: false,
  clickableIcons: false,
  minZoom: 18,
  maxZoom: 20,
}

const DIET_COLOUR = {
  месояден:   '#ef4444',
  тревопасен: '#22c55e',
  всеяден:    '#f97316',
}

function haversine(lat1, lng1, lat2, lng2) {
  const R = 6_371_000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function formatDist(m) {
  return m < 1000 ? `${Math.round(m)} м` : `${(m / 1000).toFixed(1)} км`
}

export default function AnimalLocationMap({ animal }) {
  const { isLoaded } = useMaps()

  const [userPos,  setUserPos]  = useState(null)   // { lat, lng }
  const [distance, setDistance] = useState(null)   // metres | null
  const [geoError, setGeoError] = useState(false)

  // Ask for location once on mount
  useEffect(() => {
    if (!navigator.geolocation) { setGeoError(true); return }
    navigator.geolocation.getCurrentPosition(
      pos => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setUserPos(p)
        setDistance(haversine(p.lat, p.lng, animal.lat, animal.lng))
      },
      () => setGeoError(true),
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }, [animal.lat, animal.lng])

  const center = { lat: animal.lat, lng: animal.lng }
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${animal.lat},${animal.lng}&travelmode=walking`

  const markerIcon = useCallback(() => ({
    path: 'M 0,-10 C -6,-10 -10,-5 -10,0 C -10,6 -5,10 0,10 C 5,10 10,6 10,0 C 10,-5 6,-10 0,-10 Z',
    fillColor: DIET_COLOUR[animal.diet] ?? '#6b7280',
    fillOpacity: 1,
    strokeColor: '#ffffff',
    strokeWeight: 2,
    scale: 1.1,
    anchor: { x: 0, y: 0 },
  }), [animal.diet])

  return (
    <div className="mx-4 mt-5 rounded-2xl overflow-hidden border border-[--color-border] shadow-sm">
      {/* Map */}
      <div className="relative h-44">
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={center}
            zoom={19}
            options={MAP_OPTIONS}
          >
            <Marker position={center} icon={markerIcon()} />
          </GoogleMap>
        ) : (
          <div className="w-full h-full bg-zoo-green/10 flex items-center justify-center">
            <span className="text-zoo-brown opacity-40 text-sm">Зарежда карта…</span>
          </div>
        )}
      </div>

      {/* Footer strip — directions + distance */}
      <div className="bg-[--color-bg-card] px-4 py-3 flex items-center gap-3">
        <a
          href={mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="flex-1 flex items-center justify-center gap-2 bg-zoo-green text-white rounded-xl py-2.5 font-semibold text-sm active:opacity-80 transition-opacity"
        >
          🗺️ Упътване до клетката
        </a>

        {/* Distance badge */}
        <div className="shrink-0 flex flex-col items-center min-w-[56px]">
          {distance !== null ? (
            <>
              <span className="text-base font-bold text-zoo-green leading-tight">
                {formatDist(distance)}
              </span>
              <span className="text-[10px] text-zoo-brown opacity-60 leading-tight">от мен</span>
            </>
          ) : geoError ? (
            <span className="text-[10px] text-zoo-brown opacity-40 text-center">Локацията
не е налична</span>
          ) : (
            <span className="text-xs text-zoo-brown opacity-40">…</span>
          )}
        </div>
      </div>
    </div>
  )
}
