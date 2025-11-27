import api from './api';

export const authApi = {
  register: async (userData) => { const response = await api.post('/auth/register', userData); return response.data; },
  registerVendor: async (vendorData) => { const response = await api.post('/auth/vendor/register', vendorData); return response.data; },
  login: async (credentials) => { const response = await api.post('/auth/login', credentials); return response.data; },
  getMe: async () => { const response = await api.get('/auth/me'); return response.data; },
  updateDetails: async (details) => { const response = await api.put('/auth/updatedetails', details); return response.data; },
  logout: async () => { const response = await api.get('/auth/logout'); return response.data; },

  // --- الجديد ---
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgotpassword', { email });
    return response.data;
  },

  resetPassword: async (data) => { // data: { email, code, password }
    const response = await api.post('/auth/resetpassword', data);
    return response.data;
  }
};