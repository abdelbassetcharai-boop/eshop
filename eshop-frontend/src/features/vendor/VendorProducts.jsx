import React, { useState, useEffect, useCallback } from 'react';
import { productApi } from '../../api/productApi';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import ProductForm from '../admin/ProductForm';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const VendorProducts = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      // جلب المنتجات الخاصة بالبائع الحالي فقط
      const res = await productApi.getAll({ vendor: user.id, limit: 100 });
      if (res.success) {
        setProducts(res.data);
      }
    } catch (error) {
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [user?.id, t]);

  useEffect(() => {
    if (user?.id) {
        fetchProducts();
    }
  }, [fetchProducts, user?.id]);

  const handleDelete = async (id) => {
    if (window.confirm(t('common.confirm_delete'))) {
      try {
        await productApi.delete(id);
        setProducts(products.filter(p => p.id !== id));
        toast.success(t('common.success_delete') || 'Product deleted successfully');
      } catch (error) {
        toast.error(t('common.error'));
      }
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
  };

  const handleFormSuccess = () => {
    handleFormClose();
    fetchProducts();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" variant="secondary" />
      </div>
    );
  }

  const getStockBadge = (stock) => {
    if (stock > 10) return <Badge variant="success">{t('product.in_stock') || 'In Stock'}</Badge>;
    if (stock > 0) return <Badge variant="warning">{t('product.low_stock') || 'Low Stock'}</Badge>;
    return <Badge variant="danger">{t('product.out_of_stock')}</Badge>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {t('vendor.my_products') || 'My Products'}
        </h2>
        <Button
          onClick={handleAddNew}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 shadow-lg shadow-secondary-500/30"
          variant="gradient"
        >
          <Plus className="h-4 w-4" /> {t('admin.add_product') || 'Add New Product'}
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-dark-card shadow-sm rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden"
      >
        {products.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <Package className='h-10 w-10 mx-auto mb-3' />
                {t('shop.no_products') || 'You have not added any products yet.'}
            </div>
        ) : (
            <Table>
            <TableHead>
                <TableHeader>ID</TableHeader>
                <TableHeader>{t('product.name')}</TableHeader>
                <TableHeader>{t('product.price')}</TableHeader>
                <TableHeader>{t('product.stock') || 'Stock'}</TableHeader>
                <TableHeader>{t('order.status') || 'Status'}</TableHeader>
                <TableHeader>{t('common.actions')}</TableHeader>
            </TableHead>
            <TableBody>
                {products.map((product) => (
                <TableRow key={product.id}>
                    <TableCell>#{product.id}</TableCell>
                    <TableCell>
                      <div className="font-medium text-gray-900 dark:text-white">{product.name}</div>
                    </TableCell>
                    <TableCell className="font-semibold">{Number(product.price).toFixed(2)} {t('common.currency')}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>
                        {getStockBadge(product.stock)}
                    </TableCell>
                    <TableCell>
                    <div className="flex space-x-2 rtl:space-x-reverse">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                          title={t('common.edit')}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title={t('common.delete')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        )}
      </motion.div>

      {/* نموذج الإضافة/التعديل */}
      <Modal
        isOpen={isFormOpen}
        onClose={handleFormClose}
        title={editingProduct ? (t('admin.edit_product') || 'Edit Product') : (t('admin.add_product') || 'Add New Product')}
      >
        {/* ملاحظة: يتم استدعاء ProductForm من مجلد admin لأنه مكون مشترك لإدارة المنتج */}
        <ProductForm
          product={editingProduct}
          onSuccess={handleFormSuccess}
          onCancel={handleFormClose}
        />
      </Modal>
    </div>
  );
};

export default VendorProducts;