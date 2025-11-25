import React, { useState, useEffect } from 'react';
import { productApi } from '../../api/productApi';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui/Table';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import ProductForm from './ProductForm';
import Modal from '../../components/ui/Modal';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const ProductManagement = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productApi.getAll({ limit: 100 }); // جلب عدد كبير للإدارة
      if (res.success) {
        setProducts(res.data);
      }
    } catch (error) {
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm(t('common.confirm_delete') || 'Are you sure you want to delete this item?')) {
      try {
        await productApi.delete(id);
        setProducts(products.filter(p => p.id !== id));
        toast.success(t('common.success_delete') || 'Deleted successfully');
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
    fetchProducts(); // إعادة تحميل القائمة
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" variant="primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {t('admin.product_management') || 'Product Management'}
        </h2>
        <Button onClick={handleAddNew} className="flex items-center gap-2 shadow-lg shadow-primary-500/20">
          <Plus className="h-4 w-4" />
          {t('admin.add_product') || 'Add Product'}
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-dark-card shadow-sm rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden"
      >
        <Table>
          <TableHead>
            <TableHeader>ID</TableHeader>
            <TableHeader>{t('product.name') || 'Name'}</TableHeader>
            <TableHeader>{t('product.price') || 'Price'}</TableHeader>
            <TableHeader>{t('product.stock') || 'Stock'}</TableHeader>
            <TableHeader>{t('common.actions') || 'Actions'}</TableHeader>
          </TableHead>
          <TableBody>
            {products.length === 0 ? (
               <tr>
                 <td colSpan="5" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                   {t('shop.no_products')}
                 </td>
               </tr>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>#{product.id}</TableCell>
                  <TableCell>
                    <div className="font-medium text-gray-900 dark:text-white">{product.name}</div>
                  </TableCell>
                  <TableCell>${Number(product.price).toFixed(2)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.stock > 10
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : product.stock > 0
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {product.stock}
                    </span>
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
              ))
            )}
          </TableBody>
        </Table>
      </motion.div>

      {/* نموذج الإضافة/التعديل */}
      <Modal
        isOpen={isFormOpen}
        onClose={handleFormClose}
        title={editingProduct ? (t('admin.edit_product') || 'Edit Product') : (t('admin.add_product') || 'Add Product')}
      >
        <ProductForm
          product={editingProduct}
          onSuccess={handleFormSuccess}
          onCancel={handleFormClose}
        />
      </Modal>
    </div>
  );
};

export default ProductManagement;