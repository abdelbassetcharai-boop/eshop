import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../../api/api';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { toast } from 'react-toastify';

// مفتاح Stripe العام (تأكد من أنه المفتاح العام Publishable Key وليس السري)
// يفضل وضعه في متغيرات البيئة VITE_STRIPE_PK
const stripePromise = loadStripe('pk_test_51SXpvcLNDEqCIB84EbWUzV0oXCMDcCJ42zPQhEmbLbR1IAWEWrrLyuK45XOuijH3HBBXJuROmQXPX78L2QPRYNV300Z2nTDUxz');

const CheckoutForm = ({ orderId, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);

    try {
        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // هذا الرابط مهم لإعادة توجيه المستخدم في حال تطلب الدفع ذلك
                return_url: window.location.origin + '/orders',
            },
            redirect: 'if_required',
        });

        if (error) {
            setMessage(error.message);
            // onError(error.message); // اختياري: إبلاغ الأب
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            onSuccess(paymentIntent.id);
        } else {
            setMessage('Payment status: ' + (paymentIntent?.status || 'unknown'));
        }
    } catch (err) {
        setMessage('An unexpected error occurred.');
        console.error(err);
    } finally {
        setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {message && <div className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-200">{message}</div>}
      <Button
        type="submit"
        disabled={isProcessing || !stripe || !elements}
        className="w-full mt-4"
        isLoading={isProcessing}
      >
        {isProcessing ? 'Processing Payment...' : 'Pay Now'}
      </Button>
    </form>
  );
};

const StripePayment = ({ orderId, onPaymentSuccess }) => {
  const [clientSecret, setClientSecret] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderId) return;

    // طلب نية الدفع من الباك إند
    api.post('/payments/create-intent', { orderId })
      .then(res => {
          if(res.data.success) {
              setClientSecret(res.data.clientSecret);
          } else {
              setError('Failed to initialize payment.');
          }
      })
      .catch(err => {
          console.error(err);
          setError('Could not load payment system. Please try again.');
          // toast.error('Payment initialization failed');
      });
  }, [orderId]);

  if (error) {
      return <div className="p-4 text-center text-red-600 bg-red-50 rounded-xl border border-red-200">{error}</div>;
  }

  if (!clientSecret) {
    return (
        <div className="flex flex-col justify-center items-center p-8 space-y-3">
            <Spinner size="lg" />
            <p className="text-gray-500 text-sm">Loading secure payment...</p>
        </div>
    );
  }

  const options = {
    clientSecret,
    appearance: { theme: 'stripe' },
  };

  return (
    <div className="p-6 border rounded-2xl bg-white dark:bg-gray-800 shadow-sm">
      <Elements options={options} stripe={stripePromise}>
        <CheckoutForm
            orderId={orderId}
            onSuccess={onPaymentSuccess}
            onError={(msg) => console.error(msg)}
        />
      </Elements>
    </div>
  );
};

export default StripePayment;