import React, { useState, useEffect } from 'react';
import { productApi } from '../../api/productApi';
import { adminApi } from '../../api/adminApi';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Trash2, Plus } from 'lucide-react';
import { toast } from 'react-toastify';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const res = await productApi.getCategories();
      if (res.success) setCategories(res.data);
    } catch (error) {
      console.error(error);
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

    try {
      const res = await adminApi.createCategory({ name: newCategory });
      if (res.success) {
        toast.success('تمت إضافة التصنيف');
        setNewCategory('');
        fetchCategories();
      }
    } catch (error) {
      toast.error('فشل إضافة التصنيف');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد؟ قد يؤثر هذا على المنتجات المرتبطة.')) {
      try {
        await adminApi.deleteCategory(id);
        setCategories(categories.filter(c => c.id !== id));
        toast.success('تم الحذف');
      } catch (error) {
        toast.error('فشل الحذف (ربما مرتبط بمنتجات)');
      }
    }
  };

  if (loading) return <div>جاري التحميل...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* نموذج الإضافة */}
      <div className="md:col-span-1">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-bold text-lg mb-4">إضافة تصنيف</h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <Input
              placeholder="اسم التصنيف الجديد"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <Button type="submit" className="w-full flex items-center justify-center gap-2">
              <Plus className="h-4 w-4" /> إضافة
            </Button>
          </form>
        </div>
      </div>

      {/* جدول العرض */}
      <div className="md:col-span-2 bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHead>
            <TableHeader>ID</TableHeader>
            <TableHeader>الاسم</TableHeader>
            <TableHeader>إجراءات</TableHeader>
          </TableHead>
          <TableBody>
            {categories.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell>#{cat.id}</TableCell>
                <TableCell className="font-medium">{cat.name}</TableCell>
                <TableCell>
                  <button onClick={() => handleDelete(cat.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CategoryManagement;