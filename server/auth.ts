import type { NextFunction, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { JWT_SECRET, isProd } from './env.ts'
import { db, type UserRow } from './db.ts'

const COOKIE = 'vs_token'

export type AuthedRequest = Request & { user?: UserRow }

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10)
}
export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}

export function signToken(userId: number): string {
  return jwt.sign({ uid: userId }, JWT_SECRET, { expiresIn: '30d' })
}

export function setAuthCookie(res: Response, token: string): void {
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: '/',
  })
}
export function clearAuthCookie(res: Response): void {
  res.clearCookie(COOKIE, { path: '/' })
}

function userFromRequest(req: Request): UserRow | null {
  const token = (req as AuthedRequest & { cookies?: Record<string, string> }).cookies?.[COOKIE]
  if (!token) return null
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { uid: number }
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(payload.uid) as UserRow | undefined
    return user ?? null
  } catch {
    return null
  }
}

/** Require a logged-in, active user. Attaches req.user. */
export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction): void {
  const user = userFromRequest(req)
  if (!user) {
    res.status(401).json({ error: 'Chưa đăng nhập.' })
    return
  }
  if (user.status === 'locked') {
    res.status(403).json({ error: 'Tài khoản đã bị khoá.' })
    return
  }
  req.user = user
  next()
}

/** Require one of the given roles (use after requireAuth in the chain). */
export function requireRole(...roles: UserRow['role'][]) {
  return (req: AuthedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Không có quyền truy cập.' })
      return
    }
    next()
  }
}
