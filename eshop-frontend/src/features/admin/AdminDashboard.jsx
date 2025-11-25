import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import Spinner from '../../components/ui/Spinner';
import { Users, ShoppingBag, DollarSign, Package, Store } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Card from '../../components/ui/Card';

const StatCard = ({ title, value, icon: Icon, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
  >
    <Card className="border-l-4" style={{ borderLeftColor: color.replace('text-', '').replace('bg-', '') }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {value}
          </p>
        </div>
        <div className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('500', '100')} dark:bg-opacity-20`}>
          <Icon className={`h-6 w-6 ${color}`} aria-hidden="true" />
        </div>
      </div>
    </Card>
  </motion.div>
);

const formatCurrency = (value, currency) => {
    const num = parseFloat(value);
    if (isNaN(num) || !isFinite(num)) return `${currency} 0.00`;
    return `${currency} ${num.toFixed(2)}`;
};

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminApi.getStats();
        if (res.success) {
          setStats(res.data);
        }
      } catch (error) {
        console.error('Failed to fetch admin stats', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" variant="primary" />
      </div>
    );
  }

  // عملة افتراضية إذا لم تكن موجودة في الترجمة
  const currencySymbol = t('common.currency') || '$';

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('admin.dashboard_overview') || 'System Overview'}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          {t('admin.dashboard_subtitle') || 'Welcome back, here is what is happening with your store today.'}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={t('admin.stats.total_revenue') || 'Total Admin Revenue'}
          value={formatCurrency(stats?.totalAdminRevenue, currencySymbol)}
          icon={DollarSign}
          color="text-green-500"
          delay={0.1}
        />
        <StatCard
          title={t('admin.stats.total_orders') || 'Total Orders'}
          value={stats?.orders || 0}
          icon={ShoppingBag}
          color="text-blue-500"
          delay={0.2}
        />
        <StatCard
          title={t('admin.stats.total_users') || 'Total Users'}
          value={stats?.users || 0}
          icon={Users}
          color="text-indigo-500"
          delay={0.3}
        />
        <StatCard
          title={t('admin.stats.total_products') || 'Total Products'}
          value={stats?.products || 0}
          icon={Package}
          color="text-orange-500"
          delay={0.4}
        />
        <StatCard
          title={t('admin.stats.total_vendors') || 'Total Vendors'}
          value={stats?.vendors || 0}
          icon={Store}
          color="text-purple-500"
          delay={0.5}
        />
      </div>

      {/* يمكن إضافة رسوم بيانية أو جداول ملخص هنا مستقبلاً */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* مثال لمكان الرسوم البيانية */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 h-64 flex items-center justify-center text-gray-400 dark:text-gray-500"
        >
            {t('admin.charts_placeholder') || 'Charts will appear here'}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;