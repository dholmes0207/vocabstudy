import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, Download, Upload, Volume2 } from 'lucide-react'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { useAuth } from '@/store/authStore'
import { isTTSSupported, listVoices, speak } from '@/lib/tts'
import { exampleAudio, pronounce } from '@/lib/audio'
import { downloadBackup, importBackup } from '@/lib/backup'
import { LEVELS, levelInfo } from '@/lib/level'
import { isRecognitionSupported } from '@/lib/speech'
import { supabaseConfigured } from '@/lib/supabase'
import { RESTORE_FLAG } from '@/hooks/useProgressSync'
import { useEffectiveLevel } from '@/hooks/useEffectiveLevel'
import { Row, Section, Segmented, Toggle } from './ui'

const THEME_OPTIONS = [
  ['light', 'Sáng'],
  ['dark', 'Tối'],
  ['system', 'Theo máy'],
] as const

const SKY_OPTIONS = [
  ['auto', 'Tự động'],
  ['full', 'Đầy đủ'],
  ['lite', 'Nhẹ'],
  ['off', 'Tắt'],
] as const

const STRICTNESS_OPTIONS = [
  ['easy', 'Dễ'],
  ['normal', 'Vừa'],
  ['hard', 'Khó'],
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
  const ttsOk = isTTSSupported()
  const hasNeuralAudio = audioVoices.length > 0
  const canPronounce = hasNeuralAudio || ttsOk
  const canRecognize = isRecognitionSupported()

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
            ? `Đã khôi phục ${n} mục và đang đồng bộ lên tài khoản. Đang tải lại…`
            : `Đã khôi phục ${n} mục. Đang tải lại…`
        )
        setTimeout(() => location.reload(), 800)
      } catch (e) {
        setNotice(e instanceof Error ? e.message : 'Không đọc được file.')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-fade-in">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">Cài đặt ⚙️</h1>
        <p className="mt-1 text-slate-500">
          Điều chỉnh trải nghiệm học của bạn.{' '}
          {syncing
            ? 'Tiến độ được đồng bộ lên tài khoản của bạn (có kèm bản sao trên máy này).'
            : 'Dữ liệu hiện lưu trên máy này — đăng nhập để đồng bộ lên tài khoản.'}
        </p>
      </header>

      {notice && (
        <div className="rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-700 dark:bg-brand-950/60 dark:text-brand-200">
          {notice}
        </div>
      )}

      {/* Look & feel */}
      <Section title="Giao diện">
        <Row label="Chủ đề" hint="Bầu trời sao rõ nhất ở chủ đề Tối.">
          <Segmented
            label="Chủ đề"
            value={settings.theme}
            options={THEME_OPTIONS}
            onChange={settings.setTheme}
          />
        </Row>
        <Row
          label="Bầu trời động"
          hint={
            reducedMotion
              ? 'Máy đang bật “Giảm chuyển động” nên bầu trời đứng yên.'
              : 'Sao lấp lánh, sao băng, cực quang. “Tự động” nhẹ hơn trên điện thoại để đỡ tốn pin.'
          }
        >
          <Segmented
            label="Bầu trời động"
            value={settings.skyEffects}
            options={SKY_OPTIONS}
            onChange={settings.setSkyEffects}
          />
        </Row>
        <Row label="Tuyết rơi" hint="Rê chuột hoặc chạm để gạt tuyết sang bên.">
          <Toggle
            checked={settings.snow}
            onChange={settings.setSnow}
            label="Tuyết rơi"
            disabled={settings.skyEffects === 'off'}
          />
        </Row>
        <Row label="Lấp lánh theo chuột" hint="Vệt sáng theo con trỏ, bung sao khi bấm hoặc chạm.">
          <Toggle
            checked={settings.cursorTrail}
            onChange={settings.setCursorTrail}
            label="Lấp lánh theo chuột"
            disabled={settings.skyEffects === 'off'}
          />
        </Row>
      </Section>

      {/* Learning */}
      <Section title="Học tập">
        <Row label="Số từ mới mỗi ngày" hint="Khuyến nghị 10–15 từ để nhớ chất lượng.">
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={5}
              max={50}
              step={5}
              value={settings.dailyNewLimit}
              onChange={(e) => settings.setDailyNewLimit(Number(e.target.value))}
              aria-label="Số từ mới mỗi ngày"
              aria-valuetext={`${settings.dailyNewLimit} từ`}
              className="w-40 accent-brand-600"
            />
            <span className="w-10 text-right font-bold tabular-nums">{settings.dailyNewLimit}</span>
          </div>
        </Row>
        <Row label="Giới hạn số từ ôn mỗi phiên" hint="0 = ôn tất cả từ đến hạn.">
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={100}
              step={10}
              value={settings.dailyReviewLimit}
              onChange={(e) => settings.setDailyReviewLimit(Number(e.target.value))}
              aria-label="Giới hạn số từ ôn mỗi phiên"
              aria-valuetext={
                settings.dailyReviewLimit === 0
                  ? 'Không giới hạn'
                  : `${settings.dailyReviewLimit} từ`
              }
              className="w-40 accent-brand-600"
            />
            <span className="w-10 text-right font-bold tabular-nums">
              {settings.dailyReviewLimit || '∞'}
            </span>
          </div>
        </Row>
        <Row
          label="Âm thanh khi kiểm tra"
          hint="Tiếng “tinh” khi đúng / “tút” khi sai lúc làm quiz."
        >
          <Toggle
            checked={settings.soundEnabled}
            onChange={settings.setSoundEnabled}
            label="Âm thanh khi kiểm tra"
          />
        </Row>
      </Section>

      {/* Pronunciation */}
      <Section title="Phát âm">
        {/* Preferred: pre-rendered neural voices (edge-tts). */}
        {hasNeuralAudio ? (
          <Row label="Giọng đọc" hint="Giọng Neural bản xứ, nghe tự nhiên như người thật.">
            <div className="flex items-center gap-2">
              <select
                value={
                  audioVoices.some((v) => v.key === settings.audioVoice)
                    ? settings.audioVoice
                    : audioVoices[0].key
                }
                onChange={(e) => settings.setAudioVoice(e.target.value)}
                aria-label="Chọn giọng đọc"
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
                aria-label="Nghe thử giọng đã chọn"
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
                ⚠️ Trình duyệt này không hỗ trợ phát âm (Web Speech API). Hãy thử Chrome, Edge hoặc
                Safari.
              </p>
            )}
            {ttsOk && voices.length === 0 && (
              <p className="mb-1 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
                ⚠️ Máy bạn chưa có giọng đọc tiếng Anh. Hãy mở trang bằng Google Chrome hoặc
                Microsoft Edge (bản mới) để nghe được phát âm nhé.
              </p>
            )}
            {ttsOk && voices.length > 0 && (
              <Row
                label="Giọng đọc (trình duyệt)"
                hint="Chưa có audio dựng sẵn — dùng giọng của trình duyệt."
              >
                <div className="flex items-center gap-2">
                  <select
                    value={settings.ttsVoiceURI ?? ''}
                    onChange={(e) => settings.setTtsVoiceURI(e.target.value || null)}
                    aria-label="Chọn giọng đọc trình duyệt"
                    className="max-w-[13rem] rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
                  >
                    <option value="">Tự động (tốt nhất)</option>
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
                    aria-label="Nghe thử giọng đã chọn"
                  >
                    <Volume2 className="h-4 w-4" />
                  </button>
                </div>
              </Row>
            )}
          </>
        )}
        <Row label="Tốc độ đọc" hint="Chậm lại nếu bạn muốn nghe rõ từng âm.">
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0.5}
              max={1.25}
              step={0.05}
              value={settings.ttsRate}
              onChange={(e) => settings.setTtsRate(Number(e.target.value))}
              aria-label="Tốc độ đọc"
              aria-valuetext={`${settings.ttsRate.toFixed(2)} lần`}
              disabled={!canPronounce}
              className="w-40 accent-brand-600 disabled:opacity-40"
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
              aria-label="Nghe thử phát âm"
            >
              <Volume2 className="h-4 w-4" /> Nghe thử
            </button>
          </div>
        </Row>
        <Row label="Tự động phát âm" hint="Đọc từ ngay khi hiện thẻ mới.">
          <Toggle
            checked={canPronounce && settings.autoSpeak}
            onChange={settings.setAutoSpeak}
            label="Tự động phát âm"
            disabled={!canPronounce}
          />
        </Row>
      </Section>

      {/* Speaking practice */}
      <Section title="Luyện nói">
        <Row
          label="Độ khó chấm điểm"
          hint={
            canRecognize
              ? '“Khó” chỉ chấp nhận khi máy nghe đúng hẳn từ; “Dễ” chấp nhận cả khi đọc gần đúng.'
              : 'Trình duyệt này chưa chấm điểm tự động được — bạn ghi âm rồi tự so với giọng mẫu.'
          }
        >
          <div className="flex gap-1.5">
            {STRICTNESS_OPTIONS.map(([value, label]) => (
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
      <Section title="Trình độ (cá nhân hoá)">
        <Row
          label="Tự động đánh giá trình độ"
          hint="Ước lượng theo số từ thành thạo & độ chính xác của bạn."
        >
          <Toggle
            checked={settings.autoLevel}
            onChange={settings.setAutoLevel}
            label="Tự động đánh giá trình độ"
          />
        </Row>
        <Row
          label="Trình độ hiện tại"
          hint={`${levelInfo(effLevel).name} — ${levelInfo(effLevel).blurb}. Trợ lý AI sẽ giảng theo mức này.`}
        >
          {settings.autoLevel ? (
            <span className="chip bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-200">
              {levelInfo(effLevel).tag} · {levelInfo(effLevel).name}
            </span>
          ) : (
            <select
              value={settings.level}
              onChange={(e) => settings.setLevel(Number(e.target.value))}
              aria-label="Chọn trình độ"
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
            >
              {LEVELS.map((l) => (
                <option key={l.level} value={l.level}>
                  {l.tag} · {l.name}
                </option>
              ))}
            </select>
          )}
        </Row>
      </Section>

      {/* Data */}
      <Section title="Dữ liệu & sao lưu">
        <Row label="Sao lưu tiến độ" hint="Tải toàn bộ tiến độ & cài đặt ra file JSON.">
          <button className="btn-secondary" onClick={downloadBackup}>
            <Download className="h-4 w-4" /> Xuất file
          </button>
        </Row>
        <Row label="Khôi phục" hint="Nhập lại tiến độ từ file đã sao lưu.">
          <button className="btn-secondary" onClick={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4" /> Chọn file
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
      <Section title="Vùng nguy hiểm" danger>
        <Row
          label={`Đặt lại tiến độ (${pack.meta.nativeName})`}
          hint="Xóa toàn bộ thẻ & thống kê của ngôn ngữ hiện tại. Không thể hoàn tác."
        >
          {confirmReset ? (
            <div className="flex items-center gap-2">
              <button
                className="btn bg-rose-600 text-white hover:bg-rose-700"
                onClick={() => {
                  resetLanguage(settings.currentLang)
                  setConfirmReset(false)
                  setNotice('Đã đặt lại tiến độ.')
                }}
              >
                <AlertTriangle className="h-4 w-4" /> Xác nhận xóa
              </button>
              <button className="btn-ghost" onClick={() => setConfirmReset(false)}>
                Hủy
              </button>
            </div>
          ) : (
            <button
              className="btn bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-950 dark:text-rose-300"
              onClick={() => setConfirmReset(true)}
            >
              Đặt lại
            </button>
          )}
        </Row>
      </Section>

      <p className="pt-2 text-center text-xs text-slate-400">
        VocabStudy · Nguồn: {pack.meta.source}
      </p>
    </div>
  )
}
