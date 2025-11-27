import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderApi } from '../api/orderApi';
import { useSystem } from '../context/SystemContext';
import Spinner from '../components/ui/Spinner';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { ArrowRight, ArrowLeft, Package, MapPin, Calendar, DollarSign } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const OrderDetailsPage = () => {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  const { config } = useSystem();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currencySymbol = config?.currency?.symbol || 'د.م.';

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await orderApi.getOrderById(id);
        if (res.success) {
          setOrder(res.data);
        }
      } catch (err) {
        setError('فشل تحميل تفاصيل الطلب');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const getStatusBadge = (status) => {
      switch (status) {
          case 'pending': return <Badge variant="warning">{t('order.status_pending') || 'قيد الانتظار'}</Badge>;
          case 'paid': return <Badge variant="info">{t('order.status_paid') || 'مدفوع'}</Badge>;
          case 'shipped': return <Badge variant="primary">{t('order.status_shipped') || 'تم الشحن'}</Badge>;
          case 'delivered': return <Badge variant="success">{t('order.status_delivered') || 'تم التسليم'}</Badge>;
          case 'cancelled': return <Badge variant="danger">{t('order.status_cancelled') || 'ملغى'}</Badge>;
          default: return <Badge>{status}</Badge>;
      }
  };

  if (loading) return <div className="flex justify-center p-10"><Spinner size="lg" /></div>;
  if (error || !order) return <div className="text-center p-10 text-red-500">{error || 'الطلب غير موجود'}</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl animate-fade-in">
        {/* زر العودة */}
        <Link to="/orders" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-600 mb-6 transition-colors">
            {isRTL ? <ArrowRight className="h-5 w-5" /> : <ArrowLeft className="h-5 w-5" />}
            {t('nav.orders') || 'العودة للطلبات'}
        </Link>

        <div className="flex justify-between items-start mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('order.id')}: #{order.id}
            </h1>
            {getStatusBadge(order.status)}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* تفاصيل المنتجات */}
            <div className="md:col-span-2 space-y-6">
                <Card>
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Package className="h-5 w-5 text-primary-500" /> المنتجات
                    </h3>
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {order.items?.map((item) => (
                            <div key={item.id} className="py-4 flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-gray-800 dark:text-gray-200">
                                        {item.product_name || `Product #${item.product_id}`}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {t('common.qty')}: {item.quantity} x {currencySymbol}{Number(item.price).toFixed(2)}
                                    </p>
                                </div>
                                <p className="font-bold text-gray-900 dark:text-white">
                                    {currencySymbol}{(Number(item.price) * item.quantity).toFixed(2)}
                                </p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                        <span className="font-bold text-gray-900 dark:text-white">{t('cart.total')}</span>
                        <span className="text-xl font-bold text-primary-600">
                            {currencySymbol}{Number(order.total_price).toFixed(2)}
                        </span>
                    </div>
                </Card>
            </div>

            {/* معلومات الشحن والدفع */}
            <div className="space-y-6">
                <Card>
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-green-500" /> عنوان الشحن
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        {order.shipping_address}
                    </p>
                </Card>

                <Card>
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-blue-500" /> معلومات الدفع
                    </h3>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                        <p className="flex justify-between">
                            <span>تاريخ الطلب:</span>
                            <span>{new Date(order.created_at).toLocaleDateString()}</span>
                        </p>
                        {/* يمكنك إضافة المزيد من التفاصيل هنا مثل طريقة الدفع إذا كانت مخزنة */}
                    </div>
                </Card>
            </div>
        </div>
    </div>
  );
};

export default OrderDetailsPage;