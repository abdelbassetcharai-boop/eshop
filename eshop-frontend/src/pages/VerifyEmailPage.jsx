import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Button from '../components/ui/Button';

const VerifyEmailPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    // دالة التفعيل
    const verify = async () => {
      try {
        // إرسال طلب التفعيل للباك إند
        const res = await api.get(`/auth/verify/${token}`);

        if (res.data.success) {
            // إذا نجح التفعيل، نخزن التوكن (لأن الباك إند يرسل توكن جديد للدخول المباشر)
            if (res.data.token) {
                localStorage.setItem('token', res.data.token);
                await checkAuth(); // تحديث حالة المستخدم في التطبيق
            }
            setStatus('success');
            // الانتظار قليلاً ثم التوجيه للرئيسية
            setTimeout(() => navigate('/'), 3000);
        } else {
            setStatus('error');
            setMessage('فشل التفعيل، يرجى المحاولة مرة أخرى.');
        }
      } catch (error) {
        setStatus('error');
        // عرض رسالة الخطأ القادمة من السيرفر (مثل "التوكن غير صالح")
        setMessage(error.response?.data?.error || 'رابط التفعيل غير صالح أو منتهي الصلاحية.');
      }
    };

    if (token) verify();
  }, [token, navigate, checkAuth]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">

      {status === 'loading' && (
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-16 w-16 text-primary-500 animate-spin" />
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
            جارٍ تفعيل حسابك...
          </h2>
          <p className="text-gray-500">يرجى الانتظار لحظات</p>
        </div>
      )}

      {status === 'success' && (
        <div className="animate-fade-in flex flex-col items-center space-y-4">
          <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">تم تفعيل الحساب بنجاح! 🎉</h2>
          <p className="text-gray-600 dark:text-gray-300">شكراً لك، جاري توجيهك للصفحة الرئيسية...</p>
        </div>
      )}

      {status === 'error' && (
        <div className="animate-fade-in flex flex-col items-center space-y-4">
          <div className="h-20 w-20 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">فشل التفعيل</h2>
          <p className="text-red-500 font-medium">{message}</p>
          <Button onClick={() => navigate('/login')} variant="secondary" className="mt-4">
            العودة لصفحة الدخول
          </Button>
        </div>
      )}
    </div>
  );
};

export default VerifyEmailPage;