import React, { useState, useEffect } from 'react';
import { vendorApi } from '../../api/vendorApi';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui/Table';
import { DollarSign, Wallet, Send, Clock, Check } from 'lucide-react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

// قيمة ثابتة للحد الأدنى للسحب (يمكن جلبها من إعدادات النظام لاحقاً)
const MIN_PAYOUT_AMOUNT = 50;

const VendorPayouts = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requestAmount, setRequestAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [statsRes, historyRes] = await Promise.all([
        vendorApi.getStats(),
        vendorApi.getPayoutHistory()
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (historyRes.success) setHistory(historyRes.data);

    } catch (error) {
      toast.error(t('common.error'));
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
    const currentBalance = parseFloat(stats?.currentBalance || 0);
    const currencySymbol = t('common.currency') || '$';

    if (isNaN(amount) || amount < MIN_PAYOUT_AMOUNT || amount > currentBalance) {
      toast.error(t('vendor.payout_error_range', { min: MIN_PAYOUT_AMOUNT, max: currentBalance, currency: currencySymbol }));
      return;
    }

    setIsSubmitting(true);
    try {
      await vendorApi.requestPayout({ amount: amount, notes: t('vendor.payout_request_note') });
      toast.success(t('vendor.payout_submitted') || 'Payout request submitted successfully.');

      setIsModalOpen(false);
      setRequestAmount('');
      await fetchData(); // إعادة تحميل البيانات لتحديث الرصيد والسجل

    } catch (error) {
      toast.error(error.response?.data?.error || t('common.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
        case 'pending':
            return <Badge variant="warning" className="flex items-center gap-1"><Clock className="h-3 w-3" /> {t('admin.status_pending')}</Badge>;
        case 'completed':
            return <Badge variant="success" className="flex items-center gap-1"><Check className="h-3 w-3" /> {t('admin.status_completed')}</Badge>;
        default:
            return <Badge variant="default">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" variant="secondary" />
      </div>
    );
  }

  const currentBalance = parseFloat(stats?.currentBalance || 0);
  const currencySymbol = t('common.currency') || '$';
  const isPayoutDisabled = currentBalance < MIN_PAYOUT_AMOUNT;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >

      {/* بطاقة طلب السحب */}
      <Card className="bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800 border">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Wallet className="h-10 w-10 text-orange-600 dark:text-orange-400 bg-orange-200 dark:bg-orange-800/50 p-2 rounded-full shadow-md" />
            <div>
              <p className="text-sm font-medium text-orange-700 dark:text-orange-300">{t('vendor.stats.current_balance')}</p>
              <h2 className="text-3xl font-bold text-orange-900 dark:text-orange-100">{currencySymbol} {currentBalance.toFixed(2)}</h2>
            </div>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            disabled={isPayoutDisabled}
            className={`flex items-center gap-1 ${isPayoutDisabled ? 'opacity-60' : 'bg-gradient-to-r from-secondary-600 to-secondary-500 hover:opacity-90 shadow-lg shadow-secondary-500/30'}`}
          >
            <Send className="h-4 w-4" />
            {t('vendor.request_payout') || 'Request Payout'}
          </Button>
        </div>
        {isPayoutDisabled && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                {t('vendor.payout_min_amount', { min: MIN_PAYOUT_AMOUNT, currency: currencySymbol })}
            </p>
        )}
      </Card>

      {/* سجل الدفعات */}
      <Card>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2 border-b pb-4 border-gray-100 dark:border-gray-700">
            <DollarSign className="h-6 w-6 text-primary-500"/>
            {t('vendor.payout_history') || 'Payout History'}
        </h3>

        {history.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400 italic">
             {t('common.no_data') || 'No payout requests submitted yet.'}
          </div>
        ) : (
          <Table>
            <TableHead>
              <TableHeader>ID</TableHeader>
              <TableHeader>{t('admin.amount') || 'Amount'}</TableHeader>
              <TableHeader>{t('order.status')}</TableHeader>
              <TableHeader>{t('common.date') || 'Request Date'}</TableHeader>
              <TableHeader>{t('admin.processed_at') || 'Processed At'}</TableHeader>
            </TableHead>
            <TableBody>
              {history.map((req) => (
                <TableRow key={req.id}>
                  <TableCell>#{req.id}</TableCell>
                  <TableCell className="font-semibold text-gray-900 dark:text-white">{currencySymbol} {Number(req.amount).toFixed(2)}</TableCell>
                  <TableCell>{getStatusBadge(req.status)}</TableCell>
                  <TableCell>{new Date(req.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{req.processed_at ? new Date(req.processed_at).toLocaleDateString() : t('common.na')}</TableCell>
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
        title={t('vendor.request_payout')}
      >
        <form onSubmit={handleRequestPayout} className="space-y-6">
            <p className="text-sm text-gray-700 dark:text-gray-300">
                {t('vendor.available_balance') || 'Available Balance'}:
                <span className="font-bold text-green-600 dark:text-green-400 ml-2">
                    {currencySymbol} {currentBalance.toFixed(2)}
                </span>
            </p>
            <Input
                label={t('admin.amount') || 'Amount to Withdraw'}
                name="amount"
                type="number"
                step="0.01"
                min={MIN_PAYOUT_AMOUNT}
                max={currentBalance}
                value={requestAmount}
                onChange={(e) => setRequestAmount(e.target.value)}
                required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('vendor.payout_min_note', { min: MIN_PAYOUT_AMOUNT, currency: currencySymbol })}
            </p>
             <Button
                type="submit"
                isLoading={isSubmitting}
                className="w-full bg-orange-600 hover:bg-orange-700 shadow-lg shadow-secondary-500/20"
            >
                {t('vendor.submit_request') || 'Submit Request'}
            </Button>
        </form>
      </Modal>
    </motion.div>
  );
};

export default VendorPayouts;