import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { User, Mail, Shield, Package } from 'lucide-react';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user, updateProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // تعبئة البيانات عند تحميل الصفحة
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await updateProfile(formData);
    setIsLoading(false);
    if (success) {
      setIsEditing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">الملف الشخصي</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* القسم الجانبي: بطاقة المعلومات */}
        <Card className="md:col-span-1 h-fit">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="h-24 w-24 bg-indigo-100 rounded-full flex items-center justify-center">
              <User className="h-12 w-12 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{user?.name}</h3>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
            <div className="w-full pt-4 border-t border-gray-200">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                <Shield className="h-4 w-4" />
                <span>نوع الحساب: <span className="font-semibold capitalize">{user?.role}</span></span>
              </div>
            </div>
            <Link to="/orders" className="w-full">
              <Button variant="outline" className="w-full mt-2">
                <Package className="h-4 w-4 mr-2" />
                طلباتي السابقة
              </Button>
            </Link>
          </div>
        </Card>

        {/* القسم الرئيسي: نموذج التعديل */}
        <Card className="md:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">تحديث البيانات</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'إلغاء' : 'تعديل'}
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <Input
                label="الاسم"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
                icon={<User className="h-5 w-5 text-gray-400" />}
              />

              <Input
                label="البريد الإلكتروني"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditing}
                icon={<Mail className="h-5 w-5 text-gray-400" />}
              />
            </div>

            {isEditing && (
              <div className="flex justify-end pt-4">
                <Button type="submit" isLoading={isLoading}>
                  حفظ التغييرات
                </Button>
              </div>
            )}
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Profile;