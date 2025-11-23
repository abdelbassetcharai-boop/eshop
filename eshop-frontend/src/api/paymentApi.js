import api from './api';

export const paymentApi = {
  processPayment: async (paymentData) => {
    // paymentData: { orderId, paymentMethod, amount }
    const response = await api.post('/payments', paymentData);
    return response.data;
  }
};