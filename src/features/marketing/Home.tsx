import { Navigate, useLocation } from 'react-router-dom'
import { authCallbackPath, hasUsedApp } from '@/lib/entry'
import Landing from './Landing'

/**
 * "/": the landing page for newcomers. Someone who has used the app on this
 * device and opens the site directly goes straight to it — but a click on
 * "Features" or the logo from another public page still shows the landing.
 * An email link (Supabase falls back to the site root) always continues into
 * the app or the password-reset page, fragment and all.
 */
export default function Home() {
  const { key, hash, search } = useLocation()
  const callback = authCallbackPath(hash, search)
  if (callback) return <Navigate to={{ pathname: callback, search, hash }} replace />
  const directVisit = key === 'default' && !hash
  if (directVisit && hasUsedApp(localStorage)) return <Navigate to="/home" replace />
  return <Landing />
}
