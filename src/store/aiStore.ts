import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AIProvider } from '@/types'

// ============================================================================
// AI configuration + ROLES.
//
// - Admin manages a list of providers (model + API key). Students only pick a
//   provider by label and chat — they never see or edit keys.
// - Roles are gated by an admin PIN. When no PIN is set the app is in open
//   "setup" mode (first user acts as admin). Once a PIN is set, students are
//   locked out of key management until someone unlocks with the PIN.
//
// ⚠️ This is a CLIENT-SIDE, organizational boundary — NOT a hard security
// boundary (localStorage is readable in the browser). For real protection,
// route requests through a backend proxy that holds keys and enforces roles
// (point a provider's baseUrl at that proxy).
//
// Persisted under "vocab-ai.v1" (no "vocab." prefix ⇒ excluded from backups).
// `adminUnlocked` is session-only (never persisted) so closing the app relocks.
// ============================================================================

const DEFAULT_BASE = 'https://api.openai.com/v1'

interface AIState {
  providers: AIProvider[]
  selectedProviderId: string | null
  adminPinHash: string | null
  adminUnlocked: boolean

  addProvider: (p: Omit<AIProvider, 'id'>) => void
  updateProvider: (id: string, patch: Partial<Omit<AIProvider, 'id'>>) => void
  removeProvider: (id: string) => void
  selectProvider: (id: string) => void

  setAdminPin: (pin: string) => void
  unlockAdmin: (pin: string) => boolean
  lockAdmin: () => void
}

/** Tiny non-cryptographic hash (djb2). Deters casual peeking, not real security. */
function hashPin(pin: string): string {
  let h = 5381
  for (let i = 0; i < pin.length; i++) h = ((h << 5) + h + pin.charCodeAt(i)) | 0
  return (h >>> 0).toString(36)
}

function newId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `p_${Date.now().toString(36)}`
}

export const useAI = create<AIState>()(
  persist(
    (set, get) => ({
      providers: [],
      selectedProviderId: null,
      adminPinHash: null,
      adminUnlocked: false,

      addProvider: (p) =>
        set((s) => {
          const provider: AIProvider = {
            id: newId(),
            label: p.label.trim() || 'Provider',
            model: p.model.trim() || 'o4-mini',
            apiKey: p.apiKey.trim(),
            baseUrl: p.baseUrl.trim() || DEFAULT_BASE,
          }
          return {
            providers: [...s.providers, provider],
            selectedProviderId: s.selectedProviderId ?? provider.id,
          }
        }),

      updateProvider: (id, patch) =>
        set((s) => ({
          providers: s.providers.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),

      removeProvider: (id) =>
        set((s) => {
          const providers = s.providers.filter((p) => p.id !== id)
          const selectedProviderId =
            s.selectedProviderId === id ? (providers[0]?.id ?? null) : s.selectedProviderId
          return { providers, selectedProviderId }
        }),

      selectProvider: (id) => set({ selectedProviderId: id }),

      // Setting a PIN keeps the current session unlocked (admin stays admin);
      // it only gates future sessions / after an explicit lock.
      setAdminPin: (pin) => set({ adminPinHash: pin ? hashPin(pin) : null, adminUnlocked: true }),
      unlockAdmin: (pin) => {
        const ok = get().adminPinHash !== null && hashPin(pin) === get().adminPinHash
        if (ok) set({ adminUnlocked: true })
        return ok
      },
      lockAdmin: () => set({ adminUnlocked: false }),
    }),
    {
      name: 'vocab-ai.v1',
      version: 2,
      // Never persist the session unlock flag.
      partialize: (s) => ({
        providers: s.providers,
        selectedProviderId: s.selectedProviderId,
        adminPinHash: s.adminPinHash,
      }),
      // Migrate the v1 single-key shape into a provider.
      migrate: (persisted: unknown, version: number) => {
        const p = (persisted ?? {}) as Record<string, unknown>
        if (version < 2) {
          const providers: AIProvider[] = []
          if (typeof p.apiKey === 'string' && p.apiKey) {
            providers.push({
              id: 'default',
              label: 'Mặc định',
              model: (p.model as string) || 'o4-mini',
              apiKey: p.apiKey,
              baseUrl: (p.baseUrl as string) || DEFAULT_BASE,
            })
          }
          return { providers, selectedProviderId: providers[0]?.id ?? null, adminPinHash: null }
        }
        return p
      },
    },
  ),
)

/** The provider currently in use (selected, or the first available). */
export function getActiveProvider(): AIProvider | null {
  const { providers, selectedProviderId } = useAI.getState()
  if (!providers.length) return null
  return providers.find((p) => p.id === selectedProviderId) ?? providers[0]
}

/** True when an active provider with a key exists. */
export function isAIConfigured(): boolean {
  const p = getActiveProvider()
  return !!p && p.apiKey.length > 0
}

/** Admin when no PIN has been set yet (setup) or the session is unlocked. */
export function isAdmin(state: Pick<AIState, 'adminPinHash' | 'adminUnlocked'>): boolean {
  return state.adminPinHash === null || state.adminUnlocked
}
