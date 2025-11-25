import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const OrdersTable = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await adminApi.getAllOrders();
      if (res.success) setOrders(res.data);
    } catch (error) {
      console.error(error);
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await adminApi.updateOrderStatus(orderId, newStatus);
      toast.success(t('common.success_update') || 'Updated successfully');
      // تحديث الحالة محلياً
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (error) {
      toast.error(t('common.error'));
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return t('order.status_pending') || 'Pending';
      case 'paid': return t('order.status_paid') || 'Paid';
      case 'shipped': return t('order.status_shipped') || 'Shipped';
      case 'delivered': return t('order.status_delivered') || 'Delivered';
      case 'cancelled': return t('order.status_cancelled') || 'Cancelled';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" variant="primary" />
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
      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t('nav.orders') || 'All Orders'}
        </h3>
      </div>

      {orders.length === 0 ? (
         <div className="p-8 text-center text-gray-500 dark:text-gray-400">
           {t('common.no_data') || 'No orders found.'}
         </div>
      ) : (
        <Table>
          <TableHead>
            <TableHeader>{t('order.id') || 'Order ID'}</TableHeader>
            <TableHeader>{t('common.date') || 'Date'}</TableHeader>
            <TableHeader>{t('product.price') || 'Amount'}</TableHeader>
            <TableHeader>{t('order.status') || 'Status'}</TableHeader>
            <TableHeader>{t('common.actions') || 'Actions'}</TableHeader>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>#{order.id}</TableCell>
                <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                <TableCell>${order.total_amount}</TableCell>
                <TableCell>
                  <Badge variant={order.status === 'completed' || order.status === 'delivered' ? 'success' : order.status === 'cancelled' ? 'danger' : 'warning'}>
                    {getStatusLabel(order.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <select
                    className="text-sm bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:border-primary-500 focus:ring-primary-500 px-3 py-1 transition-colors text-gray-700 dark:text-gray-300"
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  >
                    <option value="pending">{t('order.status_pending') || 'Pending'}</option>
                    <option value="paid">{t('order.status_paid') || 'Paid'}</option>
                    <option value="shipped">{t('order.status_shipped') || 'Shipped'}</option>
                    <option value="delivered">{t('order.status_delivered') || 'Delivered'}</option>
                    <option value="cancelled">{t('order.status_cancelled') || 'Cancelled'}</option>
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

export default OrdersTable;