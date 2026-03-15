const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  category: {
    type: String,
    enum: ['Raw Material', 'Dye', 'Chemical', 'Finished Goods', 'Packaging', 'Other'],
    required: true
  },
  sku: { type: String, unique: true },
  quantity: { type: Number, required: true, default: 0 },
  unit: { type: String, default: 'kg' },
  minStockLevel: { type: Number, default: 10 },
  costPerUnit: { type: Number, default: 0 },
  supplier: { type: String },
  location: { type: String },
  description: { type: String },
  isActive: { type: Boolean, default: true },
  transactions: [{
    type: { type: String, enum: ['IN', 'OUT'], required: true },
    quantity: Number,
    date: { type: Date, default: Date.now },
    reference: String,
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }]
}, { timestamps: true });

inventorySchema.virtual('isLowStock').get(function() {
  return this.quantity <= this.minStockLevel;
});

inventorySchema.pre('save', function(next) {
  if (!this.sku) {
    this.sku = 'SKU-' + Date.now().toString().slice(-8);
  }
  next();
});

module.exports = mongoose.model('Inventory', inventorySchema);
