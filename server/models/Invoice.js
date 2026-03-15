const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, unique: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    description: String,
    quantity: Number,
    unitPrice: Number,
    total: Number
  }],
  subtotal: { type: Number, required: true },
  taxRate: { type: Number, default: 18 },
  taxAmount: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled'],
    default: 'Draft'
  },
  dueDate: { type: Date },
  paidAt: { type: Date },
  paymentMethod: { type: String },
  notes: { type: String }
}, { timestamps: true });

invoiceSchema.pre('save', function(next) {
  if (!this.invoiceNumber) {
    this.invoiceNumber = 'INV-' + Date.now().toString().slice(-8);
  }
  this.taxAmount = (this.subtotal * this.taxRate) / 100;
  this.totalAmount = this.subtotal + this.taxAmount - this.discount;
  next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);
