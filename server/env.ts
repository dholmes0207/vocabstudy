import path from 'node:path'

// Server configuration from environment (see .env.example).
export const NODE_ENV = process.env.NODE_ENV ?? 'development'
export const isProd = NODE_ENV === 'production'

export const PORT = Number(process.env.PORT) || 8787

export const JWT_SECRET = process.env.JWT_SECRET || 'dev-insecure-secret-change-me'

export const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'server', 'data.sqlite')

// Server-side OpenAI defaults (used when no active DB provider exists). The key
// NEVER leaves the server — students call /api/ai/chat, not OpenAI directly.
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ''
export const OPENAI_MODEL = process.env.OPENAI_MODEL || 'o4-mini'
export const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'

if (isProd && JWT_SECRET === 'dev-insecure-secret-change-me') {
  // eslint-disable-next-line no-console
  console.warn('⚠️  JWT_SECRET is using the insecure default in production. Set JWT_SECRET!')
}
