import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
// تم تصحيح المسار: الخروج من orders ثم features والدخول إلى api
import { getUserOrdersApi, cancelOrderApi, getOrderByIdApi } from '../../api/orderApi';
// تم تصحيح المسار: الخروج من orders ثم features والدخول إلى context
import { useSystem } from '../../context/SystemContext';
// تم تصحيح المسار: الخروج من orders ثم features والدخول إلى components
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../components/ui/Button';

// ==========================================================
// أيقونات SVG المضمنة
// ==========================================================
const IconClipboardList = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path d="M5.5 2A1.5 1.5 0 004 3.5V5h12V3.5A1.5 1.5 0 0014.5 2h-9zM4 7h12v9a1 1 0 01-1 1H5a1 1 0 01-1-1V7zM5.5 4a.5.5 0 01.5-.5h8a.5.5 0 01.5.5V5H5V4.5zM6.25 10a.75.75 0 000 1.5h7.5a.75.75 0 000-1.5h-7.5zm0 3.5a.75.75 0 000 1.5h7.5a.75.75 0 000-1.5h-7.5z" />
    </svg>
);

const IconCloseCircle = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94l-1.72-1.72z" clipRule="evenodd" />
    </svg>
);

const OrderHistoryPage = () => {
  const { config } = useSystem();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [detailsModal, setDetailsModal] = useState(null); // لعرض تفاصيل طلب محدد

  // 1. جلب سجل الطلبات
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getUserOrdersApi();
      setOrders(response.orders || []);
    } catch (err) {
      setError(err.message || 'فشل جلب سجل الطلبات.');
    } finally {
      setLoading(false);
    }
  };

  // 2. جلب تفاصيل طلب محدد (لفتح Modal)
  const fetchOrderDetails = async (orderId) => {
    setDetailsModal({ loading: true, data: null });
    try {
      const response = await getOrderByIdApi(orderId);
      setDetailsModal({ loading: false, data: response.order });
    } catch (err) {
      setDetailsModal({ loading: false, data: null, error: err.message || 'فشل جلب تفاصيل الطلب.' });
    }
  };

  // 3. إلغاء الطلب (متاح لـ 'pending' فقط)
  const handleCancelOrder = async (orderId) => {
    // يجب استخدام Modal مخصص بدلاً من window.confirm
    if (!window.confirm(`هل أنت متأكد من إلغاء الطلب رقم ${orderId}؟ سيتم استرجاع المخزون.`)) return;

    setMessage(null);
    try {
        await cancelOrderApi(orderId);
        setMessage({ type: 'success', text: `تم إلغاء الطلب رقم ${orderId} بنجاح.` });
        fetchOrders(); // تحديث القائمة
    } catch (err) {
        setMessage({ type: 'error', text: err.message || 'فشل الإلغاء. ربما تم شحن الطلب بالفعل.' });
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const currency = config.default_currency || 'SAR';

  // دالة مساعدة لتلوين حالة الطلب
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500 text-white';
      case 'shipped': return 'bg-blue-500 text-white';
      case 'pending': return 'bg-amber-500 text-gray-900';
      case 'cancelled': return 'bg-red-500 text-white';
      case 'processing': return 'bg-indigo-500 text-white';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

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

  const isOrdersEmpty = orders.length === 0;

  return (
    <div style={{ direction: 'rtl', fontFamily: 'var(--font-family)' }} className="mt-6">
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-8" style={{ color: 'var(--primary-color)' }}>
        سجل طلباتي
      </h1>

      {/* رسالة حالة (نجاح / خطأ) */}
      {message && (
        <div
          className={`p-4 mb-6 rounded-xl font-medium ${message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'}`}
        >
          {message.text}
        </div>
      )}

      {isOrdersEmpty ? (
        <div className="text-center p-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-dashed border-gray-300 dark:border-gray-700">
          <p className="text-xl text-gray-500 dark:text-gray-400 mb-6">لا يوجد لديك أي طلبات سابقة.</p>
          <NavLink to="/shop">
            <Button variant="primary">ابدأ التسوق</Button>
          </NavLink>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">

          {/* جدول الطلبات */}
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">الطلب رقم</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">التاريخ</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">الإجمالي</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">الحالة</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-gray-100">#{order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {new Date(order.created_at).toLocaleDateString('ar-EG')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {parseFloat(order.total_price).toFixed(2)} {currency}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${getStatusColor(order.status)}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2 space-x-reverse">
                    <Button
                        variant="ghost"
                        onClick={() => fetchOrderDetails(order.id)}
                        className="text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/50"
                    >
                        التفاصيل
                    </Button>
                    {order.status === 'pending' && (
                        <Button
                            variant="ghost"
                            onClick={() => handleCancelOrder(order.id)}
                            className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/50"
                        >
                            إلغاء
                        </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* مكون عرض تفاصيل الطلب (Modal) */}
      {detailsModal && detailsModal.loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30">
              <LoadingSpinner />
          </div>
      )}
      {detailsModal && detailsModal.data && (
        <OrderDetailsModal
          order={detailsModal.data}
          currency={currency}
          onClose={() => setDetailsModal(null)}
          getStatusColor={getStatusColor}
        />
      )}
      {detailsModal && detailsModal.error && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30">
            <div className="bg-white p-8 rounded-xl max-w-sm text-center">
                <p className="text-red-500 mb-4">{detailsModal.error}</p>
                <Button variant="secondary" onClick={() => setDetailsModal(null)}>إغلاق</Button>
            </div>
        </div>
      )}
    </div>
  );
};

// مكون تفاصيل الطلب داخل Modal
const OrderDetailsModal = ({ order, currency, onClose, getStatusColor }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-40 p-4 transition-opacity duration-300">
        <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl shadow-3xl overflow-y-auto max-h-[90vh]">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">تفاصيل الطلب #{order.id}</h2>
                <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition">
                    <IconCloseCircle className="w-6 h-6" />
                </button>
            </div>

            <div className="p-6 space-y-6">

                {/* الملخص */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-gray-500">الحالة العامة:</p>
                        <span className={`font-semibold capitalize px-3 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                            {order.status}
                        </span>
                    </div>
                    <div>
                        <p className="text-gray-500">حالة الدفع:</p>
                        <span className={`font-semibold capitalize text-sm ${order.payment_status === 'completed' ? 'text-green-600' : 'text-amber-500'}`}>
                            {order.payment_status} ({order.payment_method})
                        </span>
                    </div>
                    <div className="col-span-2">
                        <p className="text-gray-500">الشحن:</p>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{order.shipping_address}</p>
                        {order.tracking_number && (
                            <p className="text-xs text-blue-500 mt-1">رقم التتبع: {order.tracking_number}</p>
                        )}
                    </div>
                </div>

                {/* قائمة العناصر */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                    <h3 className="bg-gray-50 dark:bg-gray-700 p-3 font-bold text-gray-700 dark:text-gray-200">المنتجات المطلوبة</h3>
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {order.items.map(item => (
                            <li key={item.id} className="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <div className="flex items-center space-x-3 space-x-reverse">
                                    <img src={item.image_url || 'https://placehold.co/40x40'} alt={item.name} className="w-10 h-10 rounded object-cover" />
                                    <NavLink to={`/products/${item.product_id}`} className="font-medium text-sm text-gray-900 dark:text-gray-100 hover:text-blue-500">{item.name}</NavLink>
                                </div>
                                <div className="text-right text-sm">
                                    <p>{item.price} {currency} x {item.quantity}</p>
                                    <p className="font-bold mt-0.5">{(item.price * item.quantity).toFixed(2)} {currency}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* الإجمالي */}
                <div className="text-right border-t border-gray-200 dark:border-gray-700 pt-4">
                    <p className="text-2xl font-extrabold text-gray-900 dark:text-gray-100" style={{ color: 'var(--primary-color)' }}>
                        الإجمالي النهائي: {parseFloat(order.total_price).toFixed(2)} {currency}
                    </p>
                </div>
            </div>

            {/* زر الإغلاق */}
            <div className="p-6 bg-gray-50 dark:bg-gray-700 text-right">
                <Button variant="secondary" onClick={onClose}>إغلاق</Button>
            </div>
        </div>
    </div>
);

export default OrderHistoryPage;