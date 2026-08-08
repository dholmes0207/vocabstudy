import express from 'express'
import cookieParser from 'cookie-parser'
import path from 'node:path'
import { PORT, isProd } from './env.ts'
import './db.ts' // initialize schema on boot
import authRoutes from './routes/auth.ts'
import progressRoutes from './routes/progress.ts'
import adminRoutes from './routes/admin.ts'
import aiRoutes from './routes/ai.ts'

const app = express()
app.disable('x-powered-by')
app.use(express.json({ limit: '2mb' }))
app.use(cookieParser())

app.get('/api/health', (_req, res) => res.json({ ok: true, env: isProd ? 'production' : 'development' }))
app.use('/api/auth', authRoutes)
app.use('/api/progress', progressRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/ai', aiRoutes)

// Unknown API route -> JSON 404 (don't fall through to the SPA).
app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }))

// In production, serve the built SPA and let client routing handle the rest.
if (isProd) {
  const dist = path.join(process.cwd(), 'dist')
  app.use(express.static(dist))
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')))
}

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API on http://localhost:${PORT} (${isProd ? 'production' : 'development'})`)
})
