import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { UserPlus } from 'lucide-react';
import { toast } from 'react-toastify';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
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

    if (formData.password.length < 6) {
      toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    setIsSubmitting(true);

    // تجهيز البيانات للإرسال (استبعاد تأكيد كلمة المرور)
    const userData = {
      name: formData.name,
      email: formData.email,
      password: formData.password
    };

    const success = await register(userData);
    setIsSubmitting(false);

    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
            <UserPlus className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            إنشاء حساب جديد
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            انضم إلينا واستمتع بأفضل العروض
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label="الاسم الكامل"
              name="name"
              type="text"
              required
              placeholder="محمد أحمد"
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
            className="w-full bg-green-600 hover:bg-green-700 focus:ring-green-500"
            size="lg"
            isLoading={isSubmitting}
          >
            تسجيل
          </Button>
        </form>

        <div className="text-center mt-4">
           <p className="text-sm text-gray-600">
             لديك حساب بالفعل؟{' '}
             <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
               سجل دخولك هنا
             </Link>
           </p>
        </div>
      </div>
    </div>
  );
};

export default Register;