import React, { useState, useEffect } from 'react';
import { addressApi } from '../../api/addressApi';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import { MapPin, Plus, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const AddressSelection = ({ selectedId, onSelect }) => {
  const { t } = useTranslation();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await addressApi.getAll();
        if (res.success) {
          setAddresses(res.data);
          // تحديد أول عنوان تلقائياً إذا لم يتم التحديد
          if (res.data.length > 0 && !selectedId) {
            onSelect(res.data[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch addresses', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, [selectedId, onSelect]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Spinner size="md" variant="primary" />
      </div>
    );
  }

  return (
    <Card className="shadow-lg">
      <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <MapPin className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          {t('checkout.shipping_address') || 'Shipping Address'}
        </h2>
        <Button size="sm" variant="secondary" className="flex items-center gap-1 shadow-sm">
          <Plus className="h-4 w-4" />
          {t('checkout.add_new_address') || 'Add New'}
        </Button>
      </div>

      {addresses.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {t('checkout.no_address') || 'No saved addresses. Please add a new one.'}
        </p>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
          className="space-y-4"
        >
          {addresses.map((addr) => (
            <motion.div
              key={addr.id}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              onClick={() => onSelect(addr.id)}
              className={`
                p-4 border rounded-xl cursor-pointer transition-all duration-200 shadow-sm
                ${selectedId === addr.id
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 ring-2 ring-primary-500 shadow-lg'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 bg-white dark:bg-dark-card'}
              `}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{addr.address_line1}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {addr.city}, {addr.country} - {addr.postal_code}
                  </p>
                  {addr.phone && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {t('auth.phone') || 'Phone'}: {addr.phone}
                    </p>
                  )}
                </div>
                {selectedId === addr.id && (
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 ml-4" />
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </Card>
  );
};

export default AddressSelection;