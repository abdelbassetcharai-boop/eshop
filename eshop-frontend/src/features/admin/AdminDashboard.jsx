import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import Spinner from '../../components/ui/Spinner';
import { Users, ShoppingBag, DollarSign, Package, Store } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white overflow-hidden shadow rounded-lg">
    <div className="p-5">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Icon className={`h-6 w-6 text-white p-1 rounded-md ${color}`} aria-hidden="true" />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="text-lg font-medium text-gray-900">{value}</dd>
          </dl>
        </div>
      </div>
    </div>
  </div>
);

// دالة مساعدة للتأكد من أن القيمة رقمية قبل تنسيقها
const formatCurrency = (value) => {
    // التحويل إلى رقم (حتى لو كانت سلسلة نصية)
    const num = parseFloat(value);
    // التحقق مما إذا كانت القيمة صالحة قبل تطبيق toFixed، إذا لم تكن صالحة نرجع 0.00
    return isNaN(num) || !isFinite(num) ? '$0.00' : `$${num.toFixed(2)}`;
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminApi.getStats();
        if (data.success) {
          setStats(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch admin stats', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="py-10"><Spinner /></div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">نظرة عامة على النظام</h2>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* إجمالي عمولة المدير - تم تطبيق دالة الحماية formatCurrency */}
        <StatCard
          title="إجمالي عمولة المدير"
          value={formatCurrency(stats?.totalAdminRevenue)}
          icon={DollarSign}
          color="bg-green-500"
        />
        {/* إجمالي الطلبات */}
        <StatCard
          title="إجمالي الطلبات"
          value={stats?.orders || 0}
          icon={ShoppingBag}
          color="bg-blue-500"
        />
        {/* عدد المستخدمين */}
        <StatCard
          title="المستخدمين (العملاء)"
          value={stats?.users || 0}
          icon={Users}
          color="bg-indigo-500"
        />
        {/* عدد المنتجات */}
        <StatCard
          title="إجمالي المنتجات"
          value={stats?.products || 0}
          icon={Package}
          color="bg-orange-500"
        />
        {/* عدد البائعين */}
        <StatCard
          title="إجمالي البائعين"
          value={stats?.vendors || 0}
          icon={Store}
          color="bg-purple-500"
        />
      </div>
    </div>
  );
};

export default AdminDashboard;