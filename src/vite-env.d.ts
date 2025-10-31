/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_EVOLUTION_API_URL: string
  readonly VITE_EVOLUTION_API_TOKEN: string
  readonly VITE_EVOLUTION_INSTANCE_NAME: string
  readonly VITE_EVOLUTION_SENDER: string
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

