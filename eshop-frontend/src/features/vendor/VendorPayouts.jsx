import React, { useState, useEffect } from 'react';
import { vendorApi } from '../../api/vendorApi'; // المسار الصحيح: صعود واحد
import Button from '../../components/ui/Button'; // تصحيح المسار: صعود مرتين
import Input from '../../components/ui/Input'; // تصحيح المسار: صعود مرتين
import Card from '../../components/ui/Card'; // تصحيح المسار: صعود مرتين
import Modal from '../../components/ui/Modal'; // تصحيح المسار: صعود مرتين
import Spinner from '../../components/ui/Spinner'; // تصحيح المسار: صعود مرتين
import Badge from '../../components/ui/Badge'; // تصحيح المسار: صعود مرتين
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui/Table'; // تصحيح المسار: صعود مرتين
import { DollarSign, Wallet, Send, Clock, Check } from 'lucide-react';
import { toast } from 'react-toastify';

// المكون الرئيسي: إدارة الدفعات (المحفظة وسجل السحب)
const VendorPayouts = () => {
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requestAmount, setRequestAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const MIN_PAYOUT_AMOUNT = 50;

  const fetchData = async () => {
    try {
      const [statsRes, historyRes] = await Promise.all([
        vendorApi.getStats(),
        vendorApi.getPayoutHistory()
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (historyRes.success) setHistory(historyRes.data);

    } catch (error) {
      toast.error('فشل تحميل بيانات المحفظة.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRequestPayout = async (e) => {
    e.preventDefault();
    const amount = parseFloat(requestAmount);
    const currentBalance = parseFloat(stats?.currentBalance);

    if (isNaN(amount) || amount < MIN_PAYOUT_AMOUNT || amount > currentBalance) {
      toast.error(`المبلغ يجب أن يكون بين $${MIN_PAYOUT_AMOUNT} و $${currentBalance}`);
      return;
    }

    setIsSubmitting(true);
    try {
      await vendorApi.requestPayout({ amount: amount });
      toast.success('تم إرسال طلب السحب بنجاح. قيد المراجعة.');

      setIsModalOpen(false);
      setRequestAmount('');
      await fetchData();

    } catch (error) {
      toast.error(error.response?.data?.error || 'فشل تقديم الطلب');
    } finally {
      setIsSubmitting(false);
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
    <div className="space-y-8">

      {/* بطاقة طلب السحب */}
      <Card className="bg-orange-50 border-orange-200 border">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Wallet className="h-10 w-10 text-orange-600 bg-orange-200 p-2 rounded-full" />
            <div>
              <p className="text-sm font-medium text-orange-700">الرصيد المتاح حالياً</p>
              <h2 className="text-3xl font-bold text-orange-900">${stats?.currentBalance || '0.00'}</h2>
            </div>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            disabled={parseFloat(stats?.currentBalance) < MIN_PAYOUT_AMOUNT}
            className="bg-orange-600 hover:bg-orange-700 flex items-center gap-1"
          >
            <Send className="h-4 w-4" />
            طلب سحب أرباح
          </Button>
        </div>
        {parseFloat(stats?.currentBalance) < MIN_PAYOUT_AMOUNT && (
            <p className="text-xs text-red-600 mt-2">الحد الأدنى للسحب هو ${MIN_PAYOUT_AMOUNT}</p>
        )}
      </Card>

      {/* سجل الدفعات */}
      <Card>
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5"/>
            سجل طلبات الدفع
        </h3>

        {history.length === 0 ? (
          <div className="p-4 text-center text-gray-500 italic">لم تقم بتقديم أي طلبات سحب حتى الآن.</div>
        ) : (
          <Table>
            <TableHead>
              <TableHeader>ID</TableHeader>
              <TableHeader>المبلغ</TableHeader>
              <TableHeader>الحالة</TableHeader>
              <TableHeader>تاريخ الطلب</TableHeader>
              <TableHeader>تاريخ المعالجة</TableHeader>
            </TableHead>
            <TableBody>
              {history.map((req) => (
                <TableRow key={req.id}>
                  <TableCell>#{req.id}</TableCell>
                  <TableCell className="font-semibold">${Number(req.amount).toFixed(2)}</TableCell>
                  <TableCell>{getStatusBadge(req.status)}</TableCell>
                  <TableCell>{new Date(req.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{req.processed_at ? new Date(req.processed_at).toLocaleDateString() : 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* نموذج طلب السحب (Modal) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="تقديم طلب سحب أرباح"
      >
        <form onSubmit={handleRequestPayout} className="space-y-4">
            <p className="text-sm text-gray-600">
                الرصيد المتاح: <span className="font-bold text-green-600">${stats?.currentBalance || '0.00'}</span>
            </p>
            <Input
                label="المبلغ المطلوب سحبه"
                name="amount"
                type="number"
                step="0.01"
                min={MIN_PAYOUT_AMOUNT}
                max={parseFloat(stats?.currentBalance)}
                value={requestAmount}
                onChange={(e) => setRequestAmount(e.target.value)}
                required
            />
             <Button
                type="submit"
                isLoading={isSubmitting}
                className="w-full bg-orange-600 hover:bg-orange-700"
            >
                إرسال طلب السحب
            </Button>
        </form>
      </Modal>
    </div>
  );
};

export default VendorPayouts;