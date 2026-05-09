/**
 * Adds a `continents` array field to every animal in animals.json
 * based on species name lookup.
 */
const fs = require('fs')
const path = require('path')

const DATA = path.join(__dirname, '..', 'src', 'data')
const animals = JSON.parse(fs.readFileSync(path.join(DATA, 'animals.json'), 'utf8'))

// Species prefix → continent codes
// Ordered longest-first so more-specific prefixes win
const SPECIES_MAP = [
  // ── Birds ──────────────────────────────────────────────────────────────
  ['Dromaius novaehollandiae',       ['australia']],
  ['Aix galericulata',               ['asia']],
  ['Nymphicus hollandicus',          ['australia']],
  ['Corvus corax',                   ['europe', 'asia', 'north_america']],
  ['Corvus corone',                  ['europe', 'asia']],
  ['Bubo bubo',                      ['europe', 'asia']],
  ['Bubo scandiacus',                ['europe', 'asia', 'north_america']],
  ['Accipiter gentilis',             ['europe', 'asia', 'north_america']],
  ['Parabuteo unicinctus',           ['north_america', 'south_america']],
  ['Gyps fulvus',                    ['europe', 'asia', 'africa']],
  ['Neophron percnopterus',          ['europe', 'asia', 'africa']],
  ['Aegypius monachus',              ['europe', 'asia']],
  ['Ara ararauna',                   ['south_america']],
  ['Callonetta leucophrys',          ['south_america']],
  ['Cygnus atratus',                 ['australia']],
  ['Cygnus olor',                    ['europe', 'asia']],
  ['Cygnus cygnus',                  ['europe', 'asia']],
  ['Pelecanus crispus',              ['europe', 'asia']],
  ['Pelecanus onocrotalus',          ['europe', 'asia', 'africa']],
  ['Branta leucopsis',               ['europe', 'north_america']],
  ['Chloephaga picta',               ['south_america']],
  ['Anas platyrhynchos',             ['europe', 'asia', 'north_america']],
  ['Dacelo novaeguineae',            ['australia']],
  ['Psittacus erithacus',            ['africa']],
  ['Melopsittacus undulatus',        ['australia']],
  ['Falco naumanni',                 ['europe', 'asia', 'africa']],
  ['Pteroglossus viridis',           ['south_america']],
  ['Eudocimus ruber',                ['south_america']],
  ['Strix aluco',                    ['europe', 'asia']],
  ['Ciconia ciconia',                ['europe', 'asia', 'africa']],
  ['Streptopelia roseogrisea',       ['africa']],
  ['Bycanistes bucinator',           ['africa']],
  ['Bycanistes subcylindricus',      ['africa']],
  ['Neochen jubata',                 ['south_america']],
  ['Lophura nycthemera',             ['asia']],
  ['Columba livia',                  ['europe', 'asia', 'africa']],
  ['Chrysolophus pictus',            ['asia']],
  ['Lophura swinhoii',               ['asia']],
  ['Pavo cristatus',                 ['asia']],
  // ── Mammals ────────────────────────────────────────────────────────────
  ['Canis aureus',                   ['europe', 'asia', 'africa']],
  ['Canis lupus',                    ['europe', 'asia', 'north_america']],
  ['Equus asinus',                   ['europe', 'africa']],
  ['Equus ferus caballus',           ['europe']],
  ['Ovis aries',                     ['europe', 'asia']],
  ['Ammotragus lervia',              ['africa']],
  ['Macropus rufus',                 ['australia']],
  ['Capra aegagrus hircus',          ['africa']],
  ['Symphalangus syndactylus',       ['asia']],
  ['Hyaena hyaena',                  ['africa', 'asia']],
  ['Lama glama',                     ['south_america']],
  ['Potamochoerus porcus',           ['africa']],
  ['Bos grunniens',                  ['asia']],
  ['Panthera tigris altaica',        ['asia']],
  ['Panthera tigris tigris',         ['asia']],
  ['Panthera tigris',                ['asia']],
  ['Panthera onca',                  ['south_america', 'north_america']],
  ['Panthera uncia',                 ['asia']],
  ['Panthera pardus',                ['asia', 'africa']],
  ['Panthera leo',                   ['africa']],
  ['Myocastor coypus',               ['south_america']],
  ['Meles meles',                    ['europe', 'asia']],
  ['Leptailurus serval',             ['africa']],
  ['Lynx rufus',                     ['north_america']],
  ['Lynx lynx',                      ['europe', 'asia']],
  ['Procyon lotor',                  ['north_america']],
  ['Nasua nasua',                    ['south_america']],
  ['Ichneumia albicauda',            ['africa']],
  ['Mungos mungo',                   ['africa']],
  ['Hystrix cristata',               ['africa']],
  ['Mustela putorius',               ['europe']],
  ['Melursus ursinus',               ['asia']],
  ['Ursus arctos horribilis',        ['north_america']],
  ['Ursus arctos',                   ['europe', 'asia']],
  ['Mephitis mephitis',              ['north_america']],
  ['Aonyx cinereus',                 ['asia']],
  ['Suricata suricatta',             ['africa']],
  ['Neovison vison',                 ['north_america']],
  ['Sus scrofa',                     ['europe', 'asia']],
  ['Chinchilla lanigera',            ['south_america']],
  ['Didelphis marsupialis',          ['south_america', 'north_america']],
  ['Potos flavus',                   ['south_america', 'north_america']],
  ['Mephitis mephitis',              ['north_america']],
  // ── Reptiles ───────────────────────────────────────────────────────────
  ['Trachemys scripta',              ['north_america']],
  ['Testudo graeca',                 ['europe', 'asia', 'africa']],
  ['Alligator mississippiensis',     ['north_america']],
  ['Chelonoidis carbonarius',        ['south_america']],
  ['Cuora amboinensis',              ['asia']],
  ['Boa constrictor imperator',      ['north_america', 'south_america']],
  ['Boa constrictor',                ['south_america']],
  ['Lampropeltis triangulum',        ['north_america', 'south_america']],
  ['Lampropeltis getula',            ['north_america']],
  ['Lampropeltis zonata',            ['north_america']],
  ['Basiliscus plumifrons',          ['north_america', 'south_america']],
  ['Correlophus ciliatus',           ['australia']],
  ['Chilabothrus angulifer',         ['north_america']],
  ['Morelia viridis',                ['australia', 'asia']],
  ['Morelia amethistina',            ['australia', 'asia']],
  ['Pantherophis guttatus',          ['north_america']],
  ['Python regius',                  ['africa']],
  ['Python molurus',                 ['asia']],
  ['Python bivittatus',              ['asia']],
  ['Malayopython reticulatus',       ['asia']],
  ['Achatina achatina',              ['africa']],
  ['Stigmochelys pardalis',          ['africa']],
  ['Gekko vittatus',                 ['asia']],
  ['Gekko gecko',                    ['asia']],
  ['Gekko badenii',                  ['asia']],
  ['Chamaeleo calyptratus',          ['asia']],
  ['Paroedura picta',                ['africa']],
  ['Epicrates cenchria',             ['south_america']],
  ['Acrantophis dumerili',           ['africa']],
  ['Iguana iguana',                  ['south_america', 'north_america']],
  ['Varanus cumingi',                ['asia']],
  ['Varanus exanthematicus',         ['africa']],
  ['Pogona vitticeps',               ['australia']],
  ['Dermochelys coriacea',           ['europe', 'asia', 'africa', 'north_america', 'south_america', 'australia']],
  // ── Fish ───────────────────────────────────────────────────────────────
  ['Hydrolycus scomberoides',        ['south_america']],
  ['Pterygoplichthys',               ['south_america']],
  ['Abramites hypselonotus',         ['south_america']],
  ['Myloplus rubripinnis',           ['south_america']],
  ['Pangasius',                      ['asia']],
  ['Phractocephalus hemioliopterus', ['south_america']],
  ['Colossoma macropomum',           ['south_america']],
  ['Pelvicachromis pulcher',         ['africa']],
  ['Moenkhausia ceros',              ['south_america']],
  ['Callichthys callichthys',        ['south_america']],
  ['Hoplosternum thoracatum',        ['south_america']],
  ['Hemigrammus rubrostriatus',      ['south_america']],
  ['Pygocentrus nattereri',          ['south_america']],
  ['Ivanacara adoketa',              ['south_america']],
  ['Protopterus annectens',          ['africa']],
  ['Amphiprion',                     ['asia']],
  ['Gymnocorymbus ternetzi',         ['south_america']],
  ['Amphilophus labiatus',           ['north_america']],
  ['Nannostomus mortenthaleri',      ['south_america']],
  ['Xiphophorus maculatus',          ['north_america', 'south_america']],
  ['Mystus',                         ['asia']],
  ['Amatitlania nigrofasciata',      ['north_america']],
  ['Dawkinsia filamentosa',          ['asia']],
  ['Anguilla anguilla',              ['europe']],
  ['Pterophyllum scalare',           ['south_america']],
  ['Ancistrus',                      ['south_america']],
  ['Hyphessobrycon bentosi',         ['south_america']],
  ['Corydoras aeneus',               ['south_america']],
  ['Tropheus moorii',                ['africa']],
  ['Melanochromis cyaneorhabdos',    ['africa']],
  ['Sciaenochromis fryeri',          ['africa']],
  ['Maylandia estherae',             ['africa']],
  ['Nematobrycon palmeri',           ['south_america']],
  ['Puntigrus tetrazona',            ['asia']],
]

function getContinents(species) {
  if (!species) return []
  // Handle semicolon-separated multi-species (fish tanks)
  const allSpecies = species.split(';').map(s => s.trim())
  const result = new Set()
  for (const sp of allSpecies) {
    for (const [prefix, continents] of SPECIES_MAP) {
      if (sp.startsWith(prefix)) {
        continents.forEach(c => result.add(c))
        break
      }
    }
  }
  return [...result]
}

let mapped = 0, unmapped = 0
const updated = animals.map(a => {
  const continents = getContinents(a.species)
  if (continents.length > 0) mapped++
  else { unmapped++; console.warn(`No continent for: ${a.nameBg} (${a.species})`) }
  return { ...a, continents }
})

console.log(`\nMapped: ${mapped}  |  Unmapped: ${unmapped}  |  Total: ${updated.length}`)

const enc = new TextEncoder ? null : null  // Node built-in
fs.writeFileSync(
  path.join(DATA, 'animals.json'),
  JSON.stringify(updated, null, 2),
  { encoding: 'utf8' }
)
console.log('Saved animals.json with continents field.')
