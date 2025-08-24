import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Allow external connections from network
    port: 5174
  },
  build: {
    // Optimize bundle size
    target: 'es2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        // Keep function names for better debugging
        keep_fnames: true
      }
    } as any,
    // Better code splitting
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Ensure lucide-react icons are bundled properly
          if (id.includes('lucide-react')) {
            return 'icons';
          }
          // React and related
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
            return 'react-vendor';
          }
          // Clerk auth
          if (id.includes('@clerk')) {
            return 'clerk';
          }
          // Query and data fetching
          if (id.includes('@tanstack') || id.includes('axios')) {
            return 'query';
          }
          // Food database
          if (id.includes('food-database')) {
            return 'food-database';
          }
          // Admin pages
          if (id.includes('AdminInvite') || id.includes('AdminMonitor')) {
            return 'admin';
          }
        },
        // Better chunk naming
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `js/${facadeModuleId}-[hash].js`;
        },
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // Set chunk size warnings
    chunkSizeWarningLimit: 500,
    // Source maps for production debugging (optional)
    sourcemap: false
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', '@clerk/clerk-react', '@tanstack/react-query', 'lucide-react']
  }
})
