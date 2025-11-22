import React, { useState } from 'react';
import { NavLink, Navigate } from 'react-router-dom';
// المسار الصحيح: من features/auth إلى context/
import { useAuth } from '../../context/AuthContext';
// المسار الصحيح: من features/auth إلى components/ui/
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

/**
 * مكون تسجيل مستخدم جديد (Register Page)
 * يعرض نموذج إدخال الاسم والبريد وكلمة المرور ويتعامل مع منطق التسجيل.
 */
const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer'); // الافتراضي
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState(null);

  const { register, isAuthenticated } = useAuth();

  // إذا كان المستخدم مصادقاً بالفعل، أعد التوجيه إلى الصفحة الرئيسية
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // معالجة أخطاء التحقق من الـ Backend
  const handleErrors = (err) => {
    setGeneralError(err.message);
    const newErrors = {};
    if (err.details) {
        err.details.forEach(detail => {
            // تحويل "field" إلى "field" للعرض تحت الحقل المقابل
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
      await register(name, email, password, role);
      // التوجيه يتم تلقائياً عن طريق Navigate في الأعلى
    } catch (err) {
      console.error('Register Error:', err);
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
          إنشاء حساب جديد
        </h2>

        {/* عرض رسالة خطأ عامة */}
        {generalError && (
          <div className="text-red-500 text-sm mb-6 bg-red-100 dark:bg-red-900 p-4 rounded-xl border border-red-300 dark:border-red-700 font-medium">
            {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ direction: 'rtl' }}>

          <Input
            label="الاسم الكامل"
            type="text"
            placeholder="ادخل اسمك"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            required
          />

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
            placeholder="كلمة المرور (8 أحرف كحد أدنى)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            required
          />

          {/* حقل اختيار الدور (اختياري) */}
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              دور المستخدم
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="shadow-sm border border-gray-300 dark:border-gray-600 rounded-xl w-full py-3 px-4 text-gray-700 dark:text-gray-200 dark:bg-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition"
              style={{ borderRadius: 'var(--border-radius)' }}
            >
              <option value="customer">عميل (للتسوق)</option>
              <option value="vendor">بائع (لإدارة المنتجات)</option>
            </select>
          </div>

          <div className="flex flex-col space-y-4 mt-6">
            <Button
              type="submit"
              variant="primary"
              isLoading={loading}
              disabled={loading}
            >
              إنشاء الحساب
            </Button>

            <NavLink to="/login" className="inline-block align-baseline font-semibold text-sm text-center text-gray-600 dark:text-gray-400 hover:text-[var(--primary-color)] transition duration-150">
              لدي حساب بالفعل؟ تسجيل الدخول
            </NavLink>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;