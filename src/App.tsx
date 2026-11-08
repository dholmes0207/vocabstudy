import { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import ErrorBoundary from './components/ErrorBoundary'
import { CenterSpinner } from './components/DataGate'
import SkyBackdrop from './components/SkyBackdrop'
import CompleteProfile from './components/CompleteProfile'
import FeedbackDialog from './components/FeedbackDialog'
import { useAuth } from './store/authStore'
import { useSettings } from './store/settingsStore'

const loadDashboard = () => import('./features/dashboard/Dashboard')
const Dashboard = lazy(loadDashboard)
// A returning learner opens /home. Its code would otherwise only be fetched once
// the language pack is ready; start both together.
if (typeof location !== 'undefined' && location.pathname === '/home') void loadDashboard()
const Learn = lazy(() => import('./features/learn/Learn'))
const Review = lazy(() => import('./features/review/Review'))
const Quiz = lazy(() => import('./features/quiz/Quiz'))
const Speaking = lazy(() => import('./features/speaking/Speaking'))
const Practice = lazy(() => import('./features/practice/Practice'))
const MatchGame = lazy(() => import('./features/games/MatchGame'))
const OrderGame = lazy(() => import('./features/games/OrderGame'))
const BlitzGame = lazy(() => import('./features/games/BlitzGame'))
const Listen = lazy(() => import('./features/listen/Listen'))
const Sounds = lazy(() => import('./features/sounds/Sounds'))
const Phrases = lazy(() => import('./features/phrases/Phrases'))
const Topics = lazy(() => import('./features/topics/Topics'))
const Grammar = lazy(() => import('./features/grammar/Grammar'))
const Dictation = lazy(() => import('./features/dictation/Dictation'))
const Reading = lazy(() => import('./features/reading/Reading'))
const Hangul = lazy(() => import('./features/hangul/Hangul'))
const Pinyin = lazy(() => import('./features/pinyin/Pinyin'))
const MeasureWords = lazy(() => import('./features/measure/MeasureWords'))
const Confusables = lazy(() => import('./features/confusables/Confusables'))
const Chengyu = lazy(() => import('./features/chengyu/Chengyu'))
const Hskk = lazy(() => import('./features/hskk/Hskk'))
const NetSlang = lazy(() => import('./features/slang/NetSlang'))
const PhrasalVerbs = lazy(() => import('./features/phrasal/PhrasalVerbs'))
const Idioms = lazy(() => import('./features/idioms/Idioms'))
const Roleplay = lazy(() => import('./features/roleplay/Roleplay'))
const HanVietTable = lazy(() => import('./features/hanviet/HanVietTable'))
const Radicals = lazy(() => import('./features/radicals/Radicals'))
const Toeic = lazy(() => import('./features/toeic/Toeic'))
const ToeicSpeaking = lazy(() => import('./features/toeic/ToeicSpeaking'))
const Ielts = lazy(() => import('./features/ielts/Ielts'))
const Patterns = lazy(() => import('./features/patterns/Patterns'))
const Hsk = lazy(() => import('./features/hsk/Hsk'))
const Challenge = lazy(() => import('./features/challenge/Challenge'))
const Numbers = lazy(() => import('./features/numbers/Numbers'))
const Placement = lazy(() => import('./features/placement/Placement'))
const Exam = lazy(() => import('./features/exam/Exam'))
const LearningPath = lazy(() => import('./features/path/LearningPath'))
const Browse = lazy(() => import('./features/browse/Browse'))
const Stats = lazy(() => import('./features/stats/Stats'))
const SettingsPage = lazy(() => import('./features/settings/SettingsPage'))
const AuthPage = lazy(() => import('./features/auth/AuthPage'))
const ResetPassword = lazy(() => import('./features/auth/ResetPassword'))
const AdminPage = lazy(() => import('./features/admin/AdminPage'))
const MarketingLayout = lazy(() => import('./features/marketing/MarketingLayout'))
const MarketingHome = lazy(() => import('./features/marketing/Home'))
const Landing = lazy(() => import('./features/marketing/Landing'))
const About = lazy(() => import('./features/marketing/About'))
const Changelog = lazy(() => import('./features/marketing/Changelog'))
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
      <CompleteProfile />
      <FeedbackDialog />
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
              <Route path="/changelog" element={<Changelog />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
            </Route>
            <Route path="/login" element={<AuthPage />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route element={<Layout />}>
              <Route path="/home" element={<Dashboard />} />
              <Route path="/path" element={<LearningPath />} />
              <Route path="/learn" element={<Learn />} />
              <Route path="/placement" element={<Placement />} />
              <Route path="/review" element={<Review />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/speaking" element={<Speaking />} />
              <Route path="/practice" element={<Practice />} />
              <Route path="/games/match" element={<MatchGame />} />
              <Route path="/games/order" element={<OrderGame />} />
              <Route path="/games/blitz" element={<BlitzGame />} />
              <Route path="/listen" element={<Listen />} />
              <Route path="/sounds" element={<Sounds />} />
              <Route path="/phrases" element={<Phrases />} />
              <Route path="/topics" element={<Topics />} />
              <Route path="/exam" element={<Exam />} />
              <Route path="/toeic" element={<Toeic />} />
              <Route path="/toeic-speaking" element={<ToeicSpeaking />} />
              <Route path="/ielts" element={<Ielts />} />
              <Route path="/patterns" element={<Patterns />} />
              <Route path="/hsk" element={<Hsk />} />
              <Route path="/challenge" element={<Challenge />} />
              <Route path="/grammar" element={<Grammar />} />
              <Route path="/dictation" element={<Dictation />} />
              <Route path="/reading" element={<Reading />} />
              <Route path="/reading/:storyId" element={<Reading />} />
              <Route path="/hangul" element={<Hangul />} />
              <Route path="/pinyin" element={<Pinyin />} />
              <Route path="/measure-words" element={<MeasureWords />} />
              <Route path="/confusables" element={<Confusables />} />
              <Route path="/chengyu" element={<Chengyu />} />
              <Route path="/hskk" element={<Hskk />} />
              <Route path="/slang" element={<NetSlang />} />
              <Route path="/phrasal-verbs" element={<PhrasalVerbs />} />
              <Route path="/idioms" element={<Idioms />} />
              <Route path="/roleplay" element={<Roleplay />} />
              <Route path="/han-viet" element={<HanVietTable />} />
              <Route path="/radicals" element={<Radicals />} />
              <Route path="/numbers" element={<Numbers />} />
              <Route path="/grammar/:unitId" element={<Grammar />} />
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
