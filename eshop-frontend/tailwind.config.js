/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // تفعيل الوضع المظلم عبر الكلاس
  theme: {
    extend: {
      fontFamily: {
        // الخطوط: Cairo للعربية، Inter للإنجليزية
        sans: ['Inter', 'Cairo', 'sans-serif'],
        heading: ['Poppins', 'Cairo', 'sans-serif'],
      },
      colors: {
        // الألوان الأساسية (تدرجات الأزرق الملكي/الإنديجو)
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1', // اللون الرئيسي
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        // الألوان الثانوية (للإجراءات مثل الأزرار والعروض)
        secondary: {
          50: '#fff7ed',
          100: '#ffedd5',
          500: '#f97316', // برتقالي حيوي
          600: '#ea580c',
          700: '#c2410c',
        },
        // ألوان الوضع المظلم
        dark: {
          bg: '#0f172a',      // خلفية الصفحة في الوضع المظلم
          card: '#1e293b',    // خلفية البطاقات
          text: '#f8fafc',    // النص الرئيسي
          muted: '#94a3b8',   // النص الفرعي
          border: '#334155'   // الحدود
        }
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '4rem',
          xl: '5rem',
          '2xl': '6rem',
        },
      },
      // أنيميشن مخصصة (تكملة لـ Framer Motion)
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}