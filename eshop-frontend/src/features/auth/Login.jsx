import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { LogIn, Mail, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const Login = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const success = await login(formData);
    setIsSubmitting(false);
    if (success) {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">

      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-pulse-slow pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl animate-pulse-slow pointer-events-none delay-1000"></div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 bg-white/80 dark:bg-dark-card/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700 relative z-10"
      >
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-tr from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30 mb-6 transform rotate-3 hover:rotate-0 transition-transform duration-300">
            <LogIn className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
            {t('auth.login_title')}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('hero.subtitle').split('.')[0]}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-5">
            <Input
              label={t('auth.email')}
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              icon={<Mail className="h-5 w-5" />}
            />

            <div>
              <Input
                label={t('auth.password')}
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                icon={<Lock className="h-5 w-5" />}
              />
              <div className="flex justify-end mt-1">
                {/* رابط نسيت كلمة المرور الجديد */}
                <Link to="/forgot-password" className="text-xs font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 transition-colors">
                  {t('auth.forgot_password') || 'نسيت كلمة المرور؟'}
                </Link>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full py-3 text-lg shadow-xl shadow-primary-500/20"
            size="lg"
            isLoading={isSubmitting}
          >
            {t('nav.login')}
          </Button>
        </form>

        <div className="text-center mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
           <p className="text-sm text-gray-600 dark:text-gray-400">
             {t('auth.no_account') || "Don't have an account?"}{' '}
             <Link to="/register" className="font-bold text-primary-600 hover:text-primary-500 dark:text-primary-400 transition-colors">
               {t('auth.register_title')}
             </Link>
           </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;