import React, { useState, useEffect } from 'react';
import { DollarSign, ArrowUpCircle, ArrowDownCircle, Send, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { CheckoutForm } from '../../components/payments/CheckoutForm';
import { useAuth } from '../../context/AuthContext';
import { apiGet, apiPost } from '../../utils/api';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_mock_key_only_for_startup');

interface Transaction {
  _id: string;
  type: 'deposit' | 'withdraw' | 'transfer';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  description: string;
  reference: string;
  toUser?: { name: string; email: string };
  user?: { name: string; email: string };
  createdAt: string;
}

export const PaymentsPage: React.FC = () => {
  const { token } = useAuth();
  const [balance, setBalance] = useState('0.00');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'transfer'>('deposit');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [recipientId, setRecipientId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [b, h] = await Promise.all([
        apiGet<{ balance: string }>('/payments/balance', token),
        apiGet<Transaction[]>('/payments/history', token)
      ]);
      setBalance(b.balance);
      setTransactions(h);
    } catch (err) {
      console.error('Failed to fetch payment data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const body: any = { amount: parseFloat(amount), description };
      if (activeTab === 'transfer') body.toUserId = recipientId;

      const data = await apiPost<any>(`/payments/${activeTab}`, body, token);

      if (activeTab === 'deposit' && data.clientSecret) {
        setClientSecret(data.clientSecret);
        setTransactionId(data._id);
      } else {
        setMessage({ type: 'success', text: data.message || 'Transaction initiated!' });
        setAmount('');
        setDescription('');
        setRecipientId('');
        setTimeout(fetchData, 2000);
      }
    } catch (err) {
      setMessage({ type: 'error', text: (err as Error).message || 'Network error' });
    } finally {
      setSubmitting(false);
    }
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle size={16} className="text-green-500" />;
      case 'pending': return <Clock size={16} className="text-yellow-500" />;
      case 'failed': return <XCircle size={16} className="text-red-500" />;
      default: return null;
    }
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 dark:bg-gray-700'}`}>
        {statusIcon(status)}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const typeIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <ArrowDownCircle size={18} className="text-green-600 dark:text-green-400" />;
      case 'withdraw': return <ArrowUpCircle size={18} className="text-red-600 dark:text-red-400" />;
      case 'transfer': return <Send size={18} className="text-blue-600 dark:text-blue-400" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payments</h1>
        <button
          onClick={fetchData}
          className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl p-6 text-white shadow-lg">
        <p className="text-sm font-medium opacity-80">Wallet Balance</p>
        <p className="text-4xl font-bold mt-1">${balance}</p>
        <p className="text-sm opacity-60 mt-2">Available for transactions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="flex border-b border-gray-200 dark:border-gray-800">
              {(['deposit', 'withdraw', 'transfer'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setMessage(null); }}
                  className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${
                    activeTab === tab
                      ? 'text-primary-700 dark:text-primary-400 border-b-2 border-primary-600'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className="p-4 space-y-4">
              {clientSecret && transactionId && activeTab === 'deposit' ? (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Complete Deposit via Stripe Sandbox</h3>
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <CheckoutForm 
                      transactionId={transactionId}
                      onSuccess={() => {
                        setMessage({ type: 'success', text: 'Deposit confirmed successfully!' });
                        setClientSecret(null);
                        setTransactionId(null);
                        setAmount('');
                        setDescription('');
                        fetchData();
                      }}
                      onError={(msg) => {
                        setMessage({ type: 'error', text: msg });
                        setClientSecret(null);
                        setTransactionId(null);
                      }}
                    />
                  </Elements>
                  <button
                    onClick={() => { setClientSecret(null); setTransactionId(null); }}
                    className="mt-4 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 w-full text-center"
                  >
                    Cancel Deposit
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {activeTab === 'transfer' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Recipient User ID</label>
                      <input
                        type="text"
                        value={recipientId}
                        onChange={(e) => setRecipientId(e.target.value)}
                        placeholder="Enter user ID"
                        required
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount (USD)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-400 dark:text-gray-500">$</span>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        required
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white pl-7 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (optional)</label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g., Investment payment"
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  {message && (
                    <div className={`text-sm p-3 rounded-lg ${
                      message.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                    }`}>
                      {message.text}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {submitting ? 'Processing...' : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Funds`}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Transaction History</h2>
            </div>

            {transactions.length === 0 ? (
              <div className="p-8 text-center">
                <DollarSign size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No transactions yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Make a deposit to get started</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {transactions.map((tx) => (
                  <div key={tx._id} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        {typeIcon(tx.type)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {tx.type === 'deposit' ? 'Deposit' : tx.type === 'withdraw' ? 'Withdrawal' : `Transfer${tx.toUser ? ` to ${tx.toUser.name}` : ''}`}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{tx.description || tx.reference}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${tx.type === 'deposit' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toFixed(2)}
                      </p>
                      {statusBadge(tx.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
