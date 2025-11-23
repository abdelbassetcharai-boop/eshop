import React, { useState, useEffect } from 'react';
import { addressApi } from '../../api/addressApi';
import Button from '../../components/ui/Button';
import { MapPin, Plus } from 'lucide-react';

const AddressSelection = ({ selectedId, onSelect }) => {
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
  }, []);

  if (loading) return <div>جاري تحميل العناوين...</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-indigo-600" />
          عنوان الشحن
        </h2>
        <Button size="sm" variant="outline" className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          إضافة جديد
        </Button>
      </div>

      {addresses.length === 0 ? (
        <p className="text-gray-500 text-sm">لا توجد عناوين محفوظة. الرجاء إضافة عنوان.</p>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              onClick={() => onSelect(addr.id)}
              className={`
                p-4 border rounded-md cursor-pointer transition-colors
                ${selectedId === addr.id
                  ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600'
                  : 'border-gray-200 hover:border-gray-300'}
              `}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-gray-900">{addr.address_line1}</p>
                  <p className="text-sm text-gray-500">{addr.city}, {addr.country}</p>
                  <p className="text-sm text-gray-500">{addr.postal_code}</p>
                </div>
                {selectedId === addr.id && (
                  <span className="h-2 w-2 bg-indigo-600 rounded-full"></span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressSelection;