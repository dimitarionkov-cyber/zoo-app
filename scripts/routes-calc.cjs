/**
 * Zoo Multi-Route Calculator
 * Generates 4 optimal walking routes:
 *   main-main  (circular, Central entrance)
 *   main-west  (open path, Central → West)
 *   west-west  (circular, West entrance)
 *   west-main  (open path, West → Central)
 *
 * Algorithm: graph from paths.json → Dijkstra all-pairs → TSP (NN + 2-opt)
 * Open-path variant: fixed start + fixed end, animals in between.
 */

const fs   = require('fs')
const path = require('path')

const DATA = path.join(__dirname, '..', 'src', 'data')

const animals  = JSON.parse(fs.readFileSync(path.join(DATA, 'animals.json'),  'utf8'))
const pathsRaw = JSON.parse(fs.readFileSync(path.join(DATA, 'paths.json'),    'utf8'))

// ── Entrances ─────────────────────────────────────────────────────────────────
const MAIN = {
  id: 'main-entrance', nameBg: 'Главен вход', nameEn: 'Main Entrance',
  lat: 42.6597941, lng: 23.3340426, parking: 65,
}
const WEST = {
  id: 'west-entrance', nameBg: 'Западен вход', nameEn: 'West Entrance',
  lat: 42.6601390, lng: 23.3307871, parking: 32,
}

// ── Haversine distance (metres) ───────────────────────────────────────────────
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6_371_000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ── Build graph from paths.json ───────────────────────────────────────────────
const nodeKey = (lat, lng) => `${lat.toFixed(7)},${lng.toFixed(7)}`
const nodeMap  = {}
const adjList  = {}
let   nodeCounter = 0

function getOrCreate(lat, lng) {
  const k = nodeKey(lat, lng)
  if (!nodeMap[k]) {
    const id = nodeCounter++
    nodeMap[k] = { id, lat, lng }
    adjList[id] = []
  }
  return nodeMap[k].id
}

for (const seg of pathsRaw) {
  const weight = seg.type === 'steps' ? 1.4 : 1.0
  for (let i = 0; i < seg.coords.length - 1; i++) {
    const [lat1, lng1] = seg.coords[i]
    const [lat2, lng2] = seg.coords[i + 1]
    const a    = getOrCreate(lat1, lng1)
    const b    = getOrCreate(lat2, lng2)
    const dist = haversine(lat1, lng1, lat2, lng2) * weight
    adjList[a].push({ to: b, dist })
    adjList[b].push({ to: a, dist })
  }
}

const totalNodes = nodeCounter
const allNodes   = Object.values(nodeMap)
// Fast node lookup by id
const nodeById   = new Array(totalNodes)
for (const n of allNodes) nodeById[n.id] = n

console.log(`Graph: ${totalNodes} nodes, ${Object.values(adjList).flat().length / 2} edges\n`)

// ── Dijkstra from a single source ─────────────────────────────────────────────
function dijkstra(srcId) {
  const dist = new Float64Array(totalNodes).fill(Infinity)
  const prev = new Int32Array(totalNodes).fill(-1)
  dist[srcId] = 0
  const pq = [{ id: srcId, d: 0 }]
  while (pq.length) {
    pq.sort((a, b) => a.d - b.d)
    const { id, d } = pq.shift()
    if (d > dist[id]) continue
    for (const { to, dist: w } of adjList[id] || []) {
      const nd = d + w
      if (nd < dist[to]) { dist[to] = nd; prev[to] = id; pq.push({ id: to, d: nd }) }
    }
  }
  return { dist, prev }
}

// ── Snap a coordinate to the nearest graph node ───────────────────────────────
function snapToGraph(lat, lng) {
  let best = null, bestDist = Infinity
  for (const n of allNodes) {
    const d = haversine(lat, lng, n.lat, n.lng)
    if (d < bestDist) { bestDist = d; best = n }
  }
  return { nodeId: best.id, snapDist: bestDist }
}

// ── Reconstruct walking path between two graph nodes ─────────────────────────
function reconstructPath(prev, srcId, dstId) {
  const p = []
  let cur = dstId
  while (cur !== -1) {
    p.push(cur)
    if (cur === srcId) break
    cur = prev[cur]
  }
  if (p[p.length - 1] !== srcId) return []
  return p.reverse().map(id => { const n = nodeById[id]; return [n.lat, n.lng] })
}

// ── TSP helpers ───────────────────────────────────────────────────────────────
function tourLength(tour, dm) {
  let total = 0
  for (let i = 0; i < tour.length - 1; i++) total += dm[tour[i]][tour[i + 1]]
  return total
}

function twoOpt(tour, dm) {
  let improved = true
  while (improved) {
    improved = false
    for (let i = 1; i < tour.length - 2; i++) {
      for (let j = i + 1; j < tour.length - 1; j++) {
        const before = dm[tour[i-1]][tour[i]]   + dm[tour[j]][tour[j+1]]
        const after  = dm[tour[i-1]][tour[j]]   + dm[tour[i]][tour[j+1]]
        if (after < before - 0.01) {
          tour.splice(i, j - i + 1, ...tour.slice(i, j + 1).reverse())
          improved = true
        }
      }
    }
  }
  return tour
}

// ── Core route computation ────────────────────────────────────────────────────
function computeRoute(startEnt, endEnt) {
  const circular = startEnt.id === endEnt.id
  console.log(`  Computing ${startEnt.nameBg} → ${endEnt.nameBg} (${circular ? 'circular' : 'open path'})...`)

  // Waypoints: [start, ...animals, (end if open)]
  const wps = [
    startEnt,
    ...animals,
    ...( circular ? [] : [endEnt] ),
  ]
  const N = wps.length

  // Snap each waypoint to the graph
  const snapped = wps.map(wp => ({ wp, ...snapToGraph(wp.lat, wp.lng) }))

  const worst = snapped.reduce((a, b) => a.snapDist > b.snapDist ? a : b)
  console.log(`    Worst snap: "${worst.wp.nameBg}" — ${worst.snapDist.toFixed(1)} m from path`)

  // Dijkstra from each waypoint → distance matrix + prev matrix
  console.log(`    Running ${N} Dijkstra passes...`)
  const dm   = []   // dm[i][j]   = shortest dist between waypoints i and j
  const prev = []   // prev[i]    = prev array from Dijkstra at waypoint i
  let unreachable = 0
  for (let i = 0; i < N; i++) {
    const { dist, prev: p } = dijkstra(snapped[i].nodeId)
    prev.push(p)
    dm.push(snapped.map((s, j) => {
      const d = dist[s.nodeId]
      if (isFinite(d)) return d
      unreachable++
      return haversine(snapped[i].wp.lat, snapped[i].wp.lng, s.wp.lat, s.wp.lng) * 2
    }))
  }
  if (unreachable > 0) console.warn(`    ⚠ ${unreachable} pairs unreachable — using straight-line fallback`)

  // Nearest-neighbour TSP
  // Circular:  start=0, visit 1..N-1, return to 0
  // Open path: start=0, visit 1..N-2, end at N-1
  const endIdx     = circular ? 0 : N - 1
  const animalPool = circular
    ? Array.from({ length: N - 1 }, (_, i) => i + 1)      // [1..N-1]
    : Array.from({ length: N - 2 }, (_, i) => i + 1)      // [1..N-2]

  const visited = new Set([0])
  const tour    = [0]
  for (const _ of animalPool) {
    const last = tour[tour.length - 1]
    let bestNext = -1, bestDist = Infinity
    for (const j of animalPool) {
      if (!visited.has(j) && dm[last][j] < bestDist) {
        bestDist = dm[last][j]; bestNext = j
      }
    }
    visited.add(bestNext)
    tour.push(bestNext)
  }
  tour.push(endIdx)   // return to start (circular) or go to end entrance (open)

  const nnLen = tourLength(tour, dm)
  twoOpt(tour, dm)
  const finalLen = tourLength(tour, dm)
  console.log(`    NN: ${(nnLen/1000).toFixed(2)} km → 2-opt: ${(finalLen/1000).toFixed(2)} km (${((1-finalLen/nnLen)*100).toFixed(1)}% better)`)

  // Build steps and flat polyline
  const fullPolyline = []
  const steps = tour.map((wpIdx, stepNum) => {
    const s       = snapped[wpIdx]
    const legDist = stepNum > 0 ? dm[tour[stepNum - 1]][wpIdx] : 0
    let legCoords = []
    if (stepNum > 0) {
      legCoords = reconstructPath(prev[tour[stepNum - 1]], snapped[tour[stepNum - 1]].nodeId, s.nodeId)
      if (legCoords.length > 0) {
        fullPolyline.push(...legCoords.slice(fullPolyline.length > 0 ? 1 : 0))
      }
    }
    return {
      step:       stepNum,
      id:         s.wp.id ?? (stepNum === 0 ? startEnt.id : endEnt.id),
      nameBg:     s.wp.nameBg,
      nameEn:     s.wp.nameEn ?? '',
      lat:        s.wp.lat,
      lng:        s.wp.lng,
      legDistM:   Math.round(legDist),
      animalType: s.wp.animalType ?? 'entrance',
    }
  })

  return {
    startEntrance: { id: startEnt.id, nameBg: startEnt.nameBg, nameEn: startEnt.nameEn, parking: startEnt.parking },
    endEntrance:   { id: endEnt.id,   nameBg: endEnt.nameBg,   nameEn: endEnt.nameEn,   parking: endEnt.parking   },
    circular,
    totalDistanceM: Math.round(finalLen),
    animalCount:    animals.length,
    generatedAt:    new Date().toISOString(),
    steps:          steps.map(({ step, id, nameBg, nameEn, lat, lng, legDistM, animalType }) =>
                      ({ step, id, nameBg, nameEn, lat, lng, legDistM, animalType })),
    fullPolyline,
  }
}

// ── Generate all routes ───────────────────────────────────────────────────────
const outDir = path.join(DATA, 'routes')
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir)

const configs = [
  { file: 'main-main.json', start: MAIN, end: MAIN },
  { file: 'main-west.json', start: MAIN, end: WEST },
  { file: 'west-west.json', start: WEST, end: WEST },
  { file: 'west-main.json', start: WEST, end: MAIN },
]

console.log(`Animals in dataset: ${animals.length}\n`)

for (const { file, start, end } of configs) {
  console.log(`► ${file}`)
  const route    = computeRoute(start, end)
  const outPath  = path.join(outDir, file)
  fs.writeFileSync(outPath, JSON.stringify(route, null, 2), 'utf8')
  console.log(`  ✓ Saved — ${(route.totalDistanceM/1000).toFixed(2)} km, ${route.steps.length} stops, ${route.fullPolyline.length} polyline pts\n`)
}

// Keep legacy route.json in sync with main-main for backward compatibility
const mainMain = JSON.parse(fs.readFileSync(path.join(outDir, 'main-main.json'), 'utf8'))
fs.writeFileSync(path.join(DATA, 'route.json'), JSON.stringify(mainMain, null, 2), 'utf8')
console.log('✓ Updated legacy route.json with main-main route')
console.log('\nAll done.')
