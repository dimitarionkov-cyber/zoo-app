import { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react'
import staticAnimals from '../data/animals.json'
import staticPois from '../data/pois.json'
import { supabase } from '../lib/supabase'

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
  const [activeVisit,    setActiveVisit]    = useState(() => load('zoo_active_visit', null)) // { startedAt } | null
  const [lastVisit,      setLastVisit]      = useState(() => load('zoo_last_visit', null))   // { startedAt, endedAt } | null

  useEffect(() => { localStorage.setItem('zoo_coord_overrides', JSON.stringify(coordOverrides)) }, [coordOverrides])
  useEffect(() => { localStorage.setItem('zoo_custom_animals',  JSON.stringify(customAnimals))  }, [customAnimals])
  useEffect(() => { localStorage.setItem('zoo_custom_pois',     JSON.stringify(customPois))     }, [customPois])
  useEffect(() => { localStorage.setItem('zoo_favorites',       JSON.stringify(favoriteIds))    }, [favoriteIds])
  useEffect(() => { localStorage.setItem('zoo_visited',         JSON.stringify(visited))        }, [visited])
  useEffect(() => { localStorage.setItem('zoo_active_visit',    JSON.stringify(activeVisit))    }, [activeVisit])
  useEffect(() => { localStorage.setItem('zoo_last_visit',      JSON.stringify(lastVisit))      }, [lastVisit])
  // Apply theme vars on mount (restores saved preference before first paint)
  useState(() => applyTheme(load('zoo_dark_mode', false)))

  useEffect(() => {
    localStorage.setItem('zoo_dark_mode', JSON.stringify(darkMode))
    applyTheme(darkMode)
  }, [darkMode])

  // ── Cloud sync (Supabase) — no forced account, just an anonymous device ──
  // session by default, upgradeable to an email so progress survives a
  // cleared cache / new device. See supabase/schema.sql for the table.
  const [session,    setSession]    = useState(null)
  const [syncStatus, setSyncStatus] = useState('idle') // idle | syncing | error
  // Real state, not a ref — flipping it must re-trigger the push-effect below
  // even if favorites/visited didn't themselves change during the merge
  // (e.g. connecting to a brand-new empty remote row with existing local data).
  const [hasMerged, setHasMerged] = useState(false)
  const prevUserIdRef = useRef(null)

  // Establish a session — reuse an existing one, or sign in anonymously.
  useEffect(() => {
    let cancelled = false

    supabase.auth.getSession().then(({ data: { session: existing } }) => {
      if (cancelled) return
      if (existing) { setSession(existing); return }
      supabase.auth.signInAnonymously().then(({ error }) => {
        if (error) console.error('Supabase anonymous sign-in failed', error)
      })
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (cancelled) return
      const newId = newSession?.user?.id ?? null
      // A different user just signed in (e.g. clicked a magic link) — the
      // next merge should pull their remote data in fresh. A same-user
      // event (like a periodic token refresh) shouldn't re-trigger it.
      if (newId !== prevUserIdRef.current) {
        setHasMerged(false)
        prevUserIdRef.current = newId
      }
      setSession(newSession)
    })

    return () => { cancelled = true; subscription.unsubscribe() }
  }, [])

  // Pull remote progress in and merge it with whatever's already local,
  // once per signed-in user (anonymous or linked).
  useEffect(() => {
    if (!session?.user || hasMerged) return
    let cancelled = false

    setSyncStatus('syncing')
    supabase
      .from('zoo_progress')
      .select('favorites, visited, active_visit, last_visit')
      .eq('id', session.user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) { setSyncStatus('error'); return }
        if (data) {
          setFavoriteIds(prev => Array.from(new Set([...prev, ...(data.favorites || [])])))
          setVisited(prev => {
            const merged = { ...prev }
            for (const [id, ts] of Object.entries(data.visited || {})) {
              if (!merged[id] || new Date(ts) > new Date(merged[id])) merged[id] = ts
            }
            return merged
          })
          setActiveVisit(prev => prev ?? data.active_visit ?? null)
          setLastVisit(prev => {
            if (!data.last_visit) return prev
            if (!prev) return data.last_visit
            return new Date(data.last_visit.endedAt) > new Date(prev.endedAt) ? data.last_visit : prev
          })
        }
        setHasMerged(true)
        setSyncStatus('idle')
      })

    return () => { cancelled = true }
  }, [session?.user?.id, hasMerged])

  // Push local progress up after every change, once the initial merge is done.
  // hasMerged is in the deps deliberately: completing the merge (even with no
  // local-state changes, e.g. an empty remote row) must still push once.
  useEffect(() => {
    if (!session?.user || !hasMerged) return
    const id = setTimeout(() => {
      supabase.from('zoo_progress').upsert({
        id: session.user.id,
        favorites: favoriteIds,
        visited,
        active_visit: activeVisit,
        last_visit: lastVisit,
      }).then(({ error }) => {
        if (error) { console.error('Supabase sync failed', error); setSyncStatus('error') }
      })
    }, 800)
    return () => clearTimeout(id)
  }, [session?.user?.id, hasMerged, favoriteIds, visited, activeVisit, lastVisit])

  const isLinked  = Boolean(session?.user && !session.user.is_anonymous)
  const userEmail = session?.user?.email ?? null

  // Link this device's progress to an email (or, if that email already has
  // linked progress elsewhere, sign into it instead) — either way a magic
  // link is emailed, and clicking it finishes the process.
  async function saveProgress(email) {
    const { error } = await supabase.auth.updateUser({ email }, { emailRedirectTo: window.location.origin })
    if (error) {
      const { error: otpError } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } })
      if (otpError) throw otpError
    }
  }

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
        // Seen on an earlier visit, not yet during this active one — a tap means
        // "mark as seen now", not "unmark". Only a second tap within the same
        // active visit should actually remove it.
        if (activeVisit && prev[id] < activeVisit.startedAt) {
          return { ...prev, [id]: new Date().toISOString() }
        }
        const { [id]: _omit, ...rest } = prev
        return rest
      }
      return { ...prev, [id]: new Date().toISOString() }
    })
  }
  function isVisited(id) {
    return Boolean(visited[id])
  }

  function startVisit() {
    setLastVisit(null)
    setActiveVisit({ startedAt: new Date().toISOString() })
  }
  function endVisit() {
    if (!activeVisit) return
    setLastVisit({ startedAt: activeVisit.startedAt, endedAt: new Date().toISOString() })
    setActiveVisit(null)
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
      activeVisit, lastVisit, startVisit, endVisit,
      isLinked, userEmail, syncStatus, saveProgress,
    }}>
      {children}
    </DataContext.Provider>
  )
}

export const useData = () => useContext(DataContext)
