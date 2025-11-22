import React, { useState } from 'react';
import { NavLink, Navigate } from 'react-router-dom';
// تم تعديل المسارات لضمان التوافق المطلق
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

/**
 * مكون تسجيل الدخول (Login Page)
 * يعرض نموذج إدخال البريد وكلمة المرور ويتعامل مع منطق المصادقة والتحقق من الأخطاء.
 */
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState(null);

  const { login, isAuthenticated } = useAuth();

  // إذا كان المستخدم مصادقاً بالفعل، أعد التوجيه إلى الصفحة الرئيسية
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // معالجة أخطاء التحقق من الـ Backend
  const handleErrors = (err) => {
    setGeneralError(err.message);
    const newErrors = {};
    if (err.details) {
        // إذا كانت هناك أخطاء Validation مفصلة (قادمة من Joi)
        err.details.forEach(detail => {
            // تحويل "email" إلى "email" للعرض تحت الحقل المقابل
            newErrors[detail.field] = detail.message;
        });
    }
    setErrors(newErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setGeneralError(null);

    try {
      await login(email, password);
      // التوجيه يتم تلقائياً عن طريق Navigate في الأعلى
    } catch (err) {
      console.error('Login Error:', err);
      handleErrors(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 lg:mt-20">
      <div
        className="p-8 lg:p-10 bg-white dark:bg-gray-800 shadow-2xl rounded-2xl border-t-4 transition duration-300"
        style={{ borderColor: 'var(--primary-color)' }}
      >
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-gray-100" style={{ fontFamily: 'var(--font-family)' }}>
          تسجيل الدخول
        </h2>

        {/* عرض رسالة خطأ عامة */}
        {generalError && (
          <div className="text-red-500 text-sm mb-6 bg-red-100 dark:bg-red-900 p-4 rounded-xl border border-red-300 dark:border-red-700 font-medium">
            {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ direction: 'rtl' }}>

          <Input
            label="البريد الإلكتروني"
            type="email"
            placeholder="ادخل بريدك الإلكتروني"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            required
          />

          <Input
            label="كلمة المرور"
            type="password"
            placeholder="ادخل كلمة المرور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            required
          />

          <div className="flex flex-col space-y-4 mt-6">
            <Button
              type="submit"
              variant="primary"
              isLoading={loading}
              disabled={loading}
            >
              تسجيل الدخول
            </Button>

            <NavLink to="/register" className="inline-block align-baseline font-semibold text-sm text-center text-gray-600 dark:text-gray-400 hover:text-[var(--primary-color)] transition duration-150">
              ليس لديك حساب؟ إنشاء حساب جديد
            </NavLink>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;