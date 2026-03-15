const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.category) filter.category = req.query.category;
    const items = await Inventory.find(filter).sort('itemName');
    const itemsWithStatus = items.map(item => ({
      ...item.toObject(),
      isLowStock: item.quantity <= item.minStockLevel
    }));
    res.json(itemsWithStatus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const item = await Inventory.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:id/transaction', protect, adminOnly, async (req, res) => {
  try {
    const { type, quantity, reference } = req.body;
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (type === 'OUT' && item.quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }
    item.quantity = type === 'IN' ? item.quantity + quantity : item.quantity - quantity;
    item.transactions.push({ type, quantity, reference, performedBy: req.user._id });
    await item.save();
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Inventory.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Item deactivated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/stats/summary', protect, adminOnly, async (req, res) => {
  try {
    const items = await Inventory.find({ isActive: true });
    const totalItems = items.length;
    const lowStockItems = items.filter(i => i.quantity <= i.minStockLevel).length;
    const totalValue = items.reduce((sum, i) => sum + (i.quantity * i.costPerUnit), 0);
    const categories = [...new Set(items.map(i => i.category))];
    res.json({ totalItems, lowStockItems, totalValue, categories: categories.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
