import React, { useState, useEffect } from 'react';
import { vendorApi } from '../../api/vendorApi';
import { adminApi } from '../../api/adminApi'; // نستخدم adminApi لتحديث الحالة لأنه مسار مشترك
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Package, Calendar, User, Truck, DollarSign } from 'lucide-react';

// قائمة الحالات التي يمكن للبائع تعديلها
const statusOptions = [
    { value: 'paid', labelKey: 'order.status_paid' },
    { value: 'shipped', labelKey: 'order.status_shipped' },
    { value: 'delivered', labelKey: 'order.status_delivered' },
    { value: 'cancelled', labelKey: 'order.status_cancelled' },
];

const VendorOrders = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await vendorApi.getOrders();
      if (res.success) {
        setOrders(res.data);
      }
    } catch (error) {
      toast.error(t('common.error'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    // منع البائع من تغيير الحالة إلى Paid (لأنها حالة دفع)
    if (newStatus === 'paid' && orders.find(o => o.order_id === orderId)?.order_status !== 'paid') {
        toast.error(t('vendor.error_status_paid') || 'Vendors cannot set payment status.');
        return;
    }

    try {
      // نستخدم adminApi هنا لأن دالة تحديث الحالة في الباك إند محمية للأدمن والبائع
      await adminApi.updateOrderStatus(orderId, newStatus);
      toast.success(t('common.success_update'));

      // تحديث الحالة محلياً في القائمة
      setOrders(orders.map(o => o.order_id === orderId ? { ...o, order_status: newStatus } : o));

    } catch (error) {
      toast.error(error.response?.data?.error || t('common.error'));
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
        case 'pending': return <Badge variant="warning">{t('order.status_pending')}</Badge>;
        case 'paid': return <Badge variant="info">{t('order.status_paid')}</Badge>;
        case 'shipped': return <Badge variant="primary">{t('order.status_shipped')}</Badge>;
        case 'delivered': return <Badge variant="success">{t('order.status_delivered')}</Badge>;
        case 'cancelled': return <Badge variant="danger">{t('order.status_cancelled')}</Badge>;
        default: return <Badge variant="default">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" variant="secondary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-dark-card shadow-sm rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden"
    >
      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
        <Truck className="h-5 w-5 text-secondary-600" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t('vendor.incoming_orders') || 'Incoming Product Orders'}
        </h3>
      </div>

      {orders.length === 0 ? (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          <Package className='h-10 w-10 mx-auto mb-3' />
          {t('common.no_data') || 'No incoming orders require shipping.'}
        </div>
      ) : (
        <Table>
          <TableHead>
            <TableHeader>{t('order.id')}</TableHeader>
            <TableHeader>{t('product.name')}</TableHeader>
            <TableHeader>{t('common.qty') || 'Qty'}</TableHeader>
            <TableHeader>{t('vendor.revenue') || 'Revenue'}</TableHeader>
            <TableHeader>{t('order.status')}</TableHeader>
            <TableHeader>{t('vendor.change_status') || 'Change Status'}</TableHeader>
          </TableHead>
          <TableBody>
            {orders.map((item) => (
              <TableRow key={item.product_id + item.order_id}>
                <TableCell>
                    <div className="font-medium text-gray-900 dark:text-white">#{item.order_id}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Calendar className='h-3 w-3'/> {new Date(item.created_at).toLocaleDateString()}
                    </div>
                </TableCell>
                <TableCell>
                    <div className="font-medium text-gray-900 dark:text-white">{item.product_name || t('product.unknown')}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <User className='h-3 w-3'/> {t('order.customer') || 'Customer'}: {item.customer_name || 'N/A'}
                    </div>
                </TableCell>
                <TableCell className='font-semibold text-gray-900 dark:text-white'>{item.quantity}</TableCell>
                <TableCell>
                    <div className="text-sm text-green-600 dark:text-green-400 font-semibold flex items-center">
                        <DollarSign className='h-3 w-3 mr-1' />{Number(item.vendor_revenue).toFixed(2)}
                    </div>
                </TableCell>
                <TableCell>{getStatusBadge(item.order_status)}</TableCell>
                <TableCell>
                  <select
                    className="text-sm bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:border-secondary-500 focus:ring-secondary-500 px-3 py-1 transition-colors text-gray-700 dark:text-gray-300"
                    value={item.order_status}
                    onChange={(e) => handleStatusChange(item.order_id, e.target.value)}
                    // منع تغيير الحالة بعد التسليم أو الإلغاء
                    disabled={['delivered', 'cancelled'].includes(item.order_status)}
                  >
                    {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                            {t(option.labelKey)}
                        </option>
                    ))}
                  </select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </motion.div>
  );
};

export default VendorOrders;