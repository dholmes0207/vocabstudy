import { Router } from 'express'
import { z } from 'zod'
import { db, publicUser, type UserRow } from '../db.ts'
import {
  clearAuthCookie,
  hashPassword,
  requireAuth,
  setAuthCookie,
  signToken,
  verifyPassword,
  type AuthedRequest,
} from '../auth.ts'

const router = Router()

const registerSchema = z.object({
  email: z.string().email('Email không hợp lệ').max(200),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự').max(200),
  name: z.string().max(80).optional(),
})
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(200),
})

// --- Simple in-memory brute-force throttle (per email+ip) -------------------
const attempts = new Map<string, { n: number; ts: number }>()
const WINDOW = 15 * 60 * 1000
const MAX_ATTEMPTS = 8
function tooMany(key: string): boolean {
  const now = Date.now()
  const rec = attempts.get(key)
  if (!rec || now - rec.ts > WINDOW) return false
  return rec.n >= MAX_ATTEMPTS
}
function noteFail(key: string): void {
  const now = Date.now()
  const rec = attempts.get(key)
  if (!rec || now - rec.ts > WINDOW) attempts.set(key, { n: 1, ts: now })
  else rec.n++
}
function clearAttempts(key: string): void {
  attempts.delete(key)
}

router.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ' })
    return
  }
  const { email, password, name } = parsed.data
  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase())
  if (exists) {
    res.status(409).json({ error: 'Email đã được đăng ký.' })
    return
  }
  // The very first account becomes the admin (owner of this instance).
  const count = (db.prepare('SELECT COUNT(*) AS c FROM users').get() as { c: number }).c
  const role = count === 0 ? 'admin' : 'student'
  const passwordHash = await hashPassword(password)
  const now = new Date().toISOString()
  const info = db
    .prepare('INSERT INTO users (email, passwordHash, name, role, status, createdAt) VALUES (?, ?, ?, ?, ?, ?)')
    .run(email.toLowerCase(), passwordHash, name ?? '', role, 'active', now)
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid) as UserRow
  setAuthCookie(res, signToken(user.id))
  res.json({ user: publicUser(user) })
})

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Email hoặc mật khẩu không hợp lệ' })
    return
  }
  const { email, password } = parsed.data
  const key = `${req.ip}:${email.toLowerCase()}`
  if (tooMany(key)) {
    res.status(429).json({ error: 'Đăng nhập sai quá nhiều lần. Thử lại sau ít phút.' })
    return
  }
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase()) as UserRow | undefined
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    noteFail(key)
    res.status(401).json({ error: 'Email hoặc mật khẩu không đúng.' })
    return
  }
  if (user.status === 'locked') {
    res.status(403).json({ error: 'Tài khoản đã bị khoá. Liên hệ quản trị viên.' })
    return
  }
  clearAttempts(key)
  db.prepare('UPDATE users SET lastLoginAt = ? WHERE id = ?').run(new Date().toISOString(), user.id)
  setAuthCookie(res, signToken(user.id))
  res.json({ user: publicUser(user) })
})

router.post('/logout', (_req, res) => {
  clearAuthCookie(res)
  res.json({ ok: true })
})

router.get('/me', requireAuth, (req: AuthedRequest, res) => {
  res.json({ user: publicUser(req.user!) })
})

export default router
