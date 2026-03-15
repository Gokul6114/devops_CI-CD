const mongoose = require('mongoose');

const productionSchema = new mongoose.Schema({
  batchNumber: { type: String, unique: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  processType: {
    type: String,
    enum: ['Dyeing', 'Printing', 'Washing', 'Finishing', 'Embroidery', 'Other'],
    required: true
  },
  status: {
    type: String,
    enum: ['Scheduled', 'In Progress', 'Completed', 'On Hold', 'Cancelled'],
    default: 'Scheduled'
  },
  quantity: { type: Number, required: true },
  unit: { type: String, default: 'meters' },
  startDate: { type: Date },
  endDate: { type: Date },
  estimatedCompletionDate: { type: Date },
  assignedTo: { type: String },
  machine: { type: String },
  notes: { type: String },
  qualityCheck: {
    passed: { type: Boolean },
    checkedBy: String,
    checkedAt: Date,
    remarks: String
  },
  progress: { type: Number, default: 0, min: 0, max: 100 }
}, { timestamps: true });

productionSchema.pre('save', function(next) {
  if (!this.batchNumber) {
    this.batchNumber = 'BATCH-' + Date.now().toString().slice(-8);
  }
  next();
});

module.exports = mongoose.model('Production', productionSchema);
