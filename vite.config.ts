import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// Minimal Vite configuration
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});