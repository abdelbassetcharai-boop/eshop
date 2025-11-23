import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // المنفذ الافتراضي للواجهة الأمامية
    proxy: {
      // توجيه أي طلب يبدأ بـ /api إلى السيرفر الخلفي
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      // توجيه طلبات الصور إلى الباك إند
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});