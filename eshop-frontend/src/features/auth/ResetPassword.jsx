import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { Lock, KeyRound } from 'lucide-react';
import { toast } from 'react-toastify';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { checkAuth } = useAuth();

  const [email, setEmail] = useState(location.state?.email || '');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
      if(!email) {
          navigate('/forgot-password');
      }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return toast.error('كلمات المرور غير متطابقة');
    if (password.length < 6) return toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');

    setIsSubmitting(true);
    try {
      const res = await authApi.resetPassword({ email, code, password });
      if (res.success) {
          localStorage.setItem('token', res.token);
          await checkAuth();

          toast.success('تم تغيير كلمة المرور بنجاح! 🎉');
          navigate('/');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'فشل تغيير كلمة المرور. تأكد من صحة الكود.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
            <div className="mx-auto h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                <KeyRound className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">تغيير كلمة المرور</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                أدخل الرمز الذي وصلك عبر البريد وكلمة المرور الجديدة.
            </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input label="البريد الإلكتروني" value={email} disabled className="opacity-70 bg-gray-50" />

          <Input
            label="رمز التحقق (OTP)"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            placeholder="123456"
            className="text-center text-lg tracking-widest font-mono"
          />

          <Input
            label="كلمة المرور الجديدة"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            icon={<Lock className="h-5 w-5" />}
          />

          <Input
            label="تأكيد كلمة المرور"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            icon={<Lock className="h-5 w-5" />}
          />

          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            تغيير كلمة المرور والدخول
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default ResetPassword;