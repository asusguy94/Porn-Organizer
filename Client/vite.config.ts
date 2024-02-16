import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  preview: {
    port: 3000,
    strictPort: false
  },
  server: {
    host: true,
    port: 3000,
    strictPort: true,
    watch: {
      // usePolling: true, // is this required?
    }
  }
})
