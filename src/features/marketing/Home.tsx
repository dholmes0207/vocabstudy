import { Navigate, useLocation } from 'react-router-dom'
import { hasUsedApp, isAuthCallback } from '@/lib/entry'
import Landing from './Landing'

/**
 * "/": the landing page for newcomers. Someone who has used the app on this
 * device and opens the site directly goes straight to it — but a click on
 * "Features" or the logo from another public page still shows the landing.
 * An email confirmation link (Supabase redirects to the site root) always
 * continues into the app, fragment and all.
 */
export default function Home() {
  const { key, hash, search } = useLocation()
  if (isAuthCallback(hash, search))
    return <Navigate to={{ pathname: '/home', search, hash }} replace />
  const directVisit = key === 'default' && !hash
  if (directVisit && hasUsedApp(localStorage)) return <Navigate to="/home" replace />
  return <Landing />
}
