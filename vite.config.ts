import { TanStackRouterVite } from '@tanstack/router-vite-plugin'
import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), TanStackRouterVite()],
  resolve: { alias: { '@': '/src' } },
  server: { port: 3000 },
  preview: { port: 3000 },
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
})
