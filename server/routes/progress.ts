import { Router } from 'express'
import { db } from '../db.ts'
import { requireAuth, type AuthedRequest } from '../auth.ts'

// Per-user, per-language progress stored as an opaque JSON blob (the client's
// LanguageProgress: { cards, stats }). Keeps the server agnostic to SRS details.

const router = Router()
router.use(requireAuth)

const LANG_RE = /^[a-z]{2,8}$/

router.get('/:lang', (req: AuthedRequest, res) => {
  const lang = req.params.lang
  if (!LANG_RE.test(lang)) {
    res.status(400).json({ error: 'Mã ngôn ngữ không hợp lệ' })
    return
  }
  const row = db
    .prepare('SELECT dataJson, updatedAt FROM progress WHERE userId = ? AND langCode = ?')
    .get(req.user!.id, lang) as { dataJson: string; updatedAt: string } | undefined
  if (!row) {
    res.json({ data: null, updatedAt: null })
    return
  }
  res.json({ data: JSON.parse(row.dataJson), updatedAt: row.updatedAt })
})

router.put('/:lang', (req: AuthedRequest, res) => {
  const lang = req.params.lang
  if (!LANG_RE.test(lang)) {
    res.status(400).json({ error: 'Mã ngôn ngữ không hợp lệ' })
    return
  }
  const data = req.body?.data
  if (data === undefined || typeof data !== 'object') {
    res.status(400).json({ error: 'Thiếu dữ liệu tiến độ' })
    return
  }
  const now = new Date().toISOString()
  db.prepare(
    `INSERT INTO progress (userId, langCode, dataJson, updatedAt) VALUES (?, ?, ?, ?)
     ON CONFLICT(userId, langCode) DO UPDATE SET dataJson = excluded.dataJson, updatedAt = excluded.updatedAt`,
  ).run(req.user!.id, lang, JSON.stringify(data), now)
  res.json({ updatedAt: now })
})

export default router
