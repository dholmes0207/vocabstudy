import { Suspense, lazy, useEffect } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import Layout from './components/Layout'
import { useData } from './store/dataStore'
import { useSettings } from './store/settingsStore'

const Dashboard = lazy(() => import('./features/dashboard/Dashboard'))
const Learn = lazy(() => import('./features/learn/Learn'))
const Review = lazy(() => import('./features/review/Review'))
const Quiz = lazy(() => import('./features/quiz/Quiz'))
const Browse = lazy(() => import('./features/browse/Browse'))
const Stats = lazy(() => import('./features/stats/Stats'))
const Tutor = lazy(() => import('./features/tutor/Tutor'))
const SettingsPage = lazy(() => import('./features/settings/SettingsPage'))

export default function App() {
  return (
    <HashRouter>
      <DataGate>
        <Suspense fallback={<CenterSpinner />}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/learn" element={<Learn />} />
              <Route path="/review" element={<Review />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/browse" element={<Browse />} />
              <Route path="/tutor" element={<Tutor />} />
              <Route path="/stats" element={<Stats />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </DataGate>
    </HashRouter>
  )
}

/** Ensures the manifest and the active language pack are loaded before children render. */
function DataGate({ children }: { children: React.ReactNode }) {
  const currentLang = useSettings((s) => s.currentLang)
  const { manifest, pack, status, error, ensureManifest, loadLanguage } = useData()

  useEffect(() => {
    ensureManifest()
  }, [ensureManifest])

  useEffect(() => {
    loadLanguage(currentLang)
  }, [currentLang, loadLanguage])

  if (status === 'error') {
    return (
      <div className="grid min-h-[100dvh] place-items-center p-6 text-center">
        <div className="card max-w-md p-8">
          <p className="text-4xl">😕</p>
          <h1 className="mt-3 text-lg font-bold">Không tải được dữ liệu</h1>
          <p className="mt-2 text-sm text-slate-500">{error}</p>
          <button className="btn-primary mt-5" onClick={() => location.reload()}>
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  if (!manifest || !pack || status !== 'ready') {
    return <CenterSpinner />
  }

  return <>{children}</>
}

function CenterSpinner() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
    </div>
  )
}
