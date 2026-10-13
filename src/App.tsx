import { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
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
const Phrases = lazy(() => import('./features/phrases/Phrases'))
const Browse = lazy(() => import('./features/browse/Browse'))
const Stats = lazy(() => import('./features/stats/Stats'))
const SettingsPage = lazy(() => import('./features/settings/SettingsPage'))
const AuthPage = lazy(() => import('./features/auth/AuthPage'))
const AdminPage = lazy(() => import('./features/admin/AdminPage'))
const MarketingLayout = lazy(() => import('./features/marketing/MarketingLayout'))
const MarketingHome = lazy(() => import('./features/marketing/Home'))
const Landing = lazy(() => import('./features/marketing/Landing'))
const About = lazy(() => import('./features/marketing/About'))
const Privacy = lazy(() =>
  import('./features/marketing/LegalPage').then((m) => ({ default: m.Privacy }))
)
const Terms = lazy(() =>
  import('./features/marketing/LegalPage').then((m) => ({ default: m.Terms }))
)

export default function App() {
  // Restore the session (HttpOnly cookie) on startup.
  useEffect(() => {
    useAuth.getState().bootstrap()
  }, [])

  // Screen readers and spell-check follow the interface language (each page
  // sets its own tab title).
  const uiLang = useSettings((s) => s.uiLang)
  useEffect(() => {
    document.documentElement.lang = uiLang
  }, [uiLang])

  return (
    <BrowserRouter>
      <SkyBackdrop />
      {/* Last line of defence: a throw in Layout, DataGate or a lazy chunk used
          to unmount everything and leave a blank white page. */}
      <ErrorBoundary>
        <Suspense fallback={<CenterSpinner />}>
          <Routes>
            {/* Public pages: landing, about, legal (docs/design/landing.md). */}
            <Route element={<MarketingLayout />}>
              <Route path="/" element={<MarketingHome />} />
              <Route path="/welcome" element={<Landing />} />
              <Route path="/about" element={<About />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
            </Route>
            <Route path="/login" element={<AuthPage />} />
            <Route element={<Layout />}>
              <Route path="/home" element={<Dashboard />} />
              <Route path="/learn" element={<Learn />} />
              <Route path="/review" element={<Review />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/speaking" element={<Speaking />} />
              <Route path="/practice" element={<Practice />} />
              <Route path="/games/match" element={<MatchGame />} />
              <Route path="/games/order" element={<OrderGame />} />
              <Route path="/listen" element={<Listen />} />
              <Route path="/sounds" element={<Sounds />} />
              <Route path="/phrases" element={<Phrases />} />
              <Route path="/phrases/:topicId" element={<Phrases />} />
              <Route path="/browse" element={<Browse />} />
              <Route path="/stats" element={<Stats />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  )
}
