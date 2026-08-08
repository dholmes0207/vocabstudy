import Database from 'better-sqlite3'
import { DB_PATH } from './env.ts'

// SQLite via better-sqlite3 — zero-config, file-based, production-viable for
// small/medium apps. To move to Postgres later, swap this data layer (the rest
// of the server talks to it through the typed helpers below).

export const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  email        TEXT UNIQUE NOT NULL,
  passwordHash TEXT NOT NULL,
  name         TEXT NOT NULL DEFAULT '',
  role         TEXT NOT NULL DEFAULT 'student',   -- 'student' | 'admin'
  status       TEXT NOT NULL DEFAULT 'active',    -- 'active' | 'locked'
  createdAt    TEXT NOT NULL,
  lastLoginAt  TEXT
);

CREATE TABLE IF NOT EXISTS progress (
  userId    INTEGER NOT NULL,
  langCode  TEXT NOT NULL,
  dataJson  TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  PRIMARY KEY (userId, langCode),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ai_providers (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  label     TEXT NOT NULL,
  model     TEXT NOT NULL DEFAULT 'o4-mini',
  apiKey    TEXT NOT NULL,
  baseUrl   TEXT NOT NULL DEFAULT 'https://api.openai.com/v1',
  isActive  INTEGER NOT NULL DEFAULT 1,
  createdAt TEXT NOT NULL
);
`)

export interface UserRow {
  id: number
  email: string
  passwordHash: string
  name: string
  role: 'student' | 'admin'
  status: 'active' | 'locked'
  createdAt: string
  lastLoginAt: string | null
}

export interface ProviderRow {
  id: number
  label: string
  model: string
  apiKey: string
  baseUrl: string
  isActive: number
  createdAt: string
}

// Public shape of a user (never leaks passwordHash).
export function publicUser(u: UserRow) {
  return { id: u.id, email: u.email, name: u.name, role: u.role, status: u.status, createdAt: u.createdAt, lastLoginAt: u.lastLoginAt }
}

// Public shape of a provider for students: label + model only, NEVER the key.
export function publicProvider(p: ProviderRow) {
  return { id: p.id, label: p.label, model: p.model, isActive: !!p.isActive }
}
