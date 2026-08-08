import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// The API key lives in its own persisted store named "vocab-ai.v1". Note the
// key deliberately does NOT start with the "vocab." prefix that backup.ts
// exports — so the API key is never written into a shared backup file.

interface AIState {
  apiKey: string
  model: string
  baseUrl: string
  setApiKey: (k: string) => void
  setModel: (m: string) => void
  setBaseUrl: (u: string) => void
}

export const useAI = create<AIState>()(
  persist(
    (set) => ({
      apiKey: '',
      model: 'o4-mini',
      baseUrl: 'https://api.openai.com/v1',
      setApiKey: (apiKey) => set({ apiKey: apiKey.trim() }),
      setModel: (model) => set({ model: model.trim() || 'o4-mini' }),
      setBaseUrl: (baseUrl) => set({ baseUrl: baseUrl.trim() || 'https://api.openai.com/v1' }),
    }),
    { name: 'vocab-ai.v1' },
  ),
)

/** Whether the assistant is configured (has an API key). */
export function isAIConfigured(): boolean {
  return useAI.getState().apiKey.length > 0
}
