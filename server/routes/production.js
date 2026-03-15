const express = require('express');
const router = express.Router();
const Production = require('../models/Production');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const batches = await Production.find(filter).populate('order', 'orderNumber').sort('-createdAt');
    res.json(batches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const batch = await Production.findById(req.params.id).populate('order');
    if (!batch) return res.status(404).json({ message: 'Batch not found' });
    res.json(batch);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const batch = await Production.create(req.body);
    res.status(201).json(batch);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const batch = await Production.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!batch) return res.status(404).json({ message: 'Batch not found' });
    res.json(batch);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Production.findByIdAndDelete(req.params.id);
    res.json({ message: 'Batch deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/stats/summary', protect, adminOnly, async (req, res) => {
  try {
    const [total, scheduled, inProgress, completed] = await Promise.all([
      Production.countDocuments(),
      Production.countDocuments({ status: 'Scheduled' }),
      Production.countDocuments({ status: 'In Progress' }),
      Production.countDocuments({ status: 'Completed' })
    ]);
    res.json({ total, scheduled, inProgress, completed });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
