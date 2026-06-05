import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const requiredEnv = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_PUBLISHABLE_KEY',
  ]

  if (command === 'build') {
    for (const name of requiredEnv) {
      if (!env[name]) {
        throw new Error(`Missing environment variable: ${name}`)
      }
    }
  }

  return {
    plugins: [react(), tailwindcss()],
  }
})
