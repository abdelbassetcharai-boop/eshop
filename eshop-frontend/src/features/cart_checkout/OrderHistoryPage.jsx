import React, { useState, useEffect } from 'react';
import { orderApi } from '../../api/orderApi';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Package, Calendar, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const OrderHistoryPage = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await orderApi.getMyOrders();
        if (res.success) {
          setOrders(res.data);
        }
      } catch (error) {
        console.error('Failed to fetch orders', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

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

  const getStatusVariant = (status) => {
    switch (status) {
      case 'delivered': return 'success';
      case 'paid': return 'info';
      case 'shipped': return 'primary';
      case 'cancelled': return 'danger';
      default: return 'warning';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size="lg" variant="primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        {t('nav.orders') || 'Order History'}
      </h1>

      {orders.length === 0 ? (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 bg-white dark:bg-dark-card rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800"
        >
          <Package className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 dark:text-white">
            {t('order.no_orders_title') || 'No Orders Found'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1 mb-6">
            {t('order.no_orders_desc') || 'You have not placed any orders yet.'}
          </p>
          <Link to="/shop">
             <Button variant="primary" size="md">
                {t('hero.cta')}
             </Button>
          </Link>
        </motion.div>
      ) : (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
            className="space-y-4"
        >
          {orders.map((order) => (
            <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-6 hover:shadow-xl transition-shadow border-l-4 border-primary-500/50">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold">
                      #{order.id}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                      <p className="font-bold text-xl text-gray-900 dark:text-white mt-1">
                        {t('common.currency')}{Number(order.total_amount).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <Badge variant={getStatusVariant(order.status)}>
                    {getStatusLabel(order.status)}
                  </Badge>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-700 pt-4 flex justify-end">
                  <Link to={`/orders/${order.id}`}> {/* يجب إضافة مسار لتفاصيل الطلب */}
                    <Button variant="link" className="text-sm font-medium flex items-center gap-1">
                      {t('order.view_details') || 'View Details'} <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default OrderHistoryPage;