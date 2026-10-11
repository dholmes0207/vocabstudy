import { Suspense, lazy, useEffect } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import ErrorBoundary from './components/ErrorBoundary'
import { CenterSpinner } from './components/DataGate'
import SkyBackdrop from './components/SkyBackdrop'
import { useAuth } from './store/authStore'
import { useSettings } from './store/settingsStore'

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

  // Screen readers, spell-check and the tab title follow the interface language.
  const uiLang = useSettings((s) => s.uiLang)
  useEffect(() => {
    document.documentElement.lang = uiLang
    document.title =
      uiLang === 'vi' ? 'VocaStudy · Học từ vựng tiếng Anh' : 'VocaStudy · Learn English vocabulary'
  }, [uiLang])

  return (
    <HashRouter>
      <SkyBackdrop />
      {/* Last line of defence: a throw in Layout, DataGate or a lazy chunk used
          to unmount everything and leave a blank white page. */}
      <ErrorBoundary>
        <Suspense fallback={<CenterSpinner />}>
          <Routes>
            <Route path="/login" element={<AuthPage />} />
            <Route element={<Layout />}>
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
