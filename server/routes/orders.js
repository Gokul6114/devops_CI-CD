const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/orders
router.get('/', protect, async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'client') filter.client = req.user._id;
    if (req.query.status) filter.status = req.query.status;
    const orders = await Order.find(filter).populate('client', 'name email company').sort('-createdAt');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/orders/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('client', 'name email company phone').populate('notes.addedBy', 'name');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (req.user.role === 'client' && order.client._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/orders
router.post('/', protect, async (req, res) => {
  try {
    const orderData = { ...req.body, client: req.user.role === 'client' ? req.user._id : req.body.client };
    const order = await Order.create(orderData);
    await order.populate('client', 'name email company');
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/orders/:id
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (req.body.status && req.body.status !== order.status) {
      order.statusHistory.push({ status: req.body.status, changedBy: req.user._id });
    }
    Object.assign(order, req.body);
    await order.save();
    await order.populate('client', 'name email company');
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/orders/:id
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Order deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/orders/:id/notes
router.post('/:id/notes', protect, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { $push: { notes: { text: req.body.text, addedBy: req.user._id } } },
      { new: true }
    ).populate('notes.addedBy', 'name');
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/orders/stats/summary
router.get('/stats/summary', protect, adminOnly, async (req, res) => {
  try {
    const [total, pending, processing, completed, delivered] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: 'Pending' }),
      Order.countDocuments({ status: 'Processing' }),
      Order.countDocuments({ status: 'Completed' }),
      Order.countDocuments({ status: 'Delivered' })
    ]);
    const revenueResult = await Order.aggregate([
      { $match: { status: { $in: ['Completed', 'Delivered'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    res.json({ total, pending, processing, completed, delivered, revenue: revenueResult[0]?.total || 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
