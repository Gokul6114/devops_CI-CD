const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Inventory = require('../models/Inventory');
const Production = require('../models/Production');
const Invoice = require('../models/Invoice');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/dashboard', protect, adminOnly, async (req, res) => {
  try {
    const [orderStats, inventoryStats, productionStats, recentOrders, topClients] = await Promise.all([
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } }
      ]),
      Inventory.find({ isActive: true }),
      Production.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Order.find().populate('client', 'name company').sort('-createdAt').limit(5),
      Order.aggregate([
        { $group: { _id: '$client', totalOrders: { $sum: 1 }, totalRevenue: { $sum: '$totalAmount' } } },
        { $sort: { totalRevenue: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'clientInfo' } }
      ])
    ]);

    const totalRevenue = await Invoice.aggregate([
      { $match: { status: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    res.json({
      orderStats,
      inventoryStats: {
        total: inventoryStats.length,
        lowStock: inventoryStats.filter(i => i.quantity <= i.minStockLevel).length,
        totalValue: inventoryStats.reduce((s, i) => s + i.quantity * i.costPerUnit, 0)
      },
      productionStats,
      recentOrders,
      topClients,
      totalRevenue: totalRevenue[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/sales', protect, adminOnly, async (req, res) => {
  try {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      months.push({ year: date.getFullYear(), month: date.getMonth() + 1 });
    }
    const salesData = await Promise.all(months.map(async ({ year, month }) => {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0);
      const result = await Order.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } } },
        { $group: { _id: null, revenue: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
      ]);
      return {
        month: start.toLocaleString('default', { month: 'short' }),
        year,
        revenue: result[0]?.revenue || 0,
        orders: result[0]?.count || 0
      };
    }));
    res.json(salesData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/clients', protect, adminOnly, async (req, res) => {
  try {
    const clients = await User.find({ role: 'client' }).select('name email company phone createdAt');
    const clientStats = await Promise.all(clients.map(async (client) => {
      const orders = await Order.find({ client: client._id });
      return {
        ...client.toObject(),
        totalOrders: orders.length,
        totalSpent: orders.reduce((s, o) => s + o.totalAmount, 0),
        lastOrder: orders.sort((a, b) => b.createdAt - a.createdAt)[0]?.createdAt
      };
    }));
    res.json(clientStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
