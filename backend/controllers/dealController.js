const Deal = require('../models/Deal');

// GET /api/deals
exports.getDeals = async (req, res) => {
  try {
    const deals = await Deal.find({ investor: req.user.id }).populate('entrepreneur', 'name email');
    res.json(deals);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/deals
exports.createDeal = async (req, res) => {
  try {
    const { entrepreneurId, startupName, industry, amount, equity, status, stage } = req.body;
    
    const deal = new Deal({
      investor: req.user.id,
      entrepreneur: entrepreneurId,
      startupName,
      industry,
      amount,
      equity,
      status,
      stage
    });
    
    await deal.save();
    res.status(201).json(deal);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /api/deals/:id
exports.updateDeal = async (req, res) => {
  try {
    const deal = await Deal.findOneAndUpdate(
      { _id: req.params.id, investor: req.user.id },
      { $set: req.body },
      { new: true }
    );
    
    if (!deal) return res.status(404).json({ message: 'Deal not found' });
    res.json(deal);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE /api/deals/:id
exports.deleteDeal = async (req, res) => {
  try {
    const deal = await Deal.findOneAndDelete({ _id: req.params.id, investor: req.user.id });
    if (!deal) return res.status(404).json({ message: 'Deal not found' });
    res.json({ message: 'Deal removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
