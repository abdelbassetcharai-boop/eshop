import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { Store, UserPlus } from 'lucide-react';
import { toast } from 'react-toastify';
import { authApi } from '../../api/authApi'; // سنستخدم authApi لـ registerVendor

const RegisterVendor = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    store_name: '' // حقل خاص بالبائع
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth(); // سنستخدم دالة تسجيل الدخول لتسجيل الدخول التلقائي
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("كلمات المرور غير متطابقة");
      return;
    }

    setIsSubmitting(true);

    try {
        const vendorData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          store_name: formData.store_name // إرسال اسم المتجر
        };

        // استخدام المسار الجديد لتسجيل البائع
        const res = await authApi.registerVendor(vendorData);

        if (res.success) {
            // بما أن الـ Backend يعيد التوكن وبيانات المستخدم، نستخدمها لتسجيل الدخول الفوري
            localStorage.setItem('token', res.token);
            // يجب تحديث حالة المصادقة (AuthContext) بشكل صحيح ليتم توجيه المستخدم
            // بدلاً من استدعاء login()، نقوم بتحديث الـ Context يدوياً أو إعادة تحميل المستخدم

            // بما أننا لا نستطيع الوصول لـ setUser مباشرة من هنا، نعتمد على أن
            // الـ AuthContext سيعيد تحميل نفسه (loadUser) عند اكتشاف التوكن الجديد.
            // أو يمكن استخدام دالة login() التي ستعيد تحميل المستخدم تلقائيًا.

            // هنا نعتمد على إعادة توجيه بسيطة ونتوقع من AuthProvider أن يلتقط التغيير
            toast.success('تم تسجيلك كبائع! حسابك قيد المراجعة.');
            navigate('/vendor/dashboard'); // توجيه للوحة البائع
        }

    } catch (error) {
        const message = error.response?.data?.error || 'فشل تسجيل البائع';
        toast.error(message);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
            <Store className="h-6 w-6 text-orange-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            تسجيل بائع جديد
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            انضم إلينا كبائع واعرض منتجاتك
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label="الاسم الكامل"
              name="name"
              type="text"
              required
              placeholder="الاسم"
              value={formData.name}
              onChange={handleChange}
            />

            <Input
              label="البريد الإلكتروني"
              name="email"
              type="email"
              required
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
            />

            <Input
              label="اسم المتجر (سيتم استخدامه في الرابط)"
              name="store_name"
              type="text"
              required
              placeholder="متجري الإلكتروني"
              value={formData.store_name}
              onChange={handleChange}
            />

            <Input
              label="كلمة المرور"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
            />

             <Input
              label="تأكيد كلمة المرور"
              name="confirmPassword"
              type="password"
              required
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-700 focus:ring-orange-500"
            size="lg"
            isLoading={isSubmitting}
          >
            تسجيل كبائع
          </Button>
        </form>

        <div className="text-center mt-4">
           <p className="text-sm text-gray-600">
             هل أنت مشتري فقط؟{' '}
             <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
               أنشئ حساب عميل
             </Link>
           </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterVendor;