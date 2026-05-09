import { createContext, useContext } from 'react'
import { useJsApiLoader } from '@react-google-maps/api'

const MapsContext = createContext({ isLoaded: false, loadError: null })

export function MapsProvider({ children }) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
  })
  return (
    <MapsContext.Provider value={{ isLoaded, loadError }}>
      {children}
    </MapsContext.Provider>
  )
}

export const useMaps = () => useContext(MapsContext)
