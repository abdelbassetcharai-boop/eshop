import React from 'react';
// يفترض استخدام createRoot بدلاً من ReactDOM.render
import { createRoot } from 'react-dom/client';
import App from './App'; // استيراد المكون الرئيسي (الملف 33)
// يجب استيراد ملف الـ CSS الرئيسي هنا في المشاريع الحقيقية.

// ==========================================================
// نقطة الدخول الرئيسية للتطبيق
// ==========================================================

// 1. العثور على العنصر الجذر في HTML
const container = document.getElementById('root');
const root = createRoot(container);

// 2. تحميل المكون الرئيسي App
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

console.log('✅ Frontend Application started successfully.');