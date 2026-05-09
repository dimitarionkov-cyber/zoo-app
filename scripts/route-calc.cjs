/**
 * Zoo Route Calculator
 * Builds a graph from paths.json, snaps each animal to the nearest path node,
 * runs Dijkstra for all-pairs shortest paths, then solves TSP via
 * nearest-neighbour + 2-opt to produce an optimal walking tour.
 */

const fs = require('fs')
const path = require('path')

const DATA = path.join(__dirname, '..', 'src', 'data')
const animals  = JSON.parse(fs.readFileSync(path.join(DATA, 'animals.json'),  'utf8'))
const paths    = JSON.parse(fs.readFileSync(path.join(DATA, 'paths.json'),    'utf8'))

// ── Haversine distance in metres ─────────────────────────────────────────────
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6_371_000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 +
            Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLng/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

// ── Build graph from path segments ───────────────────────────────────────────
// Nodes keyed by "lat,lng" string (rounded to 7dp to merge coincident points)
const nodeKey  = (lat, lng) => `${lat.toFixed(7)},${lng.toFixed(7)}`
const nodeMap  = {}   // key → { id, lat, lng }
const adjList  = {}   // nodeId → [{ to: nodeId, dist: metres }]
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

for (const seg of paths) {
  const coords = seg.coords          // [[lat,lng], ...]
  const weight = seg.type === 'steps' ? 1.4 : 1.0   // steps cost 40 % more

  for (let i = 0; i < coords.length - 1; i++) {
    const [lat1, lng1] = coords[i]
    const [lat2, lng2] = coords[i + 1]
    const a = getOrCreate(lat1, lng1)
    const b = getOrCreate(lat2, lng2)
    const dist = haversine(lat1, lng1, lat2, lng2) * weight
    adjList[a].push({ to: b, dist })
    adjList[b].push({ to: a, dist })  // undirected
  }
}

const totalNodes = nodeCounter
console.log(`Graph: ${totalNodes} nodes, ${Object.values(adjList).flat().length / 2} edges`)

// ── Dijkstra from a single source — returns dist array AND predecessor array ──
function dijkstra(srcId) {
  const dist = new Float64Array(totalNodes).fill(Infinity)
  const prev = new Int32Array(totalNodes).fill(-1)
  dist[srcId] = 0
  const pq = [{ id: srcId, d: 0 }]

  while (pq.length) {
    pq.sort((a, b) => a.d - b.d)
    const { id, d } = pq.shift()
    if (d > dist[id]) continue
    for (const { to, dist: w } of (adjList[id] || [])) {
      const nd = d + w
      if (nd < dist[to]) {
        dist[to] = nd
        prev[to] = id
        pq.push({ id: to, d: nd })
      }
    }
  }
  return { dist, prev }
}

// ── Reconstruct the path between two nodes given a prev array ─────────────────
function reconstructPath(prev, srcId, dstId) {
  const path = []
  let cur = dstId
  while (cur !== -1) {
    path.push(cur)
    if (cur === srcId) break
    cur = prev[cur]
  }
  if (path[path.length - 1] !== srcId) return []   // unreachable
  path.reverse()
  return path.map(id => {
    const n = allNodes.find(n => n.id === id)
    return [n.lat, n.lng]
  })
}

// ── Snap a lat/lng to the nearest graph node ─────────────────────────────────
const allNodes = Object.values(nodeMap)

function snapToGraph(lat, lng) {
  let best = null, bestDist = Infinity
  for (const n of allNodes) {
    const d = haversine(lat, lng, n.lat, n.lng)
    if (d < bestDist) { bestDist = d; best = n }
  }
  return { nodeId: best.id, snapDist: bestDist }
}

// ── Snap entrance and all animals ─────────────────────────────────────────────
const ENTRANCE = { lat: 42.6597941, lng: 23.3340426, nameBg: 'Главен вход' }

const waypoints = [
  { ...ENTRANCE, animalIdx: -1 },
  ...animals.map((a, i) => ({ ...a, animalIdx: i }))
]

const snapped = waypoints.map(wp => {
  const { nodeId, snapDist } = snapToGraph(wp.lat, wp.lng)
  return { wp, nodeId, snapDist }
})

console.log(`\nSnapped ${snapped.length} waypoints (entrance + ${animals.length} animals)`)
const worstSnap = snapped.reduce((a, b) => a.snapDist > b.snapDist ? a : b)
console.log(`Worst snap: "${worstSnap.wp.nameBg}" — ${worstSnap.snapDist.toFixed(1)} m from path`)

// ── All-pairs shortest paths between waypoints ────────────────────────────────
const N = snapped.length
const distMatrix = []
const prevMatrix = []   // prevMatrix[i] = prev array for source i

console.log(`\nComputing ${N} Dijkstra runs...`)
for (let i = 0; i < N; i++) {
  const { dist, prev } = dijkstra(snapped[i].nodeId)
  // Replace Infinity distances with haversine fallback so TSP can still work
  const row = snapped.map((s, j) => {
    const d = dist[s.nodeId]
    if (isFinite(d)) return d
    // Fallback: straight-line distance (penalised ×2 to prefer real paths)
    return haversine(snapped[i].wp.lat, snapped[i].wp.lng, s.wp.lat, s.wp.lng) * 2
  })
  distMatrix.push(row)
  prevMatrix.push(prev)
}

// Report how many pairs are truly unreachable (used fallback)
let unreachable = 0
for (let i = 0; i < N; i++) {
  const { dist } = dijkstra(snapped[i].nodeId)
  for (let j = 0; j < N; j++) {
    if (!isFinite(dist[snapped[j].nodeId])) unreachable++
  }
}
if (unreachable > 0) console.warn(`⚠  ${unreachable} waypoint pairs unreachable via graph — using straight-line fallback`)
console.log('Done.')

// ── Nearest-neighbour TSP (start and end at entrance = index 0) ───────────────
function nearestNeighbour() {
  const visited = new Set([0])
  const tour = [0]
  while (visited.size < N) {
    const last = tour[tour.length - 1]
    let bestNext = -1, bestDist = Infinity
    for (let j = 0; j < N; j++) {
      if (!visited.has(j) && distMatrix[last][j] < bestDist) {
        bestDist = distMatrix[last][j]
        bestNext = j
      }
    }
    visited.add(bestNext)
    tour.push(bestNext)
  }
  tour.push(0)   // return to entrance
  return tour
}

// ── 2-opt improvement ─────────────────────────────────────────────────────────
function tourLength(tour) {
  let total = 0
  for (let i = 0; i < tour.length - 1; i++) total += distMatrix[tour[i]][tour[i+1]]
  return total
}

function twoOpt(tour) {
  let improved = true
  while (improved) {
    improved = false
    // Don't move the entrance (index 0 in tour, first and last positions)
    for (let i = 1; i < tour.length - 2; i++) {
      for (let j = i + 1; j < tour.length - 1; j++) {
        const before = distMatrix[tour[i-1]][tour[i]] + distMatrix[tour[j]][tour[j+1]]
        const after  = distMatrix[tour[i-1]][tour[j]] + distMatrix[tour[i]][tour[j+1]]
        if (after < before - 0.01) {
          // Reverse segment between i and j
          const seg = tour.slice(i, j+1).reverse()
          tour.splice(i, j-i+1, ...seg)
          improved = true
        }
      }
    }
  }
  return tour
}

let tour = nearestNeighbour()
const nnLength = tourLength(tour)
tour = twoOpt(tour)
const optimLength = tourLength(tour)

console.log(`\nNearest-neighbour: ${(nnLength/1000).toFixed(2)} km`)
console.log(`After 2-opt:        ${(optimLength/1000).toFixed(2)} km`)
console.log(`Improvement:        ${((1 - optimLength/nnLength)*100).toFixed(1)} %`)

// ── Output ordered route with actual path geometry per leg ────────────────────
console.log('\n━━━ OPTIMAL ZOO ROUTE ━━━\n')
const steps = tour.map((wpIdx, step) => {
  const s = snapped[wpIdx]
  const legDist = step > 0 ? distMatrix[tour[step-1]][wpIdx] : 0

  // Reconstruct actual walking path for this leg (from prev waypoint to this one)
  let legCoords = []
  if (step > 0) {
    const fromIdx = tour[step - 1]
    const srcNodeId = snapped[fromIdx].nodeId
    const dstNodeId = snapped[wpIdx].nodeId
    legCoords = reconstructPath(prevMatrix[fromIdx], srcNodeId, dstNodeId)
  }

  return {
    step,
    id:         s.wp.id ?? 'entrance',
    nameBg:     s.wp.nameBg,
    nameEn:     s.wp.nameEn ?? 'Main Entrance',
    lat:        s.wp.lat,
    lng:        s.wp.lng,
    legDistM:   Math.round(legDist),
    animalType: s.wp.animalType ?? 'entrance',
    legCoords,  // [[lat,lng], ...] — actual path through graph
  }
})

steps.forEach((s, i) => {
  const leg = i === 0 ? '' : `  (+${s.legDistM} m, ${s.legCoords.length} pts)`
  console.log(`${String(i).padStart(2)}. ${s.nameBg}${leg}`)
})

console.log(`\nTotal walking distance: ${(optimLength/1000).toFixed(2)} km`)

// Build single flat polyline for the whole route (for map display)
const fullPolyline = []
for (const s of steps) {
  if (s.legCoords.length > 0) {
    // Avoid duplicating shared endpoint between legs
    const start = fullPolyline.length > 0 ? 1 : 0
    fullPolyline.push(...s.legCoords.slice(start))
  }
}
console.log(`Full polyline: ${fullPolyline.length} points`)

// ── Save route.json for the app ───────────────────────────────────────────────
const routeJson = {
  totalDistanceM: Math.round(optimLength),
  generatedAt:   new Date().toISOString(),
  fullPolyline,  // [[lat,lng], ...] for the map — full route on actual paths
  steps: steps.map(({ step, id, nameBg, nameEn, lat, lng, legDistM, animalType }) =>
    ({ step, id, nameBg, nameEn, lat, lng, legDistM, animalType })
  )
}

fs.writeFileSync(path.join(DATA, 'route.json'), JSON.stringify(routeJson, null, 2), 'utf8')
console.log('\nSaved → src/data/route.json')
