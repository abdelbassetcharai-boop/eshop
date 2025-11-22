import React, { useState, useEffect } from 'react';
// تم تصحيح المسار: الخروج من admin ثم features والدخول إلى context
import { useAuth } from '../../context/AuthContext';
import { useSystem } from '../../context/SystemContext';
// تم تصحيح المسار: الخروج من admin ثم features والدخول إلى api
import { getDashboardStatsApi } from '../../api/adminApi';
// تم تصحيح المسار: الخروج من admin ثم features والدخول إلى components
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../components/ui/Button';
import { NavLink } from 'react-router-dom';

// ==========================================================
// أيقونات SVG المضمنة
// ==========================================================
const IconUsers = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path d="M10 9a3 3 0 100-6 3 3 0 000 6zM9.002 11.233A5.503 5.503 0 005.25 15.5H4.75a.75.75 0 000 1.5h10.5a.75.75 0 000-1.5h-.5a5.503 5.503 0 00-3.752-4.267z" />
  </svg>
);
const IconMoney = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path d="M7.75 8a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5a.75.75 0 01.75-.75zm4.75.75a.75.75 0 00-1.5 0v3.5a.75.75 0 001.5 0v-3.5z" />
    <path fillRule="evenodd" d="M16 4a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2h12zM4 6h12v8H4V6z" clipRule="evenodd" />
  </svg>
);
const IconBox = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M5.5 3A1.5 1.5 0 004 4.5v11A1.5 1.5 0 005.5 17h9a1.5 1.5 0 001.5-1.5v-11A1.5 1.5 0 0014.5 3h-9zM5.5 4a.5.5 0 00-.5.5v11a.5.5 0 00.5.5h9a.5.5 0 00.5-.5v-11a.5.5 0 00-.5-.5h-9zM8.5 7.5a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v2a.5.5 0 01-.5.5h-2a.5.5 0 01-.5-.5v-2z" clipRule="evenodd" />
  </svg>
);
const IconClock = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v4.25a.75.75 0 00.22.53l3 3a.75.75 0 101.06-1.06L10.75 9.44V5z" clipRule="evenodd" />
  </svg>
);


// ==========================================================
// 1. مكون بطاقة الإحصائيات (KPI Card)
// ==========================================================
const KPICard = ({ title, value, icon: Icon, colorClass, currency }) => (
  <div className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 transition duration-300 transform hover:scale-[1.01] flex items-center justify-between`}>
    <div>
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">{title}</h3>
      <p className="mt-1 text-3xl font-extrabold text-gray-900 dark:text-gray-100">
        {currency ? `${parseFloat(value || 0).toLocaleString()} ${currency}` : (value || 0).toLocaleString()}
      </p>
    </div>
    <div className={`p-3 rounded-full ${colorClass} bg-opacity-10 dark:bg-opacity-20`}>
      <Icon className={`w-7 h-7 ${colorClass}`} />
    </div>
  </div>
);


/**
 * مكون لوحة القيادة الإدارية (Admin/Vendor Dashboard)
 */
const AdminDashboard = () => {
  const { user } = useAuth();
  const { config } = useSystem();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. جلب بيانات لوحة القيادة
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getDashboardStatsApi();
      setStats(response.stats);
    } catch (err) {
      setError(err.message || 'فشل جلب بيانات لوحة القيادة.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const currency = config.default_currency || 'SAR';
  const isAdmin = user?.role === 'admin';
  const isVendor = user?.role === 'vendor';

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center p-10 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-xl border border-red-300 mt-8">
        <h2 className="text-xl font-bold mb-2">عفواً، حدث خطأ.</h2>
        <p>{error}</p>
      </div>
    );
  }

  const dashboardStats = [
    ...(isAdmin ? [{
        title: 'إجمالي المستخدمين',
        value: stats?.users.total_users,
        icon: IconUsers,
        colorClass: 'text-blue-500'
    }] : []),
    {
        title: isAdmin ? 'إجمالي الإيرادات' : 'إيرادات البائع',
        value: isAdmin ? stats?.orders.total_revenue : stats?.orders.vendor_revenue,
        icon: IconMoney,
        colorClass: 'text-green-500',
        currency: currency
    },
    {
        title: 'إجمالي المنتجات',
        value: stats?.products.total_products,
        icon: IconBox,
        colorClass: 'text-purple-500'
    },
    {
        title: 'الطلبات المعلقة',
        value: stats?.orders.pending_orders,
        icon: IconClock,
        colorClass: 'text-amber-500'
    },
  ];

  return (
    <div style={{ direction: 'rtl', fontFamily: 'var(--font-family)' }} className="mt-6">
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-2" style={{ color: 'var(--secondary-color)' }}>
        لوحة تحكم {isAdmin ? 'المشرف' : 'البائع'}
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        مرحباً {user?.name}، نظرة سريعة على أداء {isAdmin ? 'المتجر' : 'منتجاتك'}.
      </p>

      {/* 2. بطاقات الإحصائيات الرئيسية (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {dashboardStats.map((kpi, index) => (
          <KPICard key={index} {...kpi} />
        ))}
      </div>

      {/* 3. الطلبات الأخيرة */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 border-b pb-2">
          آخر 10 طلبات {isVendor ? 'على منتجاتك' : ''}
        </h2>

        {stats?.recent_orders && stats.recent_orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-300 uppercase">الطلب</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-300 uppercase">العميل</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-300 uppercase">الإجمالي</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-300 uppercase">الحالة</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-300 uppercase">الدفع</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-300 uppercase">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {stats.recent_orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-gray-100">#{order.id}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{order.user_name}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {parseFloat(order.total_price).toFixed(2)} {currency}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${order.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {order.payment_status}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                        {/* رابط لإدارة الطلب (يجب أن يتم عبر modal في التطبيق الكامل) */}
                      <NavLink to={`/orders/${order.id}`} target="_blank" className="text-blue-500 hover:underline">
                        عرض/تعديل
                      </NavLink>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 p-4 text-center border border-dashed rounded-xl">
            لا توجد طلبات حديثة لعرضها.
          </p>
        )}
      </div>

      {/* 4. روابط سريعة للإدارة (للمشرفين) */}
      {isAdmin && (
          <div className="mt-10 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 border-b pb-2">روابط سريعة</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <NavLink to="/admin/products" className="text-blue-500 hover:underline">إدارة المنتجات</NavLink>
                  <NavLink to="/admin/system-settings" className="text-blue-500 hover:underline">الإعدادات العامة</NavLink>
                  <NavLink to="/admin/users" className="text-blue-500 hover:underline">إدارة المستخدمين</NavLink>
              </div>
          </div>
      )}
    </div>
  );
};

export default AdminDashboard;