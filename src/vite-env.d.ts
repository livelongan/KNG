/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_ROUTE_DEBUG_DELAY_MS?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
