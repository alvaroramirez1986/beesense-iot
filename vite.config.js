import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuración de Vite optimizada para despliegue estático en Amazon S3 y CloudFront
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['recharts'],
          pdf: ['jspdf', 'jspdf-autotable']
        }
      }
    }
  },
  server: {
    port: 5173,
    host: true
  }
});
