import { Router } from 'express'
import { z } from 'zod'
import { db, publicUser, type ProviderRow, type UserRow } from '../db.ts'
import { hashPassword, requireAuth, requireRole, type AuthedRequest } from '../auth.ts'

// All admin endpoints are gated server-side (requireAuth + requireRole('admin')),
// so hiding buttons on the client is NOT what enforces access — the server does.

const router = Router()
router.use(requireAuth, requireRole('admin'))

// ---- User management -------------------------------------------------------

router.get('/users', (_req, res) => {
  const rows = db.prepare('SELECT * FROM users ORDER BY createdAt DESC').all() as UserRow[]
  res.json({ users: rows.map(publicUser) })
})

const patchUserSchema = z.object({
  role: z.enum(['student', 'admin']).optional(),
  status: z.enum(['active', 'locked']).optional(),
})

router.patch('/users/:id', (req: AuthedRequest, res) => {
  const id = Number(req.params.id)
  const parsed = patchUserSchema.safeParse(req.body)
  if (!parsed.success || (!parsed.data.role && !parsed.data.status)) {
    res.status(400).json({ error: 'Dữ liệu không hợp lệ' })
    return
  }
  if (id === req.user!.id) {
    res.status(400).json({ error: 'Không thể tự đổi vai/khoá chính mình.' })
    return
  }
  const target = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow | undefined
  if (!target) {
    res.status(404).json({ error: 'Không tìm thấy tài khoản' })
    return
  }
  const role = parsed.data.role ?? target.role
  const status = parsed.data.status ?? target.status
  db.prepare('UPDATE users SET role = ?, status = ? WHERE id = ?').run(role, status, id)
  const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow
  res.json({ user: publicUser(updated) })
})

router.post('/users/:id/reset-password', async (req: AuthedRequest, res) => {
  const id = Number(req.params.id)
  const password = z.string().min(6).max(200).safeParse(req.body?.password)
  if (!password.success) {
    res.status(400).json({ error: 'Mật khẩu mới tối thiểu 6 ký tự' })
    return
  }
  const target = db.prepare('SELECT id FROM users WHERE id = ?').get(id)
  if (!target) {
    res.status(404).json({ error: 'Không tìm thấy tài khoản' })
    return
  }
  db.prepare('UPDATE users SET passwordHash = ? WHERE id = ?').run(await hashPassword(password.data), id)
  res.json({ ok: true })
})

router.delete('/users/:id', (req: AuthedRequest, res) => {
  const id = Number(req.params.id)
  if (id === req.user!.id) {
    res.status(400).json({ error: 'Không thể tự xoá chính mình.' })
    return
  }
  const info = db.prepare('DELETE FROM users WHERE id = ?').run(id)
  if (info.changes === 0) {
    res.status(404).json({ error: 'Không tìm thấy tài khoản' })
    return
  }
  res.json({ ok: true })
})

// ---- AI provider management ------------------------------------------------

router.get('/ai-providers', (_req, res) => {
  const rows = db.prepare('SELECT * FROM ai_providers ORDER BY createdAt DESC').all() as ProviderRow[]
  // Admin owns the keys, so they may see them here to edit.
  res.json({ providers: rows.map((p) => ({ ...p, isActive: !!p.isActive })) })
})

const providerSchema = z.object({
  label: z.string().min(1).max(80),
  model: z.string().min(1).max(60).default('o4-mini'),
  apiKey: z.string().min(1).max(300),
  baseUrl: z.string().url().max(300).default('https://api.openai.com/v1'),
})

router.post('/ai-providers', (req, res) => {
  const parsed = providerSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ' })
    return
  }
  const { label, model, apiKey, baseUrl } = parsed.data
  const info = db
    .prepare('INSERT INTO ai_providers (label, model, apiKey, baseUrl, isActive, createdAt) VALUES (?, ?, ?, ?, 1, ?)')
    .run(label, model, apiKey, baseUrl, new Date().toISOString())
  res.json({ id: info.lastInsertRowid })
})

const patchProviderSchema = providerSchema.partial().extend({ isActive: z.boolean().optional() })

router.patch('/ai-providers/:id', (req, res) => {
  const id = Number(req.params.id)
  const parsed = patchProviderSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Dữ liệu không hợp lệ' })
    return
  }
  const cur = db.prepare('SELECT * FROM ai_providers WHERE id = ?').get(id) as ProviderRow | undefined
  if (!cur) {
    res.status(404).json({ error: 'Không tìm thấy provider' })
    return
  }
  const d = parsed.data
  db.prepare('UPDATE ai_providers SET label=?, model=?, apiKey=?, baseUrl=?, isActive=? WHERE id=?').run(
    d.label ?? cur.label,
    d.model ?? cur.model,
    d.apiKey ?? cur.apiKey,
    d.baseUrl ?? cur.baseUrl,
    d.isActive === undefined ? cur.isActive : d.isActive ? 1 : 0,
    id,
  )
  res.json({ ok: true })
})

router.delete('/ai-providers/:id', (req, res) => {
  db.prepare('DELETE FROM ai_providers WHERE id = ?').run(Number(req.params.id))
  res.json({ ok: true })
})

export default router
