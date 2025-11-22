import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateProfileApi } from '../../api/authApi'; // لخدمة تحديث الملف الشخصي
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

// ==========================================================
// أيقونات SVG المضمنة (لتجنب أخطاء مكتبات react-icons)
// ==========================================================

const IconUserCircle = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-5.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM9.5 15a4.5 4.5 0 005.5-4.5h-11a4.5 4.5 0 005.5 4.5z" clipRule="evenodd" />
  </svg>
);

const IconEnvelope = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path d="M3 4a2 2 0 00-2 2v8a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2H3zm16 2.062a.75.75 0 01-.19.467l-7.5 4.5a.75.75 0 01-.62 0l-7.5-4.5a.75.75 0 01.328-1.393L10 9.062l6.562-3.967a.75.75 0 01.376 1.48z" />
  </svg>
);

const IconTag = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9.69 11.234l-1.076-1.075.055-.055.234-.234A5.5 5.5 0 0110 5.5V4.75a.75.75 0 011.5 0v.75a4 4 0 10-6.177 3.328l-.348.348-.124.125a4.5 4.5 0 106.363 6.364l1.205-1.205c.106-.106.184-.216.234-.328.05-.112.065-.219.065-.328v-1.25zM15.5 13a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75z" clipRule="evenodd" />
  </svg>
);

/**
 * مكون صفحة الملف الشخصي (Profile Page)
 * يسمح للمستخدم بعرض وتحديث بياناته الأساسية.
 * هذا المسار محمي بواسطة ProtectedRoute.
 */
const Profile = () => {
  const { user, fetchProfile, logout } = useAuth();

  // الحالة الأولية للنموذج تعتمد على بيانات المستخدم الحالية
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);

  // تحديث الحقول إذا تغيرت بيانات المستخدم (بعد تسجيل دخول جديد أو تحديث)
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setMessage(null);

    try {
      const dataToUpdate = { name, email };

      // التحقق من أن البيانات تغيرت قبل الإرسال (تحسين الأداء)
      if (name === user.name && email === user.email) {
          setMessage({ type: 'warning', text: 'لم يتم تغيير أي بيانات للحفظ.' });
          setLoading(false);
          return;
      }

      await updateProfileApi(dataToUpdate);

      // إعادة جلب الملف الشخصي لتحديث السياق (AuthContext)
      await fetchProfile();

      setMessage({ type: 'success', text: 'تم تحديث الملف الشخصي بنجاح!' });

    } catch (err) {
      console.error('Update Profile Error:', err);
      setMessage({ type: 'error', text: err.message || 'فشل تحديث البيانات.' });

      // معالجة أخطاء التحقق المفصلة من الـ Backend
      const newErrors = {};
      if (err.details) {
          err.details.forEach(detail => {
              newErrors[detail.field] = detail.message;
          });
      }
      setErrors(newErrors);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-gray-100" style={{ fontFamily: 'var(--font-family)' }}>
        الملف الشخصي
      </h1>

      <div
        className="bg-white dark:bg-gray-800 p-8 shadow-2xl rounded-2xl border-t-4 transition duration-300"
        style={{ borderColor: 'var(--primary-color)' }}
      >

        {/* رسالة حالة (نجاح / خطأ / تحذير) */}
        {message && (
          <div
            className={`p-4 mb-6 rounded-xl font-medium ${message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-300' : message.type === 'warning' ? 'bg-amber-100 text-amber-700 border border-amber-300' : 'bg-red-100 text-red-700 border border-red-300'}`}
          >
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" style={{ direction: 'rtl' }}>

          {/* العمود 1: معلومات ثابتة والدور */}
          <div className="lg:col-span-1 border-b lg:border-b-0 lg:border-l border-gray-200 dark:border-gray-700/50 pb-6 lg:pb-0 lg:pl-8 space-y-6">
            <div className="text-center">
              <IconUserCircle className="w-20 h-20 mx-auto text-gray-400 dark:text-gray-500 mb-3" />
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{user?.name}</h3>
            </div>

            <div className="space-y-3 pt-4">
              <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-600 dark:text-gray-400">
                <IconEnvelope className="w-4 h-4 text-[var(--secondary-color)]" />
                <span>{user?.email}</span>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-600 dark:text-gray-400">
                <IconTag className="w-4 h-4 text-[var(--secondary-color)]" />
                <span className={`font-bold capitalize ${user?.role === 'admin' ? 'text-red-600' : user?.role === 'vendor' ? 'text-orange-500' : 'text-green-600'}`}>
                  الدور: {user?.role}
                </span>
              </div>
            </div>

            {/* زر تسجيل الخروج السريع في الجانب */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700/50">
                <Button variant="outline" onClick={logout} className="w-full mt-4 border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900">
                    تسجيل خروج
                </Button>
            </div>
          </div>

          {/* العمود 2 و 3: نموذج التحديث */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 border-b pb-3 mb-6">تحديث المعلومات</h3>

            <Input
              label="الاسم الكامل"
              type="text"
              placeholder="اسمك الكامل"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              required
            />

            <Input
              label="البريد الإلكتروني"
              type="email"
              placeholder="بريدك الإلكتروني الجديد"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              required
              disabled={user?.role === 'admin'} // قد نحظر تغيير البريد للمشرفين لزيادة الأمان
            />

            <div className="pt-4">
              <Button
                type="submit"
                variant="primary"
                isLoading={loading}
                disabled={loading}
              >
                حفظ التغييرات
              </Button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

export default Profile;