import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { toast } from 'react-toastify';
import { Check, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const VendorsTable = () => {
  const { t } = useTranslation();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(null);

  const fetchVendors = async () => {
    try {
      const res = await adminApi.getVendorsList();
      if (res.success) setVendors(res.data);
    } catch (error) {
      toast.error(t('common.error'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleApprove = async (userId) => {
    setIsApproving(userId);
    try {
      await adminApi.approveVendor(userId);
      toast.success(t('admin.vendor_approved') || 'Vendor approved successfully');

      setVendors(vendors.map(v =>
        v.user_id === userId ? { ...v, is_approved: true } : v
      ));
    } catch (error) {
      toast.error(t('common.error'));
    } finally {
      setIsApproving(null);
    }
  };

  const getStatusBadge = (isApproved) => {
    return isApproved
      ? <Badge variant="success" className="flex items-center gap-1"><Check className="h-3 w-3" /> {t('admin.status_approved') || 'Approved'}</Badge>
      : <Badge variant="warning" className="flex items-center gap-1"><Clock className="h-3 w-3" /> {t('admin.status_pending') || 'Pending'}</Badge>;
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
          {t('admin.vendors_management') || 'Vendors Management'}
        </h3>
      </div>

      {vendors.length === 0 ? (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          {t('common.no_data') || 'No vendors found.'}
        </div>
      ) : (
        <Table>
          <TableHead>
            <TableHeader>{t('auth.store_name') || 'Store'}</TableHeader>
            <TableHeader>{t('auth.email')}</TableHeader>
            <TableHeader>{t('admin.balance') || 'Balance'}</TableHeader>
            <TableHeader>{t('order.status') || 'Status'}</TableHeader>
            <TableHeader>{t('common.date') || 'Date'}</TableHeader>
            <TableHeader>{t('common.actions') || 'Actions'}</TableHeader>
          </TableHead>
          <TableBody>
            {vendors.map((vendor) => (
              <TableRow key={vendor.user_id}>
                <TableCell>
                  <div className="font-medium text-gray-900 dark:text-white">{vendor.store_name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">ID: #{vendor.user_id}</div>
                </TableCell>
                <TableCell>{vendor.email}</TableCell>
                <TableCell className="font-semibold text-gray-900 dark:text-white">${Number(vendor.balance).toFixed(2)}</TableCell>
                <TableCell>{getStatusBadge(vendor.is_approved)}</TableCell>
                <TableCell>{new Date(vendor.user_since).toLocaleDateString()}</TableCell>
                <TableCell>
                  {!vendor.is_approved ? (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleApprove(vendor.user_id)}
                      isLoading={isApproving === vendor.user_id}
                      className="flex items-center gap-1"
                    >
                      <Check className="h-4 w-4" />
                      {t('admin.approve') || 'Approve'}
                    </Button>
                  ) : (
                    <span className="text-sm text-gray-500 dark:text-gray-400 italic">
                      {t('admin.status_completed') || 'Completed'}
                    </span>
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

export default VendorsTable;