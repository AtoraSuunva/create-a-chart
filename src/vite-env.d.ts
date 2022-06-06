/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly CF_PAGES: 0 | 1
  readonly CF_PAGES_COMMIT_SHA: string
  readonly CF_PAGES_BRANCH: string
  readonly CF_PAGES_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
