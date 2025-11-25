import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { toast } from 'react-toastify';
import { Check, DollarSign, Clock, Store } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const PayoutRequests = () => {
  const { t } = useTranslation();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(null);

  const fetchRequests = async () => {
    try {
      const res = await adminApi.getPayoutRequests();
      if (res.success) setRequests(res.data);
    } catch (error) {
      toast.error(t('common.error'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleProcess = async (payoutId) => {
    if (!window.confirm(t('admin.confirm_payout') || 'Are you sure you want to process this payout?')) {
        return;
    }

    setIsProcessing(payoutId);
    try {
      await adminApi.processPayout(payoutId);
      toast.success(t('admin.payout_processed') || 'Payout processed successfully');

      setRequests(requests.filter(r => r.id !== payoutId));
    } catch (error) {
      toast.error(t('common.error'));
      console.error(error);
    } finally {
      setIsProcessing(null);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
        case 'pending':
            return <Badge variant="warning" className="flex items-center gap-1"><Clock className="h-3 w-3" /> {t('admin.status_pending') || 'Pending'}</Badge>;
        case 'completed':
            return <Badge variant="success" className="flex items-center gap-1"><Check className="h-3 w-3" /> {t('admin.status_completed') || 'Completed'}</Badge>;
        default:
            return <Badge variant="default">{status}</Badge>;
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
          {t('admin.payouts_requests') || 'Payout Requests'}
        </h3>
      </div>

      {requests.length === 0 ? (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          {t('common.no_data') || 'No pending payout requests.'}
        </div>
      ) : (
        <Table>
          <TableHead>
            <TableHeader>ID</TableHeader>
            <TableHeader>{t('nav.vendor') || 'Vendor'}</TableHeader>
            <TableHeader>{t('admin.amount') || 'Amount'}</TableHeader>
            <TableHeader>{t('admin.balance') || 'Balance'}</TableHeader>
            <TableHeader>{t('common.date') || 'Date'}</TableHeader>
            <TableHeader>{t('common.actions') || 'Actions'}</TableHeader>
          </TableHead>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>#{request.id}</TableCell>
                <TableCell>
                  <div className="font-medium text-gray-900 dark:text-white">{request.store_name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">ID: #{request.vendor_id}</div>
                </TableCell>
                <TableCell className="font-bold text-red-600 dark:text-red-400">${Number(request.amount).toFixed(2)}</TableCell>
                <TableCell className="font-semibold text-gray-900 dark:text-white">${Number(request.balance).toFixed(2)}</TableCell>
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
                      {t('admin.process') || 'Process'}
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
    </motion.div>
  );
};

export default PayoutRequests;