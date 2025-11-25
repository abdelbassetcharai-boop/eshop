import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { Store, UserPlus, Mail, Lock, User } from 'lucide-react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { authApi } from '../../api/authApi';

const RegisterVendor = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    store_name: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // لا نحتاج لاستخدام login هنا لأننا نستخدم authApi مباشرة للتسجيل
  // ولكن قد نحتاج لتحديث الحالة العامة للمستخدم بعد التسجيل
  // const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error(t('auth.password_mismatch') || "Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error(t('auth.password_short') || "Password must be at least 6 characters");
      return;
    }

    setIsSubmitting(true);

    try {
        const vendorData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          store_name: formData.store_name
        };

        const res = await authApi.registerVendor(vendorData);

        if (res.success) {
            localStorage.setItem('token', res.token);
            // هنا يفترض أن AuthContext سيلاحظ التغيير أو نعيد تحميل الصفحة
            // لكن للأمان سنوجه المستخدم للوحة التحكم
            toast.success(t('auth.vendor_success') || 'Registered successfully! Your account is under review.');
            window.location.href = '/vendor/dashboard'; // إعادة تحميل كاملة لضمان تحديث الحالة
        }

    } catch (error) {
        const message = error.response?.data?.error || t('common.error');
        toast.error(message);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">

      {/* خلفية زخرفية */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse-slow pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl animate-pulse-slow pointer-events-none delay-1000"></div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 bg-white/80 dark:bg-dark-card/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700 relative z-10"
      >
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-tr from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30 mb-6 transform rotate-3 hover:rotate-0 transition-transform duration-300">
            <Store className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
            {t('auth.vendor_register_title') || t('auth.vendor_register')}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('auth.vendor_subtitle') || 'Join us and start selling today'}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-5">
            <Input
              label={t('auth.name')}
              name="name"
              type="text"
              required
              placeholder={t('auth.name_placeholder') || "Full Name"}
              value={formData.name}
              onChange={handleChange}
              icon={<User className="h-5 w-5" />}
            />

            <Input
              label={t('auth.email')}
              name="email"
              type="email"
              required
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              icon={<Mail className="h-5 w-5" />}
            />

            <Input
              label={t('auth.store_name') || "Store Name"}
              name="store_name"
              type="text"
              required
              placeholder={t('auth.store_placeholder') || "My Awesome Store"}
              value={formData.store_name}
              onChange={handleChange}
              icon={<Store className="h-5 w-5" />}
            />

            <Input
              label={t('auth.password')}
              name="password"
              type="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              icon={<Lock className="h-5 w-5" />}
            />

             <Input
              label={t('auth.confirm_password') || "Confirm Password"}
              name="confirmPassword"
              type="password"
              required
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              icon={<Lock className="h-5 w-5" />}
            />
          </div>

          <Button
            type="submit"
            className="w-full py-3 text-lg shadow-xl shadow-orange-500/20 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600"
            size="lg"
            isLoading={isSubmitting}
          >
            {t('auth.register_vendor_submit') || t('auth.vendor_register')}
          </Button>
        </form>

        <div className="text-center mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
           <p className="text-sm text-gray-600 dark:text-gray-400">
             {t('auth.buyer_question') || "Are you a buyer?"}{' '}
             <Link to="/register" className="font-bold text-primary-600 hover:text-primary-500 dark:text-primary-400 transition-colors">
               {t('auth.register_title')}
             </Link>
           </p>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterVendor;