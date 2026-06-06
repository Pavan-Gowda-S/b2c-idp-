const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  workDate: Date,
  message: { type: String, required: true, trim: true },
  status: { type: String, enum: ['New', 'Reviewed', 'Resolved'], default: 'New' }
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
