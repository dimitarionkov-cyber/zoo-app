import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { DataProvider } from './context/DataContext'
import { MapsProvider } from './context/MapsContext'
import Layout from './components/Layout/Layout'
import HomePage from './pages/HomePage'

const MapPage         = lazy(() => import('./pages/MapPage'))
const AnimalsListPage = lazy(() => import('./pages/AnimalsListPage'))
const AnimalDetailPage = lazy(() => import('./pages/AnimalDetailPage'))
const InfoPage        = lazy(() => import('./pages/InfoPage'))
const SettingsPage    = lazy(() => import('./pages/SettingsPage'))
const TodayPage       = lazy(() => import('./pages/TodayPage'))
const VisitSummaryPage = lazy(() => import('./pages/VisitSummaryPage'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-full text-zoo-brown opacity-50 text-sm">
      Зарежда се…
    </div>
  )
}

export default function App() {
  return (
    <DataProvider>
      <MapsProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="map" element={<MapPage />} />
              <Route path="animals" element={<AnimalsListPage />} />
              <Route path="animals/list" element={<AnimalsListPage />} />
              <Route path="animals/:id" element={<AnimalDetailPage />} />
              <Route path="search" element={<AnimalsListPage />} />
              <Route path="info" element={<InfoPage />} />
              <Route path="today" element={<TodayPage />} />
              <Route path="visited" element={<VisitSummaryPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
      </MapsProvider>
    </DataProvider>
  )
}
