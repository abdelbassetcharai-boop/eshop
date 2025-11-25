import React, { useState, useEffect } from 'react';
import { productApi } from '../../api/productApi';
import { adminApi } from '../../api/adminApi';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import { Trash2, Plus, Layers } from 'lucide-react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Card from '../../components/ui/Card';

const CategoryManagement = () => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await productApi.getCategories();
      if (res.success) setCategories(res.data);
    } catch (error) {
      console.error(error);
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    setIsAdding(true);
    try {
      const res = await adminApi.createCategory({ name: newCategory });
      if (res.success) {
        toast.success(t('common.success_create') || 'Category added successfully');
        setNewCategory('');
        fetchCategories();
      }
    } catch (error) {
      toast.error(t('common.error'));
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('common.confirm_delete'))) {
      try {
        await adminApi.deleteCategory(id);
        setCategories(categories.filter(c => c.id !== id));
        toast.success(t('common.success_delete'));
      } catch (error) {
        toast.error(t('common.error')); // قد يكون التصنيف مرتبطاً بمنتجات
      }
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* نموذج الإضافة */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="md:col-span-1"
      >
        <Card className="sticky top-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg text-primary-600 dark:text-primary-400">
              <Layers className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">
              {t('admin.add_category') || 'Add Category'}
            </h3>
          </div>

          <form onSubmit={handleAdd} className="space-y-4">
            <Input
              placeholder={t('admin.category_name_placeholder') || 'New Category Name'}
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              disabled={isAdding}
            />
            <Button
              type="submit"
              isLoading={isAdding}
              className="w-full flex items-center justify-center gap-2 shadow-md"
              disabled={!newCategory.trim()}
            >
              <Plus className="h-4 w-4" />
              {t('common.add') || 'Add'}
            </Button>
          </form>
        </Card>
      </motion.div>

      {/* جدول العرض */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="md:col-span-2 bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden"
      >
        <Table>
          <TableHead>
            <TableHeader>ID</TableHeader>
            <TableHeader>{t('product.category') || 'Category'}</TableHeader>
            <TableHeader>{t('common.actions')}</TableHeader>
          </TableHead>
          <TableBody>
            {categories.length === 0 ? (
               <tr>
                 <td colSpan="3" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                   {t('common.no_data') || 'No categories found.'}
                 </td>
               </tr>
            ) : (
              categories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell>#{cat.id}</TableCell>
                  <TableCell>
                    <span className="font-medium text-gray-900 dark:text-white">{cat.name}</span>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title={t('common.delete')}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  );
};

export default CategoryManagement;