import React, { useState, useEffect } from 'react';
import { vendorApi } from '../../api/vendorApi';
import Spinner from '../../components/ui/Spinner';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { DollarSign, Wallet, Package, Clock, Store } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

// تعريف بطاقة الإحصائيات (StatCard) كمكون مساعد داخلي
const StatCard = ({ title, value, icon: Icon, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
    >
      <Card className="border-l-4" style={{ borderLeftColor: color.replace('text-', '').replace('bg-', '') }}>
        <div className="flex items-center justify-between">
            <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
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

const VendorStats = () => {
    const { t } = useTranslation();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        vendorApi.getStats().then(res => {
            if(res.success) setStats(res.data);
            setLoading(false);
        }).catch(err => {
            console.error("Failed to load vendor stats", err);
            toast.error(t('common.error'));
            setLoading(false);
        });
    }, [t]);

    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" variant="secondary" />
        </div>
      );
    }

    const currencySymbol = t('common.currency') || '$';

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {t('vendor.dashboard_overview') || 'Vendor Dashboard Overview'}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    {t('admin.dashboard_subtitle') || 'Monitor your store performance and sales.'}
                </p>
            </motion.div>

            {/* حالة الاعتماد */}
            {stats && !stats.isApproved && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-yellow-100 dark:bg-yellow-900/20 border-l-4 border-yellow-500 text-yellow-800 dark:text-yellow-400 p-4 rounded-xl"
                    role="alert"
                >
                    <p className="font-bold">{t('vendor.status_pending') || 'Pending Approval'}</p>
                    <p className="text-sm">{t('auth.vendor_pending') || 'Your vendor account is pending review. You cannot list products until approved.'}</p>
                </motion.div>
            )}

            {/* الإحصائيات الرئيسية */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                 <StatCard
                    title={t('vendor.stats.current_balance') || 'Current Balance'}
                    value={formatCurrency(stats?.currentBalance, currencySymbol)}
                    icon={Wallet}
                    color="text-orange-500"
                    delay={0.1}
                />
                <StatCard
                    title={t('vendor.stats.total_revenue') || 'Total Revenue'}
                    value={formatCurrency(stats?.totalRevenue, currencySymbol)}
                    icon={DollarSign}
                    color="text-green-500"
                    delay={0.2}
                />
                <StatCard
                    title={t('vendor.stats.items_sold') || 'Items Sold'}
                    value={stats?.itemsSold || 0}
                    icon={Package}
                    color="text-blue-500"
                    delay={0.3}
                />
                <StatCard
                    title={t('vendor.stats.pending_shipments') || 'Pending Shipments'}
                    value={stats?.pendingShipments || 0}
                    icon={Clock}
                    color="text-red-500"
                    delay={0.4}
                />
            </div>

            <Card className="mt-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Store className="h-5 w-5 text-primary-500"/>
                    {t('vendor.info') || 'Vendor Information'}
                </h3>
                <div className="text-sm space-y-2 text-gray-700 dark:text-gray-300">
                    <p>
                        <strong>{t('auth.store_name') || 'Store Name'}:</strong>
                        <span className="font-semibold ml-2">{stats?.storeName}</span>
                    </p>
                    <p>
                        <strong>{t('order.status') || 'Approval Status'}:</strong>
                        {stats?.isApproved
                          ? <Badge variant="success" className="ml-2">{t('admin.status_approved') || 'Approved'}</Badge>
                          : <Badge variant="warning" className="ml-2">{t('admin.status_pending') || 'Pending'}</Badge>
                        }
                    </p>
                </div>
            </Card>
        </div>
    );
}

export default VendorStats;