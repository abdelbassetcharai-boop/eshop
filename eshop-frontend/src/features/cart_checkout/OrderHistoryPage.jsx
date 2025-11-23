import React, { useState, useEffect } from 'react';
import { orderApi } from '../../api/orderApi';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { Package, Calendar, ChevronRight } from 'lucide-react';

const OrderHistoryPage = () => {
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

  if (loading) return <div className="py-20"><Spinner /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">طلباتي السابقة</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">لا توجد طلبات</h3>
          <p className="text-gray-500 mt-1">لم تقم بأي عملية شراء حتى الآن.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                    #{order.id}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                    <p className="font-bold text-gray-900">${Number(order.total_amount).toFixed(2)}</p>
                  </div>
                </div>
                <Badge
                  variant={
                    order.status === 'completed' || order.status === 'paid' ? 'success' :
                    order.status === 'cancelled' ? 'danger' : 'warning'
                  }
                >
                  {order.status}
                </Badge>
              </div>

              <div className="border-t border-gray-100 pt-4 flex justify-end">
                <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1">
                  عرض التفاصيل <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;