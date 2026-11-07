import { Pause, Play } from 'lucide-react'
import { useT } from '@/lib/i18n'

/** Play / stop for a recording played by useLinesPlayer, with "Playing 3/10". */
export default function PlayLinesButton({
  line,
  plays,
  total,
  play,
  stop,
}: {
  line: number | null
  plays: number
  total: number
  play: () => void
  stop: () => void
}) {
  const t = useT()
  return (
    <button type="button" onClick={line === null ? play : stop} className="btn-primary h-12 w-full">
      {line === null ? (
        <>
          <Play className="h-4 w-4" /> {plays ? t('Nghe lại', 'Play again') : t('Nghe', 'Play')}
        </>
      ) : (
        <>
          <Pause className="h-4 w-4" />
          {t(`Đang nghe ${line + 1}/${total}`, `Playing ${line + 1}/${total}`)}
        </>
      )}
    </button>
  )
}
