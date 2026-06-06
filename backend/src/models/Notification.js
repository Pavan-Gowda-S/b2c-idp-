const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  recipient: { type: mongoose.Schema.Types.ObjectId, refPath: 'recipientModel', required: true },
  recipientModel: { type: String, enum: ['Builder', 'Customer'], required: true },
  title: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  type: { type: String, enum: ['info', 'success', 'warning', 'delay', 'approval', 'feedback'], default: 'info' },
  readAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
