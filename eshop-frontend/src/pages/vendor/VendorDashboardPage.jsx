import React, { useState } from 'react';
import { LayoutDashboard, Package, ShoppingBag, DollarSign, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

// المسارات الصحيحة: ../../features/vendor/
import VendorStats from '../../features/vendor/VendorStats';
import VendorProducts from '../../features/vendor/VendorProducts';
import VendorOrders from '../../features/vendor/VendorOrders';
import VendorPayouts from '../../features/vendor/VendorPayouts';

const VendorDashboardPage = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    // ربط تبويبة "الرئيسية" بالمكون الجديد المخصص للإحصائيات
    { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard, component: VendorStats },
    { id: 'products', label: t('footer.links.products'), icon: Package, component: VendorProducts },
    { id: 'orders', label: t('nav.orders') || 'Orders', icon: ShoppingBag, component: VendorOrders },
    // ربط تبويبة "الدفعات" بالمكون المخصص لإدارة المحفظة
    { id: 'payouts', label: t('admin.payouts') || 'Payouts', icon: DollarSign, component: VendorPayouts },
    { id: 'settings', label: t('admin.settings') || 'Settings', icon: Settings, component: () => <div>{t('common.loading')}...</div> },
  ];

  const ActiveComponent = tabs.find(t => t.id === activeTab)?.component || VendorStats;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex flex-col md:flex-row animate-fade-in">

      {/* الشريط الجانبي */}
      <aside className="w-full md:w-64 bg-white dark:bg-dark-card shadow-md z-10 flex-shrink-0 transition-colors duration-300">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-orange-600 dark:text-orange-500">
            {t('nav.vendor')}
          </h2>
        </div>
        <nav className="mt-6 px-4 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium
                ${activeTab === tab.id
                  ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'}
              `}
            >
              <tab.icon className={`h-5 w-5 ${activeTab === tab.id ? 'text-orange-600 dark:text-orange-400' : ''}`} />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* المحتوى الرئيسي */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {tabs.find(t => t.id === activeTab)?.label}
            </h1>
          </header>

          <AnimatePresence mode="wait">
             <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <ActiveComponent />
             </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default VendorDashboardPage;