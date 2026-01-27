import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default {
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    // Force a single React copy to avoid invalid hook calls when dependencies
    // resolve React from different locations in nested node_modules.
    dedupe: ['react', 'react-dom'],
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  // Prevent Vite from creating timestamp files that trigger watch restarts
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
    watch: {
      // Don't watch node_modules or dist
      ignored: ['**/node_modules/**', '**/dist/**']
    }
  },
  // Use a custom cache directory to avoid conflicts
  cacheDir: 'node_modules/.vite'
}
