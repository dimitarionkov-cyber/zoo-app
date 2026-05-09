import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { DataProvider } from './context/DataContext'
import Layout from './components/Layout/Layout'
import HomePage from './pages/HomePage'
import MapPage from './pages/MapPage'
import AnimalsHubPage from './pages/AnimalsHubPage'
import AnimalDetailPage from './pages/AnimalDetailPage'
import SearchPage from './pages/SearchPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="map" element={<MapPage />} />
            <Route path="animals" element={<AnimalsHubPage />} />
            <Route path="animals/:id" element={<AnimalDetailPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </DataProvider>
  )
}
