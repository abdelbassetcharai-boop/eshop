import api from './api';

// ====================================================================
// خدمات المصادقة (Auth Services)
// ====================================================================

/**
 * تسجيل دخول المستخدم.
 * @param {object} credentials - يحتوي على email و password.
 */
export const loginApi = (credentials) => api.post('/auth/login', credentials);

/**
 * تسجيل مستخدم جديد.
 * @param {object} data - يحتوي على name, email, password, [role].
 */
export const registerApi = (data) => api.post('/auth/register', data);

/**
 * جلب بيانات الملف الشخصي للمستخدم الحالي.
 */
export const getProfileApi = () => api.get('/auth/profile');

/**
 * تحديث بيانات الملف الشخصي للمستخدم.
 * @param {object} data - البيانات المراد تحديثها (مثل name, email).
 */
export const updateProfileApi = (data) => api.put('/auth/profile', data);

// ====================================================================
// خدمة جلب إعدادات النظام العامة (Headless CMS Bootstrap)
// ====================================================================

/**
 * جلب جميع إعدادات النظام الديناميكية (configs, theme, translations, layout)
 * تُستدعى مرة واحدة عند تحميل التطبيق.
 * @param {string} lang - كود اللغة المطلوب (مثال: 'ar', 'en').
 */
export const getBootstrapApi = (lang = 'ar') => api.get(`/public/bootstrap?lang=${lang}`);