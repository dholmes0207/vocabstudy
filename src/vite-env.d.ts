/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
}

/** Short commit of the running build (vite.config.ts `define`), for error reports. */
declare const __BUILD_ID__: string

interface ImportMeta {
  readonly env: ImportMetaEnv
}
