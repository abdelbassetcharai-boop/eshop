import React, { useState } from 'react';
import AdminDashboard from '../../features/admin/AdminDashboard';
import ProductManagement from '../../features/admin/ProductManagement';
import CategoryManagement from '../../features/admin/CategoryManagement';
import OrdersTable from '../../features/admin/OrdersTable';
import UsersTable from '../../features/admin/UsersTable';
import SystemSettings from '../../features/admin/SystemSettings';
import { LayoutDashboard, Package, List, ShoppingBag, Users, Settings } from 'lucide-react';

const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard, component: AdminDashboard },
    { id: 'products', label: 'المنتجات', icon: Package, component: ProductManagement },
    { id: 'categories', label: 'التصنيفات', icon: List, component: CategoryManagement },
    { id: 'orders', label: 'الطلبات', icon: ShoppingBag, component: OrdersTable },
    { id: 'users', label: 'المستخدمين', icon: Users, component: UsersTable },
    { id: 'settings', label: 'الإعدادات', icon: Settings, component: SystemSettings },
  ];

  const ActiveComponent = tabs.find(t => t.id === activeTab)?.component || AdminDashboard;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex flex-col md:flex-row min-h-screen">

        {/* الشريط الجانبي */}
        <aside className="w-full md:w-64 bg-white shadow-md z-10">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-indigo-600">لوحة التحكم</h2>
          </div>
          <nav className="mt-6 px-4 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                  ${activeTab === tab.id
                    ? 'bg-indigo-50 text-indigo-700 border-r-4 border-indigo-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                `}
              >
                <tab.icon className="h-5 w-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* المحتوى الرئيسي */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">
                {tabs.find(t => t.id === activeTab)?.label}
              </h1>
            </div>
            <ActiveComponent />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardPage;