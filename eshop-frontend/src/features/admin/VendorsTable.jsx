import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { toast } from 'react-toastify';
import { Check, X, Clock } from 'lucide-react';

const VendorsTable = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(null); // لتتبع حالة الموافقة لكل بائع

  const fetchVendors = async () => {
    try {
      const res = await adminApi.getVendorsList();
      if (res.success) setVendors(res.data);
    } catch (error) {
      toast.error('فشل تحميل قائمة البائعين');
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
      toast.success('تم اعتماد البائع بنجاح!');

      // تحديث الحالة محلياً
      setVendors(vendors.map(v =>
        v.user_id === userId ? { ...v, is_approved: true } : v
      ));
    } catch (error) {
      toast.error('فشل اعتماد البائع');
    } finally {
      setIsApproving(null);
    }
  };

  const getStatusBadge = (isApproved) => {
    return isApproved
      ? <Badge variant="success" className="flex items-center gap-1"><Check className="h-3 w-3" /> معتمد</Badge>
      : <Badge variant="warning" className="flex items-center gap-1"><Clock className="h-3 w-3" /> قيد الانتظار</Badge>;
  };

  if (loading) return <div className="py-10"><Spinner /></div>;

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">إدارة البائعين</h3>
      </div>

      {vendors.length === 0 ? (
        <div className="p-6 text-center text-gray-500">لا يوجد بائعون مسجلون حالياً.</div>
      ) : (
        <Table>
          <TableHead>
            <TableHeader>المتجر</TableHeader>
            <TableHeader>البريد الإلكتروني</TableHeader>
            <TableHeader>الرصيد</TableHeader>
            <TableHeader>الحالة</TableHeader>
            <TableHeader>تاريخ التسجيل</TableHeader>
            <TableHeader>إجراءات</TableHeader>
          </TableHead>
          <TableBody>
            {vendors.map((vendor) => (
              <TableRow key={vendor.user_id}>
                <TableCell>
                  <div className="font-medium text-gray-900">{vendor.store_name}</div>
                  <div className="text-xs text-gray-500">ID: #{vendor.user_id}</div>
                </TableCell>
                <TableCell>{vendor.email}</TableCell>
                <TableCell className="font-semibold">${Number(vendor.balance).toFixed(2)}</TableCell>
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
                      اعتماد
                    </Button>
                  ) : (
                    <span className="text-sm text-gray-500 italic">مكتمل</span>
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

export default VendorsTable;