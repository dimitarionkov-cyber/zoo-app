import { ComposableMap, Geographies, Geography } from 'react-simple-maps'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

export default function DistributionMap({ countryIds = [] }) {
  if (!countryIds.length) return null

  const highlighted = new Set(countryIds.map(String))

  return (
    <div className="mx-4 mt-4 bg-[--color-bg-card] rounded-2xl border border-[--color-border] overflow-hidden">
      <div className="px-4 pt-3 pb-1">
        <p className="text-xs font-bold uppercase tracking-widest text-zoo-green">Разпространение</p>
      </div>
      <ComposableMap
        projectionConfig={{ scale: 130, center: [20, 15] }}
        style={{ width: '100%', height: 'auto' }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map(geo => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill={highlighted.has(String(geo.id)) ? '#3a6b35' : 'var(--color-zoo-bark)'}
                stroke="var(--color-bg-card)"
                strokeWidth={0.4}
                style={{ outline: 'none', default: { outline: 'none' }, hover: { outline: 'none' }, pressed: { outline: 'none' } }}
              />
            ))
          }
        </Geographies>
      </ComposableMap>
    </div>
  )
}
