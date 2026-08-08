import { useState } from 'react'
import { KeyRound, Lock, Plus, ShieldCheck, Trash2, Unlock } from 'lucide-react'
import { useAI } from '@/store/aiStore'
import { Row, Section } from './ui'

export default function AISettings() {
  const providers = useAI((s) => s.providers)
  const selectedProviderId = useAI((s) => s.selectedProviderId)
  const adminPinHash = useAI((s) => s.adminPinHash)
  const adminUnlocked = useAI((s) => s.adminUnlocked)
  const { addProvider, updateProvider, removeProvider, selectProvider, setAdminPin, unlockAdmin, lockAdmin } = useAI()

  const admin = adminPinHash === null || adminUnlocked

  return (
    <Section title="Trợ lý AI — phân quyền">
      <p className="mb-1 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500 dark:bg-slate-800/60">
        🔒 Key lưu trên máy này, chỉ gửi tới OpenAI khi chat, không vào file sao lưu.{' '}
        <b>Phân quyền là ranh giới tổ chức</b> (ẩn key khỏi giao diện học sinh), không phải bảo mật tuyệt đối — muốn chặt,
        dùng proxy backend rồi trỏ <code>baseUrl</code> về đó.
      </p>

      {/* Everyone can pick which configured model to use */}
      {providers.length > 0 && (
        <Row label="Model đang dùng" hint="Nguồn AI cho trợ lý.">
          <select
            value={selectedProviderId ?? providers[0].id}
            onChange={(e) => selectProvider(e.target.value)}
            aria-label="Chọn model AI"
            className="max-w-[15rem] rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
          >
            {providers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label} ({p.model})
              </option>
            ))}
          </select>
        </Row>
      )}

      {admin ? (
        <AdminPanel
          providers={providers}
          onUpdate={updateProvider}
          onRemove={removeProvider}
          onAdd={addProvider}
          adminPinHash={adminPinHash}
          adminUnlocked={adminUnlocked}
          onSetPin={setAdminPin}
          onLock={lockAdmin}
        />
      ) : (
        <StudentPanel hasProviders={providers.length > 0} onUnlock={unlockAdmin} />
      )}
    </Section>
  )
}

function AdminPanel({
  providers,
  onUpdate,
  onRemove,
  onAdd,
  adminPinHash,
  adminUnlocked,
  onSetPin,
  onLock,
}: {
  providers: ReturnType<typeof useAI.getState>['providers']
  onUpdate: (id: string, patch: Record<string, string>) => void
  onRemove: (id: string) => void
  onAdd: (p: { label: string; model: string; apiKey: string; baseUrl: string }) => void
  adminPinHash: string | null
  adminUnlocked: boolean
  onSetPin: (pin: string) => void
  onLock: () => void
}) {
  const [form, setForm] = useState({ label: '', model: 'o4-mini', apiKey: '', baseUrl: 'https://api.openai.com/v1' })
  const [pin, setPin] = useState('')

  return (
    <>
      {adminUnlocked && (
        <Row label="Chế độ quản trị" hint="Bạn đang mở khóa. Khóa lại để chuyển sang chế độ học sinh.">
          <button className="btn-secondary" onClick={onLock}>
            <Lock className="h-4 w-4" /> Khóa (chế độ học sinh)
          </button>
        </Row>
      )}

      {/* Provider list */}
      <div className="py-3.5">
        <p className="mb-2 font-medium">Danh sách provider (model + key)</p>
        {providers.length === 0 && <p className="text-sm text-slate-400">Chưa có provider nào. Thêm bên dưới.</p>}
        <div className="space-y-2">
          {providers.map((p) => (
            <div key={p.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
              <div className="mb-2 flex items-center gap-2">
                <input
                  value={p.label}
                  onChange={(e) => onUpdate(p.id, { label: e.target.value })}
                  aria-label="Tên hiển thị"
                  placeholder="Tên hiển thị"
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
                />
                <button className="btn-ghost !px-2 text-rose-500" onClick={() => onRemove(p.id)} aria-label="Xóa provider">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={p.model}
                  onChange={(e) => onUpdate(p.id, { model: e.target.value })}
                  aria-label="Model"
                  placeholder="model (o4-mini)"
                  className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
                />
                <input
                  type="password"
                  value={p.apiKey}
                  onChange={(e) => onUpdate(p.id, { apiKey: e.target.value })}
                  aria-label="API key"
                  placeholder="sk-…"
                  autoComplete="off"
                  className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
                />
                <input
                  value={p.baseUrl}
                  onChange={(e) => onUpdate(p.id, { baseUrl: e.target.value })}
                  aria-label="Base URL"
                  placeholder="https://api.openai.com/v1"
                  className="col-span-2 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Add form */}
        <div className="mt-3 rounded-xl border border-dashed border-slate-300 p-3 dark:border-slate-700">
          <div className="grid grid-cols-2 gap-2">
            <input
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              placeholder="Tên (vd: GPT lớp 10A)"
              aria-label="Tên provider mới"
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
            />
            <input
              value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
              placeholder="model (o4-mini)"
              aria-label="Model provider mới"
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
            />
            <input
              type="password"
              value={form.apiKey}
              onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
              placeholder="sk-… (API key)"
              aria-label="API key provider mới"
              autoComplete="off"
              className="col-span-2 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
            />
          </div>
          <button
            className="btn-primary mt-2 w-full"
            disabled={!form.apiKey.trim()}
            onClick={() => {
              onAdd(form)
              setForm({ label: '', model: 'o4-mini', apiKey: '', baseUrl: 'https://api.openai.com/v1' })
            }}
          >
            <Plus className="h-4 w-4" /> Thêm provider
          </button>
        </div>
      </div>

      {/* Admin PIN */}
      <Row
        label={adminPinHash ? 'Đổi mã PIN quản trị' : 'Đặt mã PIN quản trị'}
        hint={adminPinHash ? 'Nhập PIN mới rồi lưu.' : 'Đặt PIN để ẩn key khỏi học sinh (chỉ admin sửa được).'}
      >
        <div className="flex items-center gap-2">
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="PIN"
            aria-label="Mã PIN quản trị"
            className="w-24 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
          />
          <button
            className="btn-secondary"
            disabled={!pin.trim()}
            onClick={() => {
              onSetPin(pin.trim())
              setPin('')
            }}
          >
            <ShieldCheck className="h-4 w-4" /> Lưu PIN
          </button>
        </div>
      </Row>
    </>
  )
}

function StudentPanel({ hasProviders, onUnlock }: { hasProviders: boolean; onUnlock: (pin: string) => boolean }) {
  const [pin, setPin] = useState('')
  const [err, setErr] = useState<string | null>(null)
  return (
    <>
      {!hasProviders && (
        <p className="py-3.5 text-sm text-slate-500">Trợ lý chưa được cấu hình. Nhờ giáo viên (quản trị viên) thiết lập giúp nhé.</p>
      )}
      <Row label="Quản trị viên?" hint="Nhập mã PIN để mở khóa quản lý API key/model.">
        <div className="flex items-center gap-2">
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Mã PIN"
            aria-label="Mã PIN quản trị"
            className="w-28 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
          />
          <button
            className="btn-secondary"
            onClick={() => {
              const ok = onUnlock(pin.trim())
              setErr(ok ? null : 'PIN không đúng.')
              setPin('')
            }}
          >
            <Unlock className="h-4 w-4" /> Mở khóa
          </button>
        </div>
      </Row>
      {err && <p className="pb-2 text-sm text-rose-500">{err}</p>}
      <p className="flex items-center gap-1.5 pt-1 text-xs text-slate-400">
        <KeyRound className="h-3 w-3" /> Bạn đang ở chế độ học sinh — chỉ chọn model & học, không xem/sửa được key.
      </p>
    </>
  )
}
