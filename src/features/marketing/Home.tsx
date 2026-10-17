import { Navigate, useLocation } from 'react-router-dom'
import { authCallbackPath } from '@/lib/entry'
import Landing from './Landing'

/**
 * "/": the landing page, for everyone — including devices that have used the
 * app (the owner's call, 2026-10-18: the site opens on its introduction, not
 * the app; returning learners get a "Tiếp tục học" button instead). The
 * installed app still starts at /home (manifest start_url). An email link
 * (Supabase falls back to the site root) always continues into the app or the
 * password-reset page, fragment and all.
 */
export default function Home() {
  const { hash, search } = useLocation()
  const callback = authCallbackPath(hash, search)
  if (callback) return <Navigate to={{ pathname: callback, search, hash }} replace />
  return <Landing />
}
