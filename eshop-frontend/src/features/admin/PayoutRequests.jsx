import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { toast } from 'react-toastify';
import { Check, DollarSign, Clock, Store } from 'lucide-react';

const PayoutRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(null); // لتتبع حالة معالجة كل طلب

  const fetchRequests = async () => {
    try {
      // جلب الطلبات المعلقة فقط
      const res = await adminApi.getPayoutRequests();
      if (res.success) setRequests(res.data);
    } catch (error) {
      toast.error('فشل تحميل طلبات السحب');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleProcess = async (payoutId) => {
    // يجب أن يظهر مربع تأكيد مخصص هنا بدلاً من window.confirm
    if (!window.confirm('هل أنت متأكد من معالجة هذا الطلب؟ سيتم اعتباره مكتملًا.')) {
        return;
    }

    setIsProcessing(payoutId);
    try {
      await adminApi.processPayout(payoutId);
      toast.success('تم معالجة الطلب واعتباره مكتملًا!');

      // إزالة الطلب المكتمل من القائمة
      setRequests(requests.filter(r => r.id !== payoutId));
    } catch (error) {
      toast.error('فشل معالجة الطلب');
      console.error(error);
    } finally {
      setIsProcessing(null);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
        case 'pending':
            return <Badge variant="warning" className="flex items-center gap-1"><Clock className="h-3 w-3" /> قيد الانتظار</Badge>;
        case 'completed':
            return <Badge variant="success" className="flex items-center gap-1"><Check className="h-3 w-3" /> مكتمل</Badge>;
        default:
            return <Badge variant="default">{status}</Badge>;
    }
  };

  if (loading) return <div className="py-10"><Spinner /></div>;

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">طلبات سحب الأرباح (المعلقة)</h3>
      </div>

      {requests.length === 0 ? (
        <div className="p-6 text-center text-gray-500">لا توجد طلبات سحب أرباح معلقة حالياً.</div>
      ) : (
        <Table>
          <TableHead>
            <TableHeader>ID</TableHeader>
            <TableHeader>البائع</TableHeader>
            <TableHeader>المبلغ المطلوب</TableHeader>
            <TableHeader>الرصيد الحالي للبائع</TableHeader>
            <TableHeader>تاريخ الطلب</TableHeader>
            <TableHeader>الإجراء</TableHeader>
          </TableHead>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>#{request.id}</TableCell>
                <TableCell>
                  <div className="font-medium text-gray-900">{request.store_name}</div>
                  <div className="text-xs text-gray-500">ID: #{request.vendor_id}</div>
                </TableCell>
                <TableCell className="font-bold text-red-600">${Number(request.amount).toFixed(2)}</TableCell>
                <TableCell className="font-semibold">${Number(request.balance).toFixed(2)}</TableCell>
                <TableCell>{new Date(request.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  {request.status === 'pending' ? (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleProcess(request.id)}
                      isLoading={isProcessing === request.id}
                      className="flex items-center gap-1"
                    >
                      <Check className="h-4 w-4" />
                      معالجة وإكمال
                    </Button>
                  ) : (
                    getStatusBadge(request.status)
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default PayoutRequests;