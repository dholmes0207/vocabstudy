import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { initTheme } from './store/settingsStore'
import { hashToPath } from './lib/entry'
import { installErrorReporting } from './lib/reportError'

initTheme()
installErrorReporting()

// The app used hash URLs (vocastudy.app/#/learn) until clean paths replaced
// them; keep every old bookmark and shared link working.
const fromHash = hashToPath(location.hash)
if (fromHash) history.replaceState(null, '', fromHash)

// Offline support (src/lib/swRoute.test.ts covers the routing rules). Only in
// production builds: in dev a worker would sit in front of Vite's HMR and make
// every reload lie about what changed. Registration failures are ignored — an
// older browser simply keeps the online-only behaviour it has today.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {})
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
