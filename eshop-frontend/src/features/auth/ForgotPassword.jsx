import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { Mail, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('يرجى إدخال البريد الإلكتروني');

    setIsSubmitting(true);
    try {
      await authApi.forgotPassword(email);
      toast.success('تم إرسال رمز التحقق إلى بريدك الإلكتروني');
      // الانتقال لصفحة إعادة التعيين مع تمرير الإيميل
      navigate('/reset-password', { state: { email } });
    } catch (error) {
      toast.error(error.response?.data?.error || 'حدث خطأ، تأكد من صحة البريد الإلكتروني');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
            <div className="mx-auto h-12 w-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-4">
                <Mail className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">نسيت كلمة المرور؟</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                أدخل بريدك الإلكتروني وسنرسل لك رمزاً لاستعادة حسابك.
            </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="البريد الإلكتروني"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="name@example.com"
            icon={<Mail className="h-5 w-5" />}
          />

          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            إرسال الرمز
          </Button>
        </form>

        <div className="mt-6 text-center">
            <button
                onClick={() => navigate('/login')}
                className="text-sm text-gray-600 hover:text-primary-600 flex items-center justify-center gap-2 mx-auto"
            >
                <ArrowLeft className="h-4 w-4" /> العودة لتسجيل الدخول
            </button>
        </div>
      </Card>
    </div>
  );
};

export default ForgotPassword;