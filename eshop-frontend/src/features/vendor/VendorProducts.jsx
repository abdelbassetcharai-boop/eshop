import React, { useState, useEffect, useCallback } from 'react';
import { productApi } from '../../api/productApi';
import Button from '../../components/ui/Button'; // تصحيح المسار
import Spinner from '../../components/ui/Spinner'; // تصحيح المسار
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui/Table'; // تصحيح المسار
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import ProductForm from '../admin/ProductForm';
import Modal from '../../components/ui/Modal'; // تصحيح المسار
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/ui/Badge'; // تصحيح المسار

const VendorProducts = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productApi.getAll({ vendor: user.id, limit: 100 });
      if (res.success) {
        setProducts(res.data);
      }
    } catch (error) {
      toast.error('فشل تحميل منتجات متجرك.');
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    if (user?.id) {
        fetchProducts();
    }
  }, [fetchProducts, user?.id]);

  const handleDelete = async (id) => {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
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
    fetchProducts();
  };

  if (loading) return <div className="py-10"><Spinner /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">منتجات متجري</h2>
        <Button onClick={handleAddNew} className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700">
          <Plus className="h-4 w-4" /> إضافة منتج جديد
        </Button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {products.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
                لم تقم بإضافة أي منتجات بعد.
            </div>
        ) : (
            <Table>
            <TableHead>
                <TableHeader>ID</TableHeader>
                <TableHeader>الاسم</TableHeader>
                <TableHeader>السعر</TableHeader>
                <TableHeader>المخزون</TableHeader>
                <TableHeader>الحالة</TableHeader>
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
                        <Badge variant={product.stock > 0 ? 'success' : 'danger'}>
                            {product.stock > 0 ? 'متوفر' : 'نفذ'}
                        </Badge>
                    </TableCell>
                    <TableCell>
                    <div className="flex space-x-2">
                        <button onClick={() => handleEdit(product)} className="text-orange-600 hover:text-orange-900">
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
        )}
      </div>

      {/* نموذج الإضافة/التعديل */}
      <Modal
        isOpen={isFormOpen}
        onClose={handleFormClose}
        title={editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
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

export default VendorProducts;