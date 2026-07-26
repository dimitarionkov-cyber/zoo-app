/**
 * AnimalLocationMap
 * Compact satellite map showing a single animal marker.
 * Distance is computed by the parent (single geolocation source of truth)
 * and passed in — this component only renders the map + a slim footer.
 */
import { useCallback } from 'react'
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

function formatDist(m) {
  return m < 1000 ? `${Math.round(m)} м` : `${(m / 1000).toFixed(1)} км`
}

export default function AnimalLocationMap({ animal, distance, geoError }) {
  const { isLoaded } = useMaps()
  const center = { lat: animal.lat, lng: animal.lng }

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
    <>
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

      {/* Footer strip — satellite/cage label + live distance, no button (CTA lives outside) */}
      <div className="px-4 py-2.5 flex items-center justify-between" style={{ borderTop: '1px solid var(--color-border)' }}>
        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-zoo-brown opacity-60">сателит · клетка</span>
        <span className="text-xs font-semibold text-zoo-brown">
          {distance != null ? formatDist(distance) : geoError ? 'локацията не е налична' : '…'}
        </span>
      </div>
    </>
  )
}
