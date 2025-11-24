import React, { useState, useEffect } from 'react';
import { vendorApi } from '../../api/vendorApi';
import { adminApi } from '../../api/adminApi';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui/Table'; // تصحيح نهائي للمسار
import Badge from '../../components/ui/Badge'; // تصحيح نهائي للمسار
import Spinner from '../../components/ui/Spinner'; // تصحيح نهائي للمسار
import Select from '../../components/ui/Select'; // تصحيح نهائي للمسار
import { toast } from 'react-toastify';
import { Package, Calendar, User, Truck } from 'lucide-react';

// قائمة الحالات التي يمكن للبائع تعديلها
const statusOptions = [
    { value: 'paid', label: 'مدفوع (جاهز للشحن)' },
    { value: 'shipped', label: 'تم الشحن' },
    { value: 'delivered', label: 'تم التوصيل' },
    { value: 'cancelled', label: 'إلغاء' },
];

const VendorOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await vendorApi.getOrders();
      if (res.success) {
        setOrders(res.data);
      }
    } catch (error) {
      toast.error('فشل تحميل الطلبات الواردة.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    // التحقق لمنع البائع من تغيير الحالات التي لا تخص الشحن مباشرة
    if (['pending', 'completed'].includes(newStatus)) {
        toast.error('لا يمكن للبائع تعيين هذه الحالة.');
        return;
    }

    try {
      // نستخدم adminApi هنا لأن دالة تحديث الحالة في الباك إند محمية للأدمن والبائع
      await adminApi.updateOrderStatus(orderId, newStatus);
      toast.success(`تم تحديث حالة الطلب #${orderId} إلى ${newStatus}`);

      // تحديث الحالة محلياً في القائمة
      setOrders(orders.map(o => o.order_id === orderId ? { ...o, order_status: newStatus } : o));

    } catch (error) {
      toast.error(error.response?.data?.error || 'فشل التحديث');
    }
  };

  if (loading) return <div className="py-10"><Spinner /></div>;

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex items-center gap-2">
        <Truck className="h-5 w-5 text-orange-600" />
        <h3 className="text-lg leading-6 font-medium text-gray-900">طلبات المنتجات الواردة</h3>
      </div>

      {orders.length === 0 ? (
        <div className="p-6 text-center text-gray-500">لا توجد طلبات جديدة تتطلب الشحن حالياً.</div>
      ) : (
        <Table>
          <TableHead>
            <TableHeader>رقم الطلب</TableHeader>
            <TableHeader>المنتج</TableHeader>
            <TableHeader>الكمية / الربح</TableHeader>
            <TableHeader>حالة الطلب</TableHeader>
            <TableHeader>تغيير الحالة</TableHeader>
          </TableHead>
          <TableBody>
            {orders.map((item) => (
              <TableRow key={item.product_id + item.order_id}>
                <TableCell>
                    <div className="font-medium text-gray-900">#{item.order_id}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className='h-3 w-3'/> {new Date(item.created_at).toLocaleDateString()}
                    </div>
                </TableCell>
                <TableCell>
                    <div className="font-medium text-gray-900">{item.product_name || 'منتج غير معروف'}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                        <User className='h-3 w-3'/> العميل: {item.customer_name || 'N/A'}
                    </div>
                </TableCell>
                <TableCell>
                    <div className="font-semibold text-gray-900">الكمية: {item.quantity}</div>
                    <div className="text-sm text-green-600">ربحك: ${Number(item.vendor_revenue).toFixed(2)}</div>
                </TableCell>
                <TableCell>
                  <Badge variant={item.order_status === 'paid' ? 'success' : item.order_status === 'shipped' ? 'info' : 'default'}>
                    {item.order_status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <select
                    className="text-sm border-gray-300 rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    value={item.order_status}
                    onChange={(e) => handleStatusChange(item.order_id, e.target.value)}
                    // منع تغيير الحالة بعد التسليم أو الإلغاء
                    disabled={['delivered', 'cancelled', 'completed'].includes(item.order_status)}
                  >
                    {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                  </select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default VendorOrders;