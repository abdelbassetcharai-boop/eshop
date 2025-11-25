import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // يسمح باستخدام @ بدلاً من ../../../src
    },
  },
  server: {
    port: 5173,
    proxy: {
      // توجيه طلبات الـ API إلى السيرفر الخلفي
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      // توجيه طلبات الصور المرفوعة محلياً
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // إلغاء خرائط المصدر في الإنتاج لتسريع التحميل وحماية الكود
    chunkSizeWarningLimit: 1000, // رفع حد التحذير لحجم الملفات
    rollupOptions: {
      output: {
        // تقسيم ملفات الـ Vendor الكبيرة (مثل Three.js) لملفات منفصلة لتحسين الكاش
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
});