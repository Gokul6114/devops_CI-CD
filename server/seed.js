const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/textile_db';

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  const collections = ['users', 'orders', 'inventories', 'productions', 'invoices', 'messages'];
  for (const col of collections) {
    try { await mongoose.connection.db.dropCollection(col); } catch (e) {}
  }

  const User = require('./models/User');
  const Order = require('./models/Order');
  const Inventory = require('./models/Inventory');
  const Production = require('./models/Production');
  const Invoice = require('./models/Invoice');

  // Create admin
  const admin = await User.create({
    name: 'Admin Manager',
    email: 'admin@textile.com',
    password: 'admin123',
    role: 'admin',
    phone: '+91 9876543210',
    company: 'SAI PATHIRAKALIAMMAN TEXTILE PROCESS'
  });

  // Create clients
  const clients = await User.insertMany([
    { name: 'Ravi Kumar', email: 'client@textile.com', password: await bcrypt.hash('client123', 12), role: 'client', phone: '+91 9876543211', company: 'Kumar Fabrics Ltd', address: 'Chennai, Tamil Nadu' },
    { name: 'Priya Sharma', email: 'priya@fabrics.com', password: await bcrypt.hash('client123', 12), role: 'client', phone: '+91 9876543212', company: 'Sharma Textiles', address: 'Coimbatore, Tamil Nadu' },
    { name: 'Mohammed Ali', email: 'ali@clothing.com', password: await bcrypt.hash('client123', 12), role: 'client', phone: '+91 9876543213', company: 'Ali Clothing Co.', address: 'Tiruppur, Tamil Nadu' },
  ]);

  // Create inventory
  await Inventory.insertMany([
    { itemName: 'Cotton Fabric (White)', category: 'Raw Material', quantity: 500, unit: 'meters', minStockLevel: 100, costPerUnit: 45, supplier: 'Mumbai Mills', location: 'Warehouse A' },
    { itemName: 'Red Dye (Reactive)', category: 'Dye', quantity: 25, unit: 'kg', minStockLevel: 10, costPerUnit: 350, supplier: 'Kiri Dyes', location: 'Chemical Storage' },
    { itemName: 'Blue Dye (Vat)', category: 'Dye', quantity: 8, unit: 'kg', minStockLevel: 10, costPerUnit: 420, supplier: 'Kiri Dyes', location: 'Chemical Storage' },
    { itemName: 'Fixing Agent', category: 'Chemical', quantity: 50, unit: 'liters', minStockLevel: 20, costPerUnit: 180, supplier: 'Chem Corp', location: 'Chemical Storage' },
    { itemName: 'Polyester Fabric', category: 'Raw Material', quantity: 300, unit: 'meters', minStockLevel: 50, costPerUnit: 60, supplier: 'Surat Mills', location: 'Warehouse B' },
    { itemName: 'Packaging Rolls', category: 'Packaging', quantity: 200, unit: 'rolls', minStockLevel: 50, costPerUnit: 25, supplier: 'Pack Pro', location: 'Packaging Area' },
  ]);

  // Create orders
  const orders = await Order.insertMany([
    {
      orderNumber: 'ORD-20240001',
      client: clients[0]._id,
      items: [{ productName: 'Cotton Dyeing', quantity: 100, unit: 'meters', unitPrice: 85, totalPrice: 8500 }],
      status: 'Delivered',
      processType: 'Dyeing',
      fabricType: 'Cotton',
      color: 'Navy Blue',
      deliveryDate: new Date('2024-01-15'),
      totalAmount: 8500,
      priority: 'High',
    },
    {
      orderNumber: 'ORD-20240002',
      client: clients[1]._id,
      items: [{ productName: 'Polyester Printing', quantity: 200, unit: 'meters', unitPrice: 120, totalPrice: 24000 }],
      status: 'Completed',
      processType: 'Printing',
      fabricType: 'Polyester',
      deliveryDate: new Date('2024-02-20'),
      totalAmount: 24000,
    },
    {
      orderNumber: 'ORD-20240003',
      client: clients[2]._id,
      items: [{ productName: 'Fabric Washing', quantity: 300, unit: 'meters', unitPrice: 35, totalPrice: 10500 }],
      status: 'Processing',
      processType: 'Washing',
      deliveryDate: new Date('2024-03-10'),
      totalAmount: 10500,
    },
    {
      orderNumber: 'ORD-20240004',
      client: clients[0]._id,
      items: [{ productName: 'Silk Dyeing Premium', quantity: 50, unit: 'meters', unitPrice: 250, totalPrice: 12500 }],
      status: 'Pending',
      processType: 'Dyeing',
      fabricType: 'Silk',
      color: 'Crimson Red',
      deliveryDate: new Date('2024-04-01'),
      totalAmount: 12500,
      priority: 'High',
    },
  ]);

  // Create production batches
  await Production.insertMany([
    { batchNumber: 'BATCH-001', order: orders[2]._id, processType: 'Washing', status: 'In Progress', quantity: 300, unit: 'meters', startDate: new Date(), progress: 45, assignedTo: 'Ram Kumar', machine: 'Wash-M01' },
    { batchNumber: 'BATCH-002', order: orders[3]._id, processType: 'Dyeing', status: 'Scheduled', quantity: 50, unit: 'meters', estimatedCompletionDate: new Date('2024-03-25'), assignedTo: 'Suresh P', machine: 'Dye-M02' },
    { batchNumber: 'BATCH-003', processType: 'Finishing', status: 'Completed', quantity: 200, unit: 'meters', progress: 100, assignedTo: 'Vijay S', machine: 'Fin-M01' },
  ]);

  // Create invoices
  await Invoice.insertMany([
    {
      invoiceNumber: 'INV-20240001',
      order: orders[0]._id,
      client: clients[0]._id,
      items: [{ description: 'Cotton Dyeing', quantity: 100, unitPrice: 85, total: 8500 }],
      subtotal: 8500,
      taxRate: 18,
      taxAmount: 1530,
      totalAmount: 10030,
      status: 'Paid',
      dueDate: new Date('2024-01-30'),
      paidAt: new Date('2024-01-25'),
    },
    {
      invoiceNumber: 'INV-20240002',
      order: orders[1]._id,
      client: clients[1]._id,
      items: [{ description: 'Polyester Printing', quantity: 200, unitPrice: 120, total: 24000 }],
      subtotal: 24000,
      taxRate: 18,
      taxAmount: 4320,
      totalAmount: 28320,
      status: 'Sent',
      dueDate: new Date('2024-03-05'),
    },
  ]);

  console.log('✅ Seed data created successfully!');
  console.log('\n👤 Login Credentials:');
  console.log('   Admin: admin@textile.com / admin123');
  console.log('   Client: client@textile.com / client123');

  await mongoose.disconnect();
}

seed().catch(err => { console.error('Seed error:', err); process.exit(1); });
