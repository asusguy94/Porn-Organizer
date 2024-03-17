import { TanStackRouterVite } from '@tanstack/router-vite-plugin'
import react from '@vitejs/plugin-react-swc'
import { defineConfig, loadEnv } from 'vite'

function getEnv(mode: string, key: string): string | undefined {
  const env = loadEnv(mode, process.cwd(), '')
  return env[key]
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), TanStackRouterVite()],
  resolve: { alias: { '@': '/src' } },
  server: { port: Number(getEnv(mode, 'PORT') ?? 3000) },
  preview: { port: Number(getEnv(mode, 'PORT') ?? 3000) },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react'],
          'react-dom': ['react-dom', 'react-dom/server'],
          '@tanstack': ['@tanstack/react-router', '@tanstack/react-query'],
          'react-toastify': ['react-toastify'],
          '@mui': ['@mui/material'],
          '@vidstack': ['@vidstack/react']
        }
      }
    }
  }
}))
