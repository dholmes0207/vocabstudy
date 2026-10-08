import { Suspense, lazy, useEffect } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import ErrorBoundary from './components/ErrorBoundary'
import SkyBackdrop from './components/SkyBackdrop'
import { useData } from './store/dataStore'
import { useSettings } from './store/settingsStore'
import { useAuth } from './store/authStore'

const Dashboard = lazy(() => import('./features/dashboard/Dashboard'))
const Learn = lazy(() => import('./features/learn/Learn'))
const Review = lazy(() => import('./features/review/Review'))
const Quiz = lazy(() => import('./features/quiz/Quiz'))
const Speaking = lazy(() => import('./features/speaking/Speaking'))
const Practice = lazy(() => import('./features/practice/Practice'))
const MatchGame = lazy(() => import('./features/games/MatchGame'))
const OrderGame = lazy(() => import('./features/games/OrderGame'))
const Listen = lazy(() => import('./features/listen/Listen'))
const Sounds = lazy(() => import('./features/sounds/Sounds'))
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
      <SkyBackdrop />
      {/* Last line of defence: a throw in Layout, DataGate or a lazy chunk used
          to unmount everything and leave a blank white page. */}
      <ErrorBoundary>
        <Suspense fallback={<CenterSpinner />}>
          <Routes>
            <Route path="/login" element={<AuthPage />} />
            <Route element={<AppShell />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/learn" element={<Learn />} />
              <Route path="/review" element={<Review />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/speaking" element={<Speaking />} />
              <Route path="/practice" element={<Practice />} />
              <Route path="/games/match" element={<MatchGame />} />
              <Route path="/games/order" element={<OrderGame />} />
              <Route path="/listen" element={<Listen />} />
              <Route path="/sounds" element={<Sounds />} />
              <Route path="/browse" element={<Browse />} />
              <Route path="/stats" element={<Stats />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </ErrorBoundary>
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

/** While a screen or the word pack loads: a tiny constellation drawing itself. */
function CenterSpinner() {
  return (
    <div className="grid min-h-[60vh] place-items-center" role="status">
      <div className="flex flex-col items-center gap-3">
        <svg viewBox="0 0 64 40" className="loader-constellation h-12 w-20" aria-hidden="true">
          <polyline points="6,30 20,12 34,22 48,8 58,26" />
          {[
            [6, 30],
            [20, 12],
            [34, 22],
            [48, 8],
            [58, 26],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="2.4" style={{ animationDelay: `${i * 0.18}s` }} />
          ))}
        </svg>
        <span className="text-sm text-slate-500 dark:text-slate-400">Đang tải…</span>
      </div>
    </div>
  )
}
