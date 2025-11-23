import React, { useState, useEffect } from 'react';
import { productApi } from '../../api/productApi';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui/Table';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import ProductForm from './ProductForm';
import Modal from '../../components/ui/Modal';

const ProductManagement = () => {
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
      toast.error('فشل تحميل المنتجات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      try {
        await productApi.delete(id);
        setProducts(products.filter(p => p.id !== id));
        toast.success('تم حذف المنتج');
      } catch (error) {
        toast.error('فشل حذف المنتج');
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

  if (loading) return <div className="py-10"><Spinner /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">إدارة المنتجات</h2>
        <Button onClick={handleAddNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> إضافة منتج
        </Button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <Table>
          <TableHead>
            <TableHeader>ID</TableHeader>
            <TableHeader>الاسم</TableHeader>
            <TableHeader>السعر</TableHeader>
            <TableHeader>المخزون</TableHeader>
            <TableHeader>إجراءات</TableHeader>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>#{product.id}</TableCell>
                <TableCell>
                  <div className="font-medium text-gray-900">{product.name}</div>
                </TableCell>
                <TableCell>${Number(product.price).toFixed(2)}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <button onClick={() => handleEdit(product)} className="text-indigo-600 hover:text-indigo-900">
                      <Edit className="h-5 w-5" />
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* نموذج الإضافة/التعديل */}
      <Modal
        isOpen={isFormOpen}
        onClose={handleFormClose}
        title={editingProduct ? 'تعديل منتج' : 'إضافة منتج جديد'}
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