import React, { useState } from 'react';
import { LayoutDashboard, Package, ShoppingBag, DollarSign, Settings } from 'lucide-react';

// المسارات الصحيحة: ../../features/vendor/
import VendorStats from '../../features/vendor/VendorStats';
import VendorProducts from '../../features/vendor/VendorProducts';
import VendorOrders from '../../features/vendor/VendorOrders';
import VendorPayouts from '../../features/vendor/VendorPayouts';

const VendorDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    // ربط تبويبة "الرئيسية" بالمكون الجديد المخصص للإحصائيات
    { id: 'dashboard', label: 'الرئيسية (الإحصائيات)', icon: LayoutDashboard, component: VendorStats },
    { id: 'products', label: 'إدارة المنتجات', icon: Package, component: VendorProducts },
    { id: 'orders', label: 'الطلبات الواردة', icon: ShoppingBag, component: VendorOrders },
    // ربط تبويبة "الدفعات" بالمكون المخصص لإدارة المحفظة
    { id: 'payouts', label: 'المحفظة والدفعات', icon: DollarSign, component: VendorPayouts },
    { id: 'settings', label: 'إعدادات المتجر', icon: Settings, component: () => <div>إعدادات متجرك... (قيد التطوير)</div> },
  ];

  const ActiveComponent = tabs.find(t => t.id === activeTab)?.component || VendorStats;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex flex-col md:flex-row min-h-screen">

        {/* الشريط الجانبي */}
        <aside className="w-full md:w-64 bg-white shadow-md z-10">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-orange-600">لوحة البائع</h2>
          </div>
          <nav className="mt-6 px-4 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                  ${activeTab === tab.id
                    ? 'bg-orange-50 text-orange-700 border-r-4 border-orange-600'
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

export default VendorDashboardPage;