import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import AdminDashboard from '../../features/admin/AdminDashboard';
import ProductManagement from '../../features/admin/ProductManagement';
import CategoryManagement from '../../features/admin/CategoryManagement';
import OrdersTable from '../../features/admin/OrdersTable';
import UsersTable from '../../features/admin/UsersTable';
import SystemSettings from '../../features/admin/SystemSettings';
import VendorsTable from '../../features/admin/VendorsTable';
import PayoutRequests from '../../features/admin/PayoutRequests';
import { LayoutDashboard, Package, List, ShoppingBag, Users, Settings, Store, DollarSign } from 'lucide-react';

const AdminDashboardPage = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard, component: AdminDashboard },
    { id: 'products', label: t('footer.links.products'), icon: Package, component: ProductManagement },
    { id: 'categories', label: t('shop.all_categories'), icon: List, component: CategoryManagement },
    { id: 'orders', label: t('nav.orders') || 'Orders', icon: ShoppingBag, component: OrdersTable },
    { id: 'vendors', label: t('nav.vendor') || 'Vendors', icon: Store, component: VendorsTable },
    { id: 'payouts', label: t('admin.payouts') || 'Payouts', icon: DollarSign, component: PayoutRequests },
    { id: 'users', label: t('admin.users') || 'Users', icon: Users, component: UsersTable },
    { id: 'settings', label: t('admin.settings') || 'Settings', icon: Settings, component: SystemSettings },
  ];

  const ActiveComponent = tabs.find(t => t.id === activeTab)?.component || AdminDashboard;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex flex-col md:flex-row animate-fade-in">

      {/* الشريط الجانبي (Sidebar) */}
      <aside className="w-full md:w-64 bg-white dark:bg-dark-card shadow-md z-10 flex-shrink-0 transition-colors duration-300">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-primary-600 dark:text-primary-400">
            {t('nav.dashboard')}
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
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'}
              `}
            >
              <tab.icon className={`h-5 w-5 ${activeTab === tab.id ? 'text-primary-600 dark:text-primary-400' : ''}`} />
              <span>{tab.label}</span>
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

export default AdminDashboardPage;