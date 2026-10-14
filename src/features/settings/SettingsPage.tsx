import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, Download, Upload, Volume2 } from 'lucide-react'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { useAuth } from '@/store/authStore'
import { isTTSSupported, listVoices, speak } from '@/lib/tts'
import { exampleAudio, pronounce } from '@/lib/audio'
import { downloadBackup, importBackup } from '@/lib/backup'
import { LEVELS, levelInfo, levelLabel } from '@/lib/level'
import { isRecognitionSupported } from '@/lib/speech'
import { supabaseConfigured } from '@/lib/supabase'
import { RESTORE_FLAG } from '@/hooks/useProgressSync'
import { useEffectiveLevel } from '@/hooks/useEffectiveLevel'
import ReminderSetup from '@/components/ReminderSetup'
import { Row, Section, Segmented, Toggle } from './ui'
import { AccountSection, DeleteAccountRow } from './AccountSection'
import { useT } from '@/lib/i18n'
import { useTargetLang } from '@/hooks/useTargetLang'

// Options carry both languages: [value, Vietnamese, English].
const UI_LANG_OPTIONS = [
  ['en', 'English', 'English'],
  ['vi', 'Tiếng Việt', 'Tiếng Việt'],
] as const

const THEME_OPTIONS = [
  ['light', 'Sáng', 'Light'],
  ['dark', 'Tối', 'Dark'],
  ['system', 'Theo máy', 'System'],
] as const

const SKY_OPTIONS = [
  ['auto', 'Tự động', 'Auto'],
  ['full', 'Đầy đủ', 'Full'],
  ['lite', 'Nhẹ', 'Lite'],
  ['off', 'Tắt', 'Off'],
] as const

const GOAL_CHOICES = [
  ['5', '5 câu', '5'],
  ['10', '10 câu', '10'],
  ['20', '20 câu', '20'],
  ['40', '40 câu', '40'],
] as const

const STRICTNESS_OPTIONS = [
  ['easy', 'Dễ', 'Easy'],
  ['normal', 'Vừa', 'Normal'],
  ['hard', 'Khó', 'Strict'],
] as const

export default function SettingsPage() {
  const pack = useData((s) => s.pack)!
  const audioVoices = useData((s) => s.audioVoices)
  const settings = useSettings()
  const user = useAuth((s) => s.user)
  const syncing = Boolean(user && supabaseConfigured)
  const effLevel = useEffectiveLevel()
  const resetLanguage = useStudy((s) => s.resetLanguage)
  const [reducedMotion] = useState(
    () =>
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )

  const fileRef = useRef<HTMLInputElement>(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  /** Account actions happen far down the page; bring their result into view. */
  const announce = (message: string) => {
    setNotice(message)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const ttsOk = isTTSSupported()
  const hasNeuralAudio = audioVoices.length > 0
  const canPronounce = hasNeuralAudio || ttsOk
  const canRecognize = isRecognitionSupported()
  const t = useT()
  const L = useTargetLang()
  const opts = <T extends string>(list: readonly (readonly [T, string, string])[]) =>
    list.map(([v, vi, en]) => [v, t(vi, en)] as const)
  const level = (n: number) => levelLabel(levelInfo(n), settings.uiLang)

  // Installed voices load asynchronously; refresh when the browser reports them.
  const [voices, setVoices] = useState(() => listVoices(pack.meta.ttsLang))
  useEffect(() => {
    if (!ttsOk) return
    const refresh = () => setVoices(listVoices(pack.meta.ttsLang))
    refresh()
    window.speechSynthesis.addEventListener('voiceschanged', refresh)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', refresh)
  }, [pack.meta.ttsLang, ttsOk])

  const onImport = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const n = importBackup(String(reader.result))
        // When logged in, mark this so the sync after reload pushes the restored
        // data UP instead of pulling the old server copy down over it (F3).
        if (syncing) sessionStorage.setItem(RESTORE_FLAG, '1')
        setNotice(
          syncing
            ? t(
                `Đã khôi phục ${n} mục và đang đồng bộ lên tài khoản. Đang tải lại…`,
                `Restored ${n} items and syncing them to your account. Reloading…`
              )
            : t(`Đã khôi phục ${n} mục. Đang tải lại…`, `Restored ${n} items. Reloading…`)
        )
        setTimeout(() => location.reload(), 800)
      } catch (e) {
        setNotice(
          e instanceof Error ? e.message : t('Không đọc được file.', "Couldn't read the file.")
        )
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-fade-in">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">
          <span className="text-aurora">{t('Cài đặt', 'Settings')}</span>{' '}
          <span aria-hidden="true">⚙️</span>
        </h1>
        <p className="mt-1 text-slate-500">
          {t('Điều chỉnh trải nghiệm học của bạn.', 'Tune how you learn.')}{' '}
          {syncing
            ? t(
                'Tiến độ được đồng bộ lên tài khoản của bạn (có kèm bản sao trên máy này).',
                'Your progress syncs to your account (with a copy on this device).'
              )
            : t(
                'Dữ liệu hiện lưu trên máy này — đăng nhập để đồng bộ lên tài khoản.',
                'Your data is stored on this device — sign in to sync it to your account.'
              )}
        </p>
      </header>

      {notice && (
        <div className="rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-700 dark:bg-brand-950/60 dark:text-brand-200">
          {notice}
        </div>
      )}

      {/* Look & feel */}
      <Section title={t('Giao diện', 'Appearance')}>
        <Row
          label={t('Ngôn ngữ giao diện', 'Interface language')}
          hint={t(
            'Menu, nút và lời nhắn. Nghĩa của từ vẫn bằng tiếng Việt.',
            'Menus, buttons and messages. Word meanings stay in Vietnamese.'
          )}
        >
          <Segmented
            label={t('Ngôn ngữ giao diện', 'Interface language')}
            value={settings.uiLang}
            options={opts(UI_LANG_OPTIONS)}
            onChange={settings.setUiLang}
          />
        </Row>
        <Row
          label={t('Chủ đề', 'Theme')}
          hint={t('Bầu trời sao rõ nhất ở chủ đề Tối.', 'The starry sky looks best in Dark.')}
        >
          <Segmented
            label={t('Chủ đề', 'Theme')}
            value={settings.theme}
            options={opts(THEME_OPTIONS)}
            onChange={settings.setTheme}
          />
        </Row>
        <Row
          label={t('Bầu trời động', 'Animated sky')}
          hint={
            reducedMotion
              ? t(
                  'Máy đang bật “Giảm chuyển động” nên bầu trời đứng yên.',
                  '“Reduce motion” is on, so the sky stays still.'
                )
              : t(
                  'Sao lấp lánh, sao băng, cực quang. “Tự động” nhẹ hơn trên điện thoại để đỡ tốn pin.',
                  'Twinkling stars, meteors, aurora. “Auto” is lighter on phones to save battery.'
                )
          }
        >
          <Segmented
            label={t('Bầu trời động', 'Animated sky')}
            value={settings.skyEffects}
            options={opts(SKY_OPTIONS)}
            onChange={settings.setSkyEffects}
          />
        </Row>
        <Row
          label={t('Tuyết rơi', 'Snowfall')}
          hint={t(
            'Rê chuột hoặc chạm để gạt tuyết sang bên.',
            'Move the mouse or touch to brush the snow aside.'
          )}
        >
          <Toggle
            checked={settings.snow}
            onChange={settings.setSnow}
            label={t('Tuyết rơi', 'Snowfall')}
            disabled={settings.skyEffects === 'off'}
          />
        </Row>
        <Row
          label={t('Lấp lánh theo chuột', 'Cursor sparkles')}
          hint={t(
            'Vệt sáng theo con trỏ, bung sao khi bấm hoặc chạm.',
            'A glowing trail follows the pointer; stars burst when you click or tap.'
          )}
        >
          <Toggle
            checked={settings.cursorTrail}
            onChange={settings.setCursorTrail}
            label={t('Lấp lánh theo chuột', 'Cursor sparkles')}
            disabled={settings.skyEffects === 'off'}
          />
        </Row>
      </Section>

      {/* Learning */}
      <Section title={t('Học tập', 'Learning')}>
        <Row
          label={t('Mục tiêu nhỏ mỗi ngày', 'Small daily goal')}
          hint={t(
            'Số câu trả lời mỗi ngày. Mục tiêu nhỏ dễ giữ hơn — đều đặn quan trọng hơn nhiều.',
            'Answers per day. Small goals are easier to keep — consistency matters far more.'
          )}
        >
          <Segmented
            label={t('Mục tiêu nhỏ mỗi ngày', 'Small daily goal')}
            value={String(settings.dailyGoal)}
            options={opts(GOAL_CHOICES)}
            onChange={(v) => settings.setDailyGoal(Number(v))}
          />
        </Row>
        <div className="py-3.5">
          <p className="font-medium">{t('Nhắc học mỗi ngày 🔔', 'Daily study reminder 🔔')}</p>
          <p className="mb-3 text-sm text-slate-400">
            {t(
              'Thêm một lịch hẹn lặp lại hằng ngày vào điện thoại — đến giờ chuông reo, bấm vào là mở app.',
              'Add a daily repeating event to your phone — it rings on time, and one tap opens the app.'
            )}
          </p>
          <ReminderSetup />
        </div>
        <Row
          label={t('Số từ mới mỗi ngày', 'New words per day')}
          hint={t(
            'Khuyến nghị 10–15 từ để nhớ chất lượng.',
            '10–15 words is recommended for lasting memory.'
          )}
        >
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={5}
              max={50}
              step={5}
              value={settings.dailyNewLimit}
              onChange={(e) => settings.setDailyNewLimit(Number(e.target.value))}
              aria-label={t('Số từ mới mỗi ngày', 'New words per day')}
              aria-valuetext={t(`${settings.dailyNewLimit} từ`, `${settings.dailyNewLimit} words`)}
              className="w-40 accent-brand-600"
            />
            <span className="w-10 text-right font-bold tabular-nums">{settings.dailyNewLimit}</span>
          </div>
        </Row>
        <Row
          label={t('Giới hạn số từ ôn mỗi phiên', 'Review limit per session')}
          hint={t('0 = ôn tất cả từ đến hạn.', '0 = review every due word.')}
        >
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={100}
              step={10}
              value={settings.dailyReviewLimit}
              onChange={(e) => settings.setDailyReviewLimit(Number(e.target.value))}
              aria-label={t('Giới hạn số từ ôn mỗi phiên', 'Review limit per session')}
              aria-valuetext={
                settings.dailyReviewLimit === 0
                  ? t('Không giới hạn', 'No limit')
                  : t(`${settings.dailyReviewLimit} từ`, `${settings.dailyReviewLimit} words`)
              }
              className="w-40 accent-brand-600"
            />
            <span className="w-10 text-right font-bold tabular-nums">
              {settings.dailyReviewLimit || '∞'}
            </span>
          </div>
        </Row>
        <Row
          label={t('Âm thanh khi kiểm tra', 'Quiz sounds')}
          hint={t(
            'Tiếng “tinh” khi đúng / “tút” khi sai lúc làm quiz.',
            'A “ding” when right and a “buzz” when wrong.'
          )}
        >
          <Toggle
            checked={settings.soundEnabled}
            onChange={settings.setSoundEnabled}
            label={t('Âm thanh khi kiểm tra', 'Quiz sounds')}
          />
        </Row>
      </Section>

      {/* Pronunciation */}
      <Section title={t('Phát âm', 'Pronunciation')}>
        {/* Preferred: pre-rendered neural voices (edge-tts). */}
        {hasNeuralAudio ? (
          <Row
            label={t('Giọng đọc', 'Voice')}
            hint={t(
              'Giọng đọc AI (Neural) chuẩn Mỹ, nghe tự nhiên.',
              'Natural-sounding AI (neural) voices with a US accent.'
            )}
          >
            <div className="flex items-center gap-2">
              <select
                value={
                  audioVoices.some((v) => v.key === settings.audioVoice)
                    ? settings.audioVoice
                    : audioVoices[0].key
                }
                onChange={(e) => settings.setAudioVoice(e.target.value)}
                aria-label={t('Chọn giọng đọc', 'Choose a voice')}
                className="max-w-[15rem] rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
              >
                {audioVoices.map((v) => (
                  <option key={v.key} value={v.key}>
                    {v.label}
                  </option>
                ))}
              </select>
              <button
                className="btn-secondary !px-3"
                onClick={() =>
                  pronounce({
                    audioSrc: exampleAudio(1, 'She has a book and an apple.'),
                    text: 'She has a book and an apple.',
                    lang: pack.meta.ttsLang,
                    rate: settings.ttsRate,
                  })
                }
                aria-label={t('Nghe thử giọng đã chọn', 'Hear the chosen voice')}
              >
                <Volume2 className="h-4 w-4" />
              </button>
            </div>
          </Row>
        ) : (
          <>
            {/* Fallback: no pre-rendered audio -> pick the best browser voice. */}
            {!ttsOk && (
              <p className="mb-1 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
                ⚠️{' '}
                {t(
                  'Trình duyệt này không hỗ trợ phát âm (Web Speech API). Hãy thử Chrome, Edge hoặc Safari.',
                  "This browser can't speak (no Web Speech API). Try Chrome, Edge or Safari."
                )}
              </p>
            )}
            {ttsOk && voices.length === 0 && (
              <p className="mb-1 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
                ⚠️{' '}
                {t(
                  `Máy bạn chưa có giọng đọc ${L.vi}. Hãy mở trang bằng Google Chrome hoặc Microsoft Edge (bản mới) để nghe được phát âm nhé.`,
                  `Your device has no ${L.en} voice installed. Open the site in a recent Google Chrome or Microsoft Edge to hear pronunciation.`
                )}
              </p>
            )}
            {ttsOk && voices.length > 0 && (
              <Row
                label={t('Giọng đọc (trình duyệt)', 'Voice (browser)')}
                hint={t(
                  'Chưa có audio dựng sẵn — dùng giọng của trình duyệt.',
                  "No recorded audio yet — using the browser's voice."
                )}
              >
                <div className="flex items-center gap-2">
                  <select
                    value={settings.ttsVoiceURI ?? ''}
                    onChange={(e) => settings.setTtsVoiceURI(e.target.value || null)}
                    aria-label={t('Chọn giọng đọc trình duyệt', 'Choose a browser voice')}
                    className="max-w-[13rem] rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
                  >
                    <option value="">{t('Tự động (tốt nhất)', 'Automatic (best)')}</option>
                    {voices.map((v) => (
                      <option key={v.voiceURI} value={v.voiceURI}>
                        {v.name} ({v.lang})
                      </option>
                    ))}
                  </select>
                  <button
                    className="btn-secondary !px-3"
                    onClick={() =>
                      speak('Hello! This is how this voice sounds.', {
                        lang: pack.meta.ttsLang,
                        rate: settings.ttsRate,
                      })
                    }
                    aria-label={t('Nghe thử giọng đã chọn', 'Hear the chosen voice')}
                  >
                    <Volume2 className="h-4 w-4" />
                  </button>
                </div>
              </Row>
            )}
          </>
        )}
        <Row
          label={t('Tốc độ đọc', 'Speaking speed')}
          hint={t(
            'Chậm lại nếu bạn muốn nghe rõ từng âm.',
            'Slow down to hear every sound clearly.'
          )}
        >
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0.5}
              max={1.25}
              step={0.05}
              value={settings.ttsRate}
              onChange={(e) => settings.setTtsRate(Number(e.target.value))}
              aria-label={t('Tốc độ đọc', 'Speaking speed')}
              aria-valuetext={t(
                `${settings.ttsRate.toFixed(2)} lần`,
                `${settings.ttsRate.toFixed(2)} times`
              )}
              disabled={!canPronounce}
              className="w-28 accent-brand-600 disabled:opacity-40 sm:w-40"
            />
            <span className="w-12 text-right font-bold tabular-nums">
              {settings.ttsRate.toFixed(2)}×
            </span>
            <button
              className="btn-secondary !px-3"
              disabled={!canPronounce}
              onClick={() =>
                pronounce({
                  audioSrc: exampleAudio(1, 'She has a book and an apple.'),
                  text: 'She has a book and an apple.',
                  lang: pack.meta.ttsLang,
                  rate: settings.ttsRate,
                })
              }
              aria-label={t('Nghe thử phát âm', 'Play a sample')}
            >
              <Volume2 className="h-4 w-4" /> {t('Nghe thử', 'Try it')}
            </button>
          </div>
        </Row>
        <Row
          label={t('Tự động phát âm', 'Auto-pronounce')}
          hint={t('Đọc từ ngay khi hiện thẻ mới.', 'Say the word as soon as a new card appears.')}
        >
          <Toggle
            checked={canPronounce && settings.autoSpeak}
            onChange={settings.setAutoSpeak}
            label={t('Tự động phát âm', 'Auto-pronounce')}
            disabled={!canPronounce}
          />
        </Row>
      </Section>

      {/* Speaking practice */}
      <Section title={t('Luyện nói', 'Speaking')}>
        <Row
          label={t('Độ khó chấm điểm', 'Scoring strictness')}
          hint={
            canRecognize
              ? t(
                  '“Khó” chỉ chấp nhận khi máy nghe đúng hẳn từ; “Dễ” chấp nhận cả khi đọc gần đúng.',
                  '“Strict” accepts only the exact word; “Easy” also accepts close attempts.'
                )
              : t(
                  'Trình duyệt này chưa chấm điểm tự động được — bạn ghi âm rồi tự so với giọng mẫu.',
                  "This browser can't score speech — record yourself and compare with the model voice."
                )
          }
        >
          <div className="flex gap-1.5">
            {opts(STRICTNESS_OPTIONS).map(([value, label]) => (
              <button
                key={value}
                onClick={() => settings.setSpeechStrictness(value)}
                disabled={!canRecognize}
                className={`rounded-lg border-2 px-3 py-1.5 text-sm font-semibold transition disabled:opacity-40 ${
                  settings.speechStrictness === value
                    ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-200'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </Row>
      </Section>

      {/* Personalization level */}
      <Section title={t('Trình độ (cá nhân hoá)', 'Level (personalization)')}>
        <Row
          label={t('Tự động đánh giá trình độ', 'Estimate my level automatically')}
          hint={t(
            'Ước lượng theo số từ thành thạo & độ chính xác của bạn.',
            'Based on how many words you have mastered and your accuracy.'
          )}
        >
          <Toggle
            checked={settings.autoLevel}
            onChange={settings.setAutoLevel}
            label={t('Tự động đánh giá trình độ', 'Estimate my level automatically')}
          />
        </Row>
        <Row
          label={t('Trình độ hiện tại', 'Current level')}
          hint={t(
            `${level(effLevel).name} — ${level(effLevel).blurb}. Trợ lý AI sẽ giảng theo mức này.`,
            `${level(effLevel).name} — ${level(effLevel).blurb}. The AI tutor explains at this level.`
          )}
        >
          {settings.autoLevel ? (
            <span className="chip bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-200">
              {levelInfo(effLevel).tag} · {level(effLevel).name}
            </span>
          ) : (
            <select
              value={settings.level}
              onChange={(e) => settings.setLevel(Number(e.target.value))}
              aria-label={t('Chọn trình độ', 'Choose a level')}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
            >
              {LEVELS.map((l) => (
                <option key={l.level} value={l.level}>
                  {l.tag} · {level(l.level).name}
                </option>
              ))}
            </select>
          )}
        </Row>
      </Section>

      {syncing && <AccountSection onNotice={announce} />}

      {/* Data */}
      <Section title={t('Dữ liệu & sao lưu', 'Data & backup')}>
        <Row
          label={t('Sao lưu tiến độ', 'Back up progress')}
          hint={t(
            'Tải toàn bộ tiến độ & cài đặt ra file JSON.',
            'Download all progress & settings as a JSON file.'
          )}
        >
          <button className="btn-secondary" onClick={downloadBackup}>
            <Download className="h-4 w-4" /> {t('Xuất file', 'Export')}
          </button>
        </Row>
        <Row
          label={t('Khôi phục', 'Restore')}
          hint={t('Nhập lại tiến độ từ file đã sao lưu.', 'Load progress from a backup file.')}
        >
          <button className="btn-secondary" onClick={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4" /> {t('Chọn file', 'Choose file')}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) onImport(f)
              e.target.value = ''
            }}
          />
        </Row>
      </Section>

      {/* Danger zone */}
      <Section title={t('Vùng nguy hiểm', 'Danger zone')} danger>
        {syncing && <DeleteAccountRow onNotice={announce} />}
        <Row
          label={t(
            `Đặt lại tiến độ (${pack.meta.nativeName})`,
            `Reset progress (${pack.meta.name})`
          )}
          hint={t(
            'Xóa toàn bộ thẻ & thống kê của ngôn ngữ hiện tại. Không thể hoàn tác.',
            'Deletes every card and statistic for this language. This cannot be undone.'
          )}
        >
          {confirmReset ? (
            <div className="flex items-center gap-2">
              <button
                className="btn bg-rose-600 text-white hover:bg-rose-700"
                onClick={() => {
                  resetLanguage(settings.currentLang)
                  setConfirmReset(false)
                  setNotice(t('Đã đặt lại tiến độ.', 'Progress has been reset.'))
                }}
              >
                <AlertTriangle className="h-4 w-4" /> {t('Xác nhận xóa', 'Yes, delete')}
              </button>
              <button className="btn-ghost" onClick={() => setConfirmReset(false)}>
                {t('Hủy', 'Cancel')}
              </button>
            </div>
          ) : (
            <button
              className="btn bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-950 dark:text-rose-300"
              onClick={() => setConfirmReset(true)}
            >
              {t('Đặt lại', 'Reset')}
            </button>
          )}
        </Row>
      </Section>

      <p className="pt-2 text-center text-xs text-slate-400">
        VocaStudy · {t('Nguồn', 'Source')}: {pack.meta.source}
      </p>
    </div>
  )
}
