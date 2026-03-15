const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String },
  content: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
  relatedOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  attachments: [{ filename: String, url: String }]
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
