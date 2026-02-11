import base44 from "@base44/vite-plugin"
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = dirname(fileURLToPath(import.meta.url))
const srcDir = resolve(rootDir, 'Src')

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode ?? process.env.NODE_ENV ?? 'development', rootDir, '')
  const inferredBackendUrl = env.VITE_BASE44_BACKEND_URL
    ?? process.env.VITE_BASE44_BACKEND_URL
    ?? env.VITE_BASE44_APP_BASE_URL
    ?? process.env.VITE_BASE44_APP_BASE_URL
    ?? 'https://api.base44.com'
  const inferredAppBaseUrl = env.VITE_BASE44_APP_BASE_URL
    ?? process.env.VITE_BASE44_APP_BASE_URL
    ?? inferredBackendUrl
  const legacySdkImportsEnabled = (env.BASE44_LEGACY_SDK_IMPORTS ?? process.env.BASE44_LEGACY_SDK_IMPORTS ?? 'true') !== 'false'

  if (!process.env.VITE_BASE44_APP_BASE_URL && inferredAppBaseUrl) {
    process.env.VITE_BASE44_APP_BASE_URL = inferredAppBaseUrl
  }
  if (process.env.BASE44_LEGACY_SDK_IMPORTS === undefined) {
    process.env.BASE44_LEGACY_SDK_IMPORTS = legacySdkImportsEnabled ? 'true' : 'false'
  }

  return {
    logLevel: 'error', // Suppress warnings, only show errors
    resolve: {
      alias: {
        '@': srcDir,
      }
    },
    define: {
      'import.meta.env.VITE_BASE44_BACKEND_URL': JSON.stringify(inferredBackendUrl),
      'import.meta.env.VITE_BASE44_APP_BASE_URL': JSON.stringify(inferredAppBaseUrl),
    },
    plugins: [
      base44({
        // Support for legacy code that imports the base44 SDK with @/integrations, @/entities, etc.
        // can be removed if the code has been updated to use the new SDK imports from @base44/sdk
        legacySDKImports: legacySdkImportsEnabled
      }),
      react(),
    ]
  }
})