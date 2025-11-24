import React, { useState, useEffect } from 'react';
import { vendorApi } from '../../api/vendorApi';
import Spinner from '../../components/ui/Spinner'; // تصحيح المسار
import Card from '../../components/ui/Card'; // تصحيح المسار
import Badge from '../../components/ui/Badge'; // تصحيح المسار
import { DollarSign, Wallet, Package, Clock, Store } from 'lucide-react';

// تعريف بطاقة الإحصائيات (StatCard) كمكون مساعد داخلي
const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100">
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

const VendorStats = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        vendorApi.getStats().then(res => {
            if(res.success) setStats(res.data);
            setLoading(false);
        }).catch(err => {
            console.error("Failed to load vendor stats", err);
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="py-10"><Spinner /></div>;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">نظرة عامة على متجر {stats?.storeName}</h2>

            {/* حالة الاعتماد */}
            {stats && !stats.isApproved && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
                    <p className="font-bold">الحساب غير معتمد</p>
                    <p>يرجى الانتظار، حسابك كبائع قيد مراجعة المدير. لن تتمكن من إضافة منتجات حتى تتم الموافقة عليه.</p>
                </div>
            )}

            {/* الإحصائيات الرئيسية */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                 <StatCard
                    title="الرصيد الحالي"
                    value={`$${stats?.currentBalance || '0.00'}`}
                    icon={Wallet}
                    color="bg-orange-500"
                />
                <StatCard
                    title="إجمالي الأرباح"
                    value={`$${stats?.totalRevenue || '0.00'}`}
                    icon={DollarSign}
                    color="bg-green-500"
                />
                <StatCard
                    title="المنتجات المباعة"
                    value={stats?.itemsSold || 0}
                    icon={Package}
                    color="bg-blue-500"
                />
                <StatCard
                    title="الطلبات المعلقة للشحن"
                    value={stats?.pendingShipments || 0}
                    icon={Clock}
                    color="bg-red-500"
                />
            </div>

            <Card>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Store className="h-5 w-5 text-gray-500"/>
                    معلومات البائع
                </h3>
                <div className="text-sm space-y-2 text-gray-700">
                    <p><strong>اسم المتجر:</strong> {stats?.storeName}</p>
                    <p><strong>حالة الاعتماد:</strong> {stats?.isApproved ? <Badge variant="success">معتمد</Badge> : <Badge variant="warning">قيد الانتظار</Badge>}</p>
                </div>
            </Card>
        </div>
    );
}

export default VendorStats;