import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import { toast } from 'react-toastify';
import { Globe, Mail, AlertOctagon, Save } from 'lucide-react'; // تم إزالة CreditCard لأنه غير مستخدم
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

const SystemSettings = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settings, setSettings] = useState({
    siteName: '',
    supportEmail: '',
    currency: 'USD',
    maintenanceMode: 'false'
  });

  // 1. جلب الإعدادات الحالية
  useEffect(() => {
    const fetchCurrentSettings = async () => {
      try {
        // نفترض أن API /admin/settings موجود ويجلب الإعدادات
        // في حال عدم وجوده، سنستخدم بيانات bootstrap الأولية كـ fallback
        // ملاحظة: تم تعديل الباك إند سابقاً لدعم هذه الدالة بشكل مؤقت
        const res = await adminApi.getSystemSettings();
        if (res.success && res.data) {
          // يجب تحويل maintenanceMode إلى سلسلة نصية للتوافق مع حقل select
          setSettings({
            ...res.data,
            maintenanceMode: String(res.data.maintenanceMode)
          });
        }
      } catch (error) {
        // نستخدم بيانات افتراضية إذا فشل الجلب (لمنع توقف الواجهة)
        setSettings({
          siteName: t('admin.default_site_name') || 'EShop Platform',
          supportEmail: 'support@eshop.com',
          currency: 'USD',
          maintenanceMode: 'false'
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchCurrentSettings();
  }, [t]);

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // تحويل وضع الصيانة إلى قيمة منطقية (Boolean) قبل الإرسال
    const dataToSend = {
        ...settings,
        maintenanceMode: settings.maintenanceMode === 'true'
    };

    try {
      // نستخدم API للـ PUT (للتحديث)
      await adminApi.updateSystemSettings(dataToSend);
      toast.success(t('common.success_update') || 'Settings saved successfully!');
    } catch (error) {
      toast.error(t('common.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" variant="primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <Card>
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
            <div className="bg-primary-100 dark:bg-primary-900/30 p-2 rounded-full">
                <Globe className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {t('admin.system_settings') || 'System Settings'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('admin.settings_desc') || 'Control the basic configuration of your store.'}
                </p>
            </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
                label={t('admin.site_name') || 'Site Name'}
                name="siteName"
                value={settings.siteName}
                onChange={handleChange}
                icon={<Globe className="h-5 w-5" />}
            />

            <Input
                label={t('admin.support_email') || 'Support Email'}
                name="supportEmail"
                type="email"
                value={settings.supportEmail}
                onChange={handleChange}
                icon={<Mail className="h-5 w-5" />}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
                label={t('admin.currency') || 'Default Currency'}
                name="currency"
                value={settings.currency}
                onChange={handleChange}
                options={[
                    { value: 'USD', label: t('admin.currency_usd') || 'US Dollar ($)' },
                    { value: 'EUR', label: t('admin.currency_eur') || 'Euro (€)' },
                    { value: 'SAR', label: t('admin.currency_sar') || 'Saudi Riyal (SAR)' },
                ]}
            />

            <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-200 dark:border-red-900/50">
                <label className="block text-sm font-bold text-red-800 dark:text-red-400 mb-2 flex items-center gap-2">
                    <AlertOctagon className="h-4 w-4" />
                    {t('admin.maintenance_mode') || 'Maintenance Mode'}
                </label>
                <select
                    name="maintenanceMode"
                    value={settings.maintenanceMode}
                    onChange={handleChange}
                    className="w-full border-red-300 dark:border-red-900 rounded-lg text-red-900 dark:text-red-300 focus:ring-red-500 bg-white dark:bg-dark-card"
                >
                    <option value="false">{t('admin.mode_off') || 'Online (Active)'}</option>
                    <option value="true">{t('admin.mode_on') || 'Maintenance (Closed)'}</option>
                </select>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-end">
            <Button type="submit" isLoading={isSubmitting} className="shadow-lg shadow-primary-500/20 w-full md:w-auto flex items-center gap-2">
                <Save className="h-4 w-4" />
                {t('common.save_changes') || 'Save Changes'}
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  );
};

export default SystemSettings;