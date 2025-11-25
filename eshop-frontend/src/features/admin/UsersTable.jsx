import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const UsersTable = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await adminApi.getUsers();
        if (res.success) setUsers(res.data);
      } catch (error) {
        console.error(error);
        toast.error(t('common.error'));
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [t]);

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
          {t('admin.users') || 'Users'}
        </h3>
      </div>

      {users.length === 0 ? (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          {t('common.no_data') || 'No users found.'}
        </div>
      ) : (
        <Table>
          <TableHead>
            <TableHeader>{t('auth.name')}</TableHeader>
            <TableHeader>{t('auth.email')}</TableHeader>
            <TableHeader>{t('auth.account_type') || 'Role'}</TableHeader>
            <TableHeader>{t('common.date') || 'Date'}</TableHeader>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge
                    variant={user.role === 'admin' ? 'danger' : user.role === 'vendor' ? 'warning' : 'info'}
                  >
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </motion.div>
  );
};

export default UsersTable;