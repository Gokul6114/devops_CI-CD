const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, default: 'meters' },
  unitPrice: { type: Number, required: true },
  totalPrice: { type: Number }
});

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Completed', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  deliveryDate: { type: Date, required: true },
  totalAmount: { type: Number, default: 0 },
  specialInstructions: { type: String },
  fabricType: { type: String },
  color: { type: String },
  processType: {
    type: String,
    enum: ['Dyeing', 'Printing', 'Washing', 'Finishing', 'Embroidery', 'Other']
  },
  notes: [{ text: String, addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, addedAt: { type: Date, default: Date.now } }],
  statusHistory: [{ status: String, changedAt: { type: Date, default: Date.now }, changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } }]
}, { timestamps: true });

orderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    this.orderNumber = 'ORD-' + Date.now().toString().slice(-8);
  }
  this.totalAmount = this.items.reduce((sum, item) => {
    item.totalPrice = item.quantity * item.unitPrice;
    return sum + item.totalPrice;
  }, 0);
  next();
});

module.exports = mongoose.model('Order', orderSchema);
