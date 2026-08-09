import { Suspense, lazy, useEffect } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import Layout from './components/Layout'
import { useData } from './store/dataStore'
import { useSettings } from './store/settingsStore'
import { useAuth } from './store/authStore'

const Dashboard = lazy(() => import('./features/dashboard/Dashboard'))
const Learn = lazy(() => import('./features/learn/Learn'))
const Review = lazy(() => import('./features/review/Review'))
const Quiz = lazy(() => import('./features/quiz/Quiz'))
const Speaking = lazy(() => import('./features/speaking/Speaking'))
const Browse = lazy(() => import('./features/browse/Browse'))
const Stats = lazy(() => import('./features/stats/Stats'))
const SettingsPage = lazy(() => import('./features/settings/SettingsPage'))
const AuthPage = lazy(() => import('./features/auth/AuthPage'))
const AdminPage = lazy(() => import('./features/admin/AdminPage'))

export default function App() {
  // Restore the session (HttpOnly cookie) on startup.
  useEffect(() => {
    useAuth.getState().bootstrap()
  }, [])

  return (
    <HashRouter>
      <Suspense fallback={<CenterSpinner />}>
        <Routes>
          <Route path="/login" element={<AuthPage />} />
          <Route element={<AppShell />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/review" element={<Review />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/speaking" element={<Speaking />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </HashRouter>
  )
}

/** Data-loading gate + app chrome (Layout) for all main routes. */
function AppShell() {
  return (
    <DataGate>
      <Layout />
    </DataGate>
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
