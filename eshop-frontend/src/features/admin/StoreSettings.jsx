import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import { toast } from 'react-toastify';
import { Settings, Truck, CreditCard, Banknote, Save } from 'lucide-react';
import { motion } from 'framer-motion';

const StoreSettings = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settings, setSettings] = useState({
    tax_rate: '0.15',
    shipping_fee: '20',
    free_shipping_threshold: '500',
    currency_symbol: 'د.م.',
    enable_cod: 'true',
    enable_stripe: 'false'
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/admin/settings');
        if (res.data.success && res.data.data) {
            setSettings(prev => ({ ...prev, ...res.data.data }));
        }
      } catch (error) {
        toast.error('فشل تحميل الإعدادات');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
        ...settings,
        [name]: type === 'checkbox' ? String(checked) : value
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.put('/admin/settings', settings);
      toast.success('تم حفظ إعدادات المتجر بنجاح! 🎉');
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      toast.error('حدث خطأ أثناء الحفظ');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="flex justify-center p-10"><Spinner size="lg" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6">
      <Card>
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
            <div className="bg-primary-100 dark:bg-primary-900/30 p-2 rounded-full">
                <Settings className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">إعدادات المتجر</h2>
                <p className="text-sm text-gray-500">التحكم في الأسعار، الشحن، وطرق الدفع.</p>
            </div>
        </div>

        <form onSubmit={handleSave} className="space-y-8">

          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-200">
                <Truck className="h-5 w-5" /> الشحن والضريبة
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input label="نسبة الضريبة (مثال: 0.15 لـ 15%)" name="tax_rate" type="number" step="0.01" value={settings.tax_rate} onChange={handleChange} />
                <Input label="تكلفة الشحن الثابتة (د.م.)" name="shipping_fee" type="number" value={settings.shipping_fee} onChange={handleChange} />
                <Input label="شحن مجاني للطلبات فوق (د.م.)" name="free_shipping_threshold" type="number" value={settings.free_shipping_threshold} onChange={handleChange} />
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-700 my-4"></div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-200">
                <CreditCard className="h-5 w-5" /> العملة وطرق الدفع
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <Input label="رمز العملة" name="currency_symbol" value={settings.currency_symbol} onChange={handleChange} placeholder="د.م." />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${settings.enable_cod === 'true' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" name="enable_cod" checked={settings.enable_cod === 'true'} onChange={handleChange} className="w-5 h-5 text-green-600 rounded" />
                        <div>
                            <span className="font-bold block text-gray-900 dark:text-white">الدفع عند الاستلام (COD)</span>
                            <span className="text-xs text-gray-500">تفعيل خيار الدفع النقدي عند التوصيل.</span>
                        </div>
                        <Banknote className="h-6 w-6 ml-auto text-gray-400" />
                    </label>
                </div>

                <div className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${settings.enable_stripe === 'true' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" name="enable_stripe" checked={settings.enable_stripe === 'true'} onChange={handleChange} className="w-5 h-5 text-primary-600 rounded" />
                        <div>
                            <span className="font-bold block text-gray-900 dark:text-white">الدفع بالبطاقة (Stripe)</span>
                            <span className="text-xs text-gray-500">استقبال المدفوعات الإلكترونية عبر Stripe.</span>
                        </div>
                        <CreditCard className="h-6 w-6 ml-auto text-gray-400" />
                    </label>
                </div>
            </div>
          </div>

          <div className="pt-6 flex justify-end">
            <Button type="submit" isLoading={isSubmitting} className="w-full md:w-auto flex items-center gap-2 px-8">
                <Save className="h-4 w-4" /> حفظ الإعدادات
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  );
};

export default StoreSettings;