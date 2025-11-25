import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { User, Mail, Shield, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence  } from 'framer-motion';

const Profile = () => {
  const { t } = useTranslation();
  const { user, updateProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
    <div className="max-w-4xl mx-auto space-y-6 min-h-[70vh]">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        {t('nav.profile')}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* القسم الجانبي: بطاقة المعلومات */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="md:col-span-1 h-fit"
        >
          <Card className="bg-white dark:bg-dark-card border border-gray-100 dark:border-gray-700 shadow-lg">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-24 w-24 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/50 dark:to-primary-800/30 rounded-full flex items-center justify-center shadow-inner">
                <User className="h-12 w-12 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{user?.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
              </div>
              <div className="w-full pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse text-sm text-gray-600 dark:text-gray-300">
                  <Shield className="h-4 w-4 text-primary-500" />
                  <span>{t('auth.account_type') || 'Account Type'}: <span className="font-semibold capitalize text-primary-600 dark:text-primary-400">{user?.role}</span></span>
                </div>
              </div>
              <Link to="/orders" className="w-full">
                <Button variant="secondary" className="w-full mt-2 flex items-center justify-center gap-2">
                  <Package className="h-4 w-4" />
                  {t('nav.orders') || 'My Orders'}
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>

        {/* القسم الرئيسي: نموذج التعديل */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="md:col-span-2"
        >
          <Card className="bg-white dark:bg-dark-card border border-gray-100 dark:border-gray-700 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {t('auth.update_profile') || 'Update Profile'}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? (t('common.cancel') || 'Cancel') : (t('common.edit') || 'Edit')}
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <Input
                  label={t('auth.name')}
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  icon={<User className="h-5 w-5" />}
                  className={!isEditing ? "bg-gray-50 dark:bg-gray-800/50 border-transparent" : ""}
                />

                <Input
                  label={t('auth.email')}
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  icon={<Mail className="h-5 w-5" />}
                  className={!isEditing ? "bg-gray-50 dark:bg-gray-800/50 border-transparent" : ""}
                />
              </div>

              <AnimatePresence>
                {isEditing && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex justify-end pt-4"
                  >
                    <Button type="submit" isLoading={isLoading} variant="primary">
                      {t('common.save_changes') || 'Save Changes'}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;