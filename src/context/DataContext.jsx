import { createContext, useContext, useState, useEffect, useMemo } from 'react'
import staticAnimals from '../data/animals.json'
import staticPois from '../data/pois.json'

const DataContext = createContext(null)

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) ?? JSON.stringify(fallback)) }
  catch { return fallback }
}

const THEME_VARS = {
  light: {
    '--color-zoo-sand':        '#f5f0e8',
    '--color-zoo-bark':        '#d4b896',
    '--color-zoo-brown':       '#8b5e3c',
    '--color-zoo-green':       '#3a6b35',
    '--color-zoo-green-light': '#5a9e52',
    '--color-bg-card':         '#ffffff',
    '--color-bg-base':         '#f5f0e8',
    '--color-text-main':       '#1a1a1a',
    '--color-border':          '#d4b896',
  },
  dark: {
    '--color-zoo-sand':        '#1c1f2e',
    '--color-zoo-bark':        '#3d4052',
    '--color-zoo-brown':       '#e8ddd0',
    '--color-zoo-green':       '#7bc876',
    '--color-zoo-green-light': '#9de098',
    '--color-bg-card':         '#252836',
    '--color-bg-base':         '#1c1f2e',
    '--color-text-main':       '#f0ede8',
    '--color-border':          '#3d4052',
  },
}

function applyTheme(dark) {
  const vars = dark ? THEME_VARS.dark : THEME_VARS.light
  // Inject as an unlayered <style> tag — unlayered rules beat @layer theme
  // in the CSS cascade, so this reliably overrides Tailwind v4's @theme values.
  let el = document.getElementById('zoo-theme')
  if (!el) {
    el = document.createElement('style')
    el.id = 'zoo-theme'
    document.head.appendChild(el)
  }
  const decls = Object.entries(vars).map(([k, v]) => `  ${k}: ${v};`).join('\n')
  el.textContent = `:root {\n${decls}\n}`
  // data-theme attribute for CSS selector-based theming
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
}

export function DataProvider({ children }) {
  const [coordOverrides, setCoordOverrides] = useState(() => load('zoo_coord_overrides', {}))
  const [customAnimals,  setCustomAnimals]  = useState(() => load('zoo_custom_animals', []))
  const [customPois,     setCustomPois]     = useState(() => load('zoo_custom_pois', []))
  const [darkMode,       setDarkMode]       = useState(() => load('zoo_dark_mode', false))
  const [favoriteIds,    setFavoriteIds]    = useState(() => load('zoo_favorites', []))
  const [visited,        setVisited]        = useState(() => load('zoo_visited', {})) // { [animalId]: isoTimestamp }

  useEffect(() => { localStorage.setItem('zoo_coord_overrides', JSON.stringify(coordOverrides)) }, [coordOverrides])
  useEffect(() => { localStorage.setItem('zoo_custom_animals',  JSON.stringify(customAnimals))  }, [customAnimals])
  useEffect(() => { localStorage.setItem('zoo_custom_pois',     JSON.stringify(customPois))     }, [customPois])
  useEffect(() => { localStorage.setItem('zoo_favorites',       JSON.stringify(favoriteIds))    }, [favoriteIds])
  useEffect(() => { localStorage.setItem('zoo_visited',         JSON.stringify(visited))        }, [visited])
  // Apply theme vars on mount (restores saved preference before first paint)
  useState(() => applyTheme(load('zoo_dark_mode', false)))

  useEffect(() => {
    localStorage.setItem('zoo_dark_mode', JSON.stringify(darkMode))
    applyTheme(darkMode)
  }, [darkMode])

  const allAnimals = useMemo(() =>
    [...staticAnimals, ...customAnimals].map(a =>
      coordOverrides[a.id] ? { ...a, ...coordOverrides[a.id] } : a
    ),
    [coordOverrides, customAnimals]
  )

  const allPois = useMemo(() => [...staticPois, ...customPois], [customPois])

  function updateCoordinates(id, lat, lng) {
    setCoordOverrides(prev => ({ ...prev, [id]: { lat: parseFloat(lat), lng: parseFloat(lng) } }))
  }

  function addAnimal(data) {
    setCustomAnimals(prev => [...prev, {
      photo: null, description: '',
      ...data,
      id: `custom_${Date.now()}`,
      lat: parseFloat(data.lat),
      lng: parseFloat(data.lng),
    }])
  }

  function addPoi(data) {
    setCustomPois(prev => [...prev, {
      ...data,
      id: `custom_poi_${Date.now()}`,
      lat: parseFloat(data.lat),
      lng: parseFloat(data.lng),
    }])
  }

  function exportAnimalsJSON() {
    return JSON.stringify(allAnimals, null, 2)
  }

  function toggleFavorite(id) {
    setFavoriteIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }
  function isFavorite(id) {
    return favoriteIds.includes(id)
  }

  function toggleVisited(id) {
    setVisited(prev => {
      if (prev[id]) {
        const { [id]: _omit, ...rest } = prev
        return rest
      }
      return { ...prev, [id]: new Date().toISOString() }
    })
  }
  function isVisited(id) {
    return Boolean(visited[id])
  }

  return (
    <DataContext.Provider value={{
      allAnimals, allPois,
      coordOverrides, updateCoordinates,
      addAnimal, addPoi,
      darkMode, setDarkMode,
      exportAnimalsJSON,
      favoriteIds, toggleFavorite, isFavorite,
      visited, toggleVisited, isVisited,
    }}>
      {children}
    </DataContext.Provider>
  )
}

export const useData = () => useContext(DataContext)
