import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'

/**
 * `/home?lang=zh` opens the app on that language pack — for the landing page's
 * "or learn Korean / Chinese" links and for links people share
 * (docs/design/languages.md). A code the manifest does not list is ignored.
 * The parameter is then dropped, so a reload or a later visit keeps whatever
 * the learner picks afterwards.
 */
export function useLangParam(): void {
  const [params, setParams] = useSearchParams()
  const manifest = useData((s) => s.manifest)
  const setCurrentLang = useSettings((s) => s.setCurrentLang)
  const wanted = params.get('lang')

  useEffect(() => {
    if (!wanted || !manifest) return
    if (manifest.languages.some((l) => l.code === wanted)) setCurrentLang(wanted)
    const rest = new URLSearchParams(params)
    rest.delete('lang')
    setParams(rest, { replace: true })
  }, [wanted, manifest, params, setParams, setCurrentLang])
}
