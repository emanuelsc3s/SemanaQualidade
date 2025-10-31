/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_EVOLUTION_API_URL: string
  readonly VITE_EVOLUTION_API_TOKEN: string
  readonly VITE_EVOLUTION_INSTANCE_NAME: string
  readonly VITE_EVOLUTION_SENDER: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

