import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Button } from '../ui/Button';
import { apiPost } from '../../utils/api';

import { useAuth } from '../../context/AuthContext';

interface CheckoutFormProps {
  transactionId: string;
  onSuccess: () => void;
  onError: (msg: string) => void;
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({ transactionId, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { token } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.href,
      },
      redirect: "if_required"
    });

    if (error) {
      onError(error.message || 'Payment failed');
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      try {
        await apiPost('/payments/deposit/confirm', {
          transactionId,
          paymentIntentId: paymentIntent.id
        }, token);
        onSuccess();
      } catch (err) {
        onError((err as Error).message || 'Network error during verification');
      } finally {
        setIsProcessing(false);
      }
    } else {
       onError('Payment processing failed or requires additional action.');
       setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing} 
        fullWidth
      >
        {isProcessing ? 'Processing...' : 'Confirm Deposit'}
      </Button>
    </form>
  );
};
