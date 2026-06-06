const mongoose = require('mongoose');
const { CONSTRUCTION_DOMAINS } = require('../utils/domains');

const pendingTaskSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  builder: { type: mongoose.Schema.Types.ObjectId, ref: 'Builder', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  domain: { type: String, enum: CONSTRUCTION_DOMAINS },
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed', 'Blocked'], default: 'Pending' },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  dueDate: Date,
  completedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('PendingTask', pendingTaskSchema);
