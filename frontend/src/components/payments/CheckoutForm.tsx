import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Button } from '../ui/Button';
import { API_URL } from '../../context/AuthContext';

interface CheckoutFormProps {
  transactionId: string;
  onSuccess: () => void;
  onError: (msg: string) => void;
}

const API = API_URL;

export const CheckoutForm: React.FC<CheckoutFormProps> = ({ transactionId, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.href, // Stripe requires this but we're handling it via redirect:'if_required' usually, but here we'll use confirmPayment without redirect if possible.
      },
      redirect: "if_required"
    });

    if (error) {
      onError(error.message || 'Payment failed');
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      // Confirm with backend
      try {
        const token = localStorage.getItem('nexus_token');
        const res = await fetch(`${API}/payments/deposit/confirm`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            transactionId,
            paymentIntentId: paymentIntent.id
          })
        });
        
        if (res.ok) {
          onSuccess();
        } else {
          onError('Failed to verify payment with server');
        }
      } catch (err) {
        onError('Network error during verification');
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
