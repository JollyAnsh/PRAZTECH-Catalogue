import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Exposes the server to local network (0.0.0.0) for mobile access
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true
      }
    }
  },
  preview: {
    host: true,
    port: 3000
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-xlsx': ['xlsx'],
          'vendor-jspdf': ['jspdf']
        }
      }
    },
    chunkSizeWarningLimit: 600
  }
});
