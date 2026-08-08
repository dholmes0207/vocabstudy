import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, Download, Upload, Volume2 } from 'lucide-react'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { useAI } from '@/store/aiStore'
import { isTTSSupported, listVoices, speak } from '@/lib/tts'
import { exampleAudio, pronounce } from '@/lib/audio'
import { downloadBackup, importBackup } from '@/lib/backup'

export default function SettingsPage() {
  const pack = useData((s) => s.pack)!
  const audioVoices = useData((s) => s.audioVoices)
  const settings = useSettings()
  const ai = useAI()
  const resetLanguage = useStudy((s) => s.resetLanguage)

  const fileRef = useRef<HTMLInputElement>(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const ttsOk = isTTSSupported()
  const hasNeuralAudio = audioVoices.length > 0
  const canPronounce = hasNeuralAudio || ttsOk

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
        setNotice(`Đã khôi phục ${n} mục. Đang tải lại…`)
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
        <p className="mt-1 text-slate-500">Điều chỉnh trải nghiệm học của bạn. Mọi dữ liệu chỉ lưu trên máy này.</p>
      </header>

      {notice && (
        <div className="rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-700 dark:bg-brand-950/60 dark:text-brand-200">
          {notice}
        </div>
      )}

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
              aria-valuetext={settings.dailyReviewLimit === 0 ? 'Không giới hạn' : `${settings.dailyReviewLimit} từ`}
              className="w-40 accent-brand-600"
            />
            <span className="w-10 text-right font-bold tabular-nums">{settings.dailyReviewLimit || '∞'}</span>
          </div>
        </Row>
      </Section>

      {/* Pronunciation */}
      <Section title="Phát âm">
        {/* Preferred: pre-rendered neural voices (edge-tts). */}
        {hasNeuralAudio ? (
          <Row label="Giọng đọc" hint="Giọng Neural bản xứ, nghe tự nhiên như người thật.">
            <div className="flex items-center gap-2">
              <select
                value={audioVoices.some((v) => v.key === settings.audioVoice) ? settings.audioVoice : audioVoices[0].key}
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
                    audioSrc: exampleAudio(1),
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
                ⚠️ Trình duyệt này không hỗ trợ phát âm (Web Speech API). Hãy thử Chrome, Edge hoặc Safari.
              </p>
            )}
            {ttsOk && voices.length === 0 && (
              <p className="mb-1 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
                ⚠️ Chưa có audio dựng sẵn và máy cũng chưa cài giọng tiếng Anh. Chạy{' '}
                <code>python3 scripts/generate_audio.py</code> để tạo giọng Neural, hoặc dùng Google Chrome.
              </p>
            )}
            {ttsOk && voices.length > 0 && (
              <Row label="Giọng đọc (trình duyệt)" hint="Chưa có audio dựng sẵn — dùng giọng của trình duyệt.">
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
                    onClick={() => speak('Hello! This is how this voice sounds.', { lang: pack.meta.ttsLang, rate: settings.ttsRate })}
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
            <span className="w-12 text-right font-bold tabular-nums">{settings.ttsRate.toFixed(2)}×</span>
            <button
              className="btn-secondary !px-3"
              disabled={!canPronounce}
              onClick={() =>
                pronounce({
                  audioSrc: exampleAudio(1),
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
          <Toggle checked={canPronounce && settings.autoSpeak} onChange={settings.setAutoSpeak} label="Tự động phát âm" disabled={!canPronounce} />
        </Row>
      </Section>

      {/* AI assistant */}
      <Section title="Trợ lý AI (học từ vựng)">
        <p className="mb-1 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500 dark:bg-slate-800/60">
          🔒 Key được lưu <b>trên máy này</b> và chỉ gửi tới OpenAI khi bạn chat. Không đưa vào file sao lưu, không gửi đi
          đâu khác. Đừng dùng trên máy công cộng. (Khi deploy công khai nên dùng proxy để giấu key.)
        </p>
        <Row label="OpenAI API key" hint={ai.apiKey ? '✓ Đã lưu key trên máy này.' : 'Lấy tại platform.openai.com → API keys.'}>
          <div className="flex items-center gap-2">
            <input
              type="password"
              value={ai.apiKey}
              onChange={(e) => ai.setApiKey(e.target.value)}
              placeholder="sk-…"
              aria-label="OpenAI API key"
              autoComplete="off"
              spellCheck={false}
              className="w-44 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
            />
            {ai.apiKey && (
              <button className="btn-ghost !px-2 text-sm" onClick={() => ai.setApiKey('')}>
                Xóa
              </button>
            )}
          </div>
        </Row>
        <Row label="Model" hint="Mặc định o4-mini (model reasoning gọn, rẻ).">
          <input
            type="text"
            value={ai.model}
            onChange={(e) => ai.setModel(e.target.value)}
            aria-label="Model AI"
            spellCheck={false}
            className="w-36 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
          />
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
        <Row label={`Đặt lại tiến độ (${pack.meta.nativeName})`} hint="Xóa toàn bộ thẻ & thống kê của ngôn ngữ hiện tại. Không thể hoàn tác.">
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
            <button className="btn bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-950 dark:text-rose-300" onClick={() => setConfirmReset(true)}>
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

function Section({ title, danger, children }: { title: string; danger?: boolean; children: React.ReactNode }) {
  return (
    <section className={`card p-5 ${danger ? 'border-rose-200 dark:border-rose-900/60' : ''}`}>
      <h2 className={`mb-2 text-sm font-bold uppercase tracking-wide ${danger ? 'text-rose-500' : 'text-slate-400'}`}>{title}</h2>
      <div className="divide-y divide-slate-100 dark:divide-slate-800">{children}</div>
    </section>
  )
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-3.5">
      <div className="min-w-0">
        <p className="font-medium">{label}</p>
        {hint && <p className="text-sm text-slate-400">{hint}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

function Toggle({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean
  onChange: (b: boolean) => void
  label?: string
  disabled?: boolean
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 rounded-full transition disabled:opacity-40 ${checked ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-700'}`}
    >
      <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? 'left-6' : 'left-1'}`} />
    </button>
  )
}
