import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Card from '../../components/ui/Card';
import { DollarSign, CreditCard, Calendar, Hash } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { useSystem } from '../../context/SystemContext';

const PaymentsTable = () => {
  const { config } = useSystem();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const currencySymbol = config?.currency?.symbol || 'د.م.';

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await adminApi.getAllPayments();
        if (res.success) {
          setPayments(res.data);
        }
      } catch (error) {
        console.error('Failed to fetch payments', error);
        toast.error('فشل تحميل سجل المدفوعات');
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed': return <Badge variant="success">مكتمل</Badge>;
      case 'pending': return <Badge variant="warning">قيد الانتظار</Badge>;
      case 'failed': return <Badge variant="danger">فشل</Badge>;
      case 'refunded': return <Badge variant="info">مسترد</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const getMethodIcon = (method) => {
      if (method === 'credit_card' || method === 'stripe') return <CreditCard className="h-4 w-4 text-blue-500" />;
      if (method === 'cod') return <DollarSign className="h-4 w-4 text-green-500" />;
      return <Hash className="h-4 w-4 text-gray-500" />;
  };

  const getMethodLabel = (method) => {
      if (method === 'credit_card' || method === 'stripe') return 'بطاقة ائتمان';
      if (method === 'cod') return 'عند الاستلام';
      return method;
  };

  if (loading) return <div className="flex justify-center p-10"><Spinner size="lg" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Card>
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
            <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">سجل المدفوعات</h2>
                <p className="text-sm text-gray-500">عرض جميع العمليات المالية الواردة.</p>
            </div>
        </div>

        {payments.length === 0 ? (
          <div className="text-center py-10 text-gray-500">لا توجد مدفوعات مسجلة حتى الآن.</div>
        ) : (
          <Table>
            <TableHead>
              <TableHeader>#</TableHeader>
              <TableHeader>العميل</TableHeader>
              <TableHeader>الطلب</TableHeader>
              <TableHeader>المبلغ</TableHeader>
              <TableHeader>الطريقة</TableHeader>
              <TableHeader>الحالة</TableHeader>
              <TableHeader>التاريخ</TableHeader>
              <TableHeader>رقم المعاملة</TableHeader>
            </TableHead>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.id}</TableCell>
                  <TableCell>
                    <div className="font-medium text-gray-900 dark:text-white">{payment.customer_name}</div>
                    <div className="text-xs text-gray-500">{payment.customer_email}</div>
                  </TableCell>
                  <TableCell className="font-bold">#{payment.order_id}</TableCell>
                  <TableCell className="font-bold text-green-600 dark:text-green-400">
                    {currencySymbol}{Number(payment.amount).toFixed(2)}
                  </TableCell>
                  <TableCell>
                      <div className="flex items-center gap-2">
                          {getMethodIcon(payment.payment_method)}
                          <span>{getMethodLabel(payment.payment_method)}</span>
                      </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(payment.payment_status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        {new Date(payment.created_at).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-gray-500 truncate max-w-[150px]" title={payment.transaction_id}>
                      {payment.transaction_id}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </motion.div>
  );
};

export default PaymentsTable;