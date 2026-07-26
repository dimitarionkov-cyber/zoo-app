import { useEffect, useMemo, useState } from 'react'
import { geoEqualEarth, geoPath } from 'd3-geo'
import { feature } from 'topojson-client'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'
const WIDTH = 800
const HEIGHT = 600

let cachedFeatures = null
let cachedFeaturesPromise = null

function loadFeatures() {
  if (cachedFeatures) return Promise.resolve(cachedFeatures)
  if (!cachedFeaturesPromise) {
    cachedFeaturesPromise = fetch(GEO_URL)
      .then(res => res.json())
      .then(topology => {
        const objectKey = Object.keys(topology.objects)[0]
        cachedFeatures = feature(topology, topology.objects[objectKey]).features
        return cachedFeatures
      })
  }
  return cachedFeaturesPromise
}

export default function DistributionMap({ countryIds = [] }) {
  const [features, setFeatures] = useState(cachedFeatures)

  useEffect(() => {
    if (features) return
    let cancelled = false
    loadFeatures().then(feats => {
      if (!cancelled) setFeatures(feats)
    })
    return () => { cancelled = true }
  }, [features])

  const highlighted = useMemo(() => new Set(countryIds.map(String)), [countryIds])

  const path = useMemo(() => {
    const projection = geoEqualEarth()
      .scale(130)
      .center([20, 15])
      .translate([WIDTH / 2, HEIGHT / 2])
    return geoPath().projection(projection)
  }, [])

  if (!countryIds.length || !features) return null

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      style={{ width: '100%', height: 'auto', display: 'block' }}
    >
      {features.map((geo, i) => (
        <path
          key={i}
          d={path(geo)}
          fill={highlighted.has(String(geo.id)) ? '#3a6b35' : 'var(--color-zoo-bark)'}
          stroke="var(--color-bg-card)"
          strokeWidth={0.4}
          style={{ outline: 'none' }}
        />
      ))}
    </svg>
  )
}
