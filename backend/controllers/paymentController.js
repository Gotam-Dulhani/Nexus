const Transaction = require('../models/Transaction');
const User = require('../models/User');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key_only_for_startup');

// Helper: gets user's current balance from all completed transactions
const getBalance = async (userId) => {
  const transactions = await Transaction.find({
    status: 'completed',
    $or: [{ user: userId }, { toUser: userId }]
  });

  return transactions.reduce((bal, tx) => {
    if (tx.toUser && tx.toUser.toString() === userId.toString() && tx.type === 'transfer') {
      return bal + tx.amount; // received transfer
    } else if (tx.user.toString() === userId.toString()) {
      if (tx.type === 'deposit') return bal + tx.amount;
      if (tx.type === 'withdraw' || tx.type === 'transfer') return bal - tx.amount;
    }
    return bal;
  }, 0);
};

// GET /api/payments/balance
exports.getBalance = async (req, res) => {
  try {
    const balance = await getBalance(req.user.id);
    res.json({ balance: Math.max(0, balance).toFixed(2) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/payments/deposit
// Creates a Stripe Payment Intent.
// The frontend will confirm the payment intent using Stripe Elements, then notify the backend (or use webhooks).
// For the sake of this mock integration, we will also create a pending transaction that the frontend or a mock webhook can finalize.
exports.deposit = async (req, res) => {
  try {
    const { amount, description } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Amount must be positive' });

    // 1. Create a Stripe PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(parseFloat(amount) * 100), // Stripe expects cents
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
    });

    // 2. Create local pending transaction
    const tx = await Transaction.create({
      user: req.user.id,
      type: 'deposit',
      amount: parseFloat(amount),
      status: 'pending',
      description: description || 'Stripe Deposit',
      // Store the paymentIntent id to verify later if needed
      metadata: { paymentIntentId: paymentIntent.id }
    });

    res.status(201).json({ 
      ...tx.toObject(), 
      clientSecret: paymentIntent.client_secret,
      message: 'Deposit initiated. Awaiting confirmation.' 
    });
  } catch (error) {
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('Stripe Secret Key is missing from .env');
    }
    res.status(500).json({ message: 'Stripe error', error: error.message });
  }
};

// POST /api/payments/deposit/confirm
// Mock webhook/callback to finalize the transaction after Stripe confirmation
exports.confirmDeposit = async (req, res) => {
  try {
    const { transactionId, paymentIntentId } = req.body;
    
    // In a real app, you'd use a Stripe webhook and verify the signature. 
    // Here we're just accepting the frontend's confirmation for the sandbox.
    if (process.env.STRIPE_SECRET_KEY) {
       const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
       if (intent.status !== 'succeeded') {
         tx.status = 'failed';
         await tx.save();
         return res.status(400).json({ message: `Payment not successful: ${intent.status}` });
       }
    }

    const tx = await Transaction.findOne({ _id: transactionId, user: req.user.id });
    if (!tx) return res.status(404).json({ message: 'Transaction not found' });
    if (tx.status === 'completed') return res.status(400).json({ message: 'Already completed' });

    tx.status = 'completed';
    await tx.save();

    res.json({ message: 'Deposit successful', transaction: tx });
  } catch (error) {
     res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/payments/withdraw
exports.withdraw = async (req, res) => {
  try {
    const { amount, description } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Amount must be positive' });

    const balance = await getBalance(req.user.id);
    if (balance < parseFloat(amount)) {
      return res.status(400).json({ message: `Insufficient balance. Available: $${balance.toFixed(2)}` });
    }

    const tx = await Transaction.create({
      user: req.user.id,
      type: 'withdraw',
      amount: parseFloat(amount),
      status: 'pending',
      description: description || 'Withdrawal'
    });

    setTimeout(async () => {
      tx.status = 'completed';
      await tx.save();
    }, 1500);

    res.status(201).json({ ...tx.toObject(), message: 'Withdrawal initiated.' });
  } catch (error) {
    if (error._id) {
      await Transaction.findByIdAndUpdate(error._id, { status: 'failed' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/payments/transfer
exports.transfer = async (req, res) => {
  try {
    const { toUserId, amount, description } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Amount must be positive' });
    if (toUserId === req.user.id) return res.status(400).json({ message: 'Cannot transfer to yourself' });

    const recipient = await User.findById(toUserId);
    if (!recipient) return res.status(404).json({ message: 'Recipient not found' });

    const balance = await getBalance(req.user.id);
    if (balance < parseFloat(amount)) {
      return res.status(400).json({ message: `Insufficient balance. Available: $${balance.toFixed(2)}` });
    }

    const tx = await Transaction.create({
      user: req.user.id,
      type: 'transfer',
      amount: parseFloat(amount),
      toUser: toUserId,
      status: 'pending',
      description: description || `Transfer to ${recipient.name}`
    });

    setTimeout(async () => {
      tx.status = 'completed';
      await tx.save();
    }, 1500);

    res.status(201).json({ ...tx.toObject(), message: `Transfer to ${recipient.name} initiated.` });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/payments/history
exports.getHistory = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      $or: [{ user: req.user.id }, { toUser: req.user.id }]
    })
      .populate('user', 'name email')
      .populate('toUser', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
