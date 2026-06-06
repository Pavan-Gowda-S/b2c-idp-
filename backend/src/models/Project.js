const mongoose = require('mongoose');
const { CONSTRUCTION_DOMAINS } = require('../utils/domains');

const domainStatusSchema = new mongoose.Schema({
  name: { type: String, enum: CONSTRUCTION_DOMAINS, required: true },
  status: { type: String, enum: ['Planned', 'In Progress', 'Completed', 'Delayed'], default: 'Planned' },
  completionPercentage: { type: Number, min: 0, max: 100, default: 0 },
  startDate: Date,
  targetDate: Date,
  completedDate: Date
}, { _id: false });

const projectSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, match: /^\d{10}$/ },
  title: { type: String, default: 'Construction Project', trim: true },
  description: { type: String, trim: true },
  builder: { type: mongoose.Schema.Types.ObjectId, ref: 'Builder', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  address: { type: String, trim: true },
  status: { type: String, enum: ['Planning', 'Active', 'On Hold', 'Completed', 'Cancelled'], default: 'Active' },
  startDate: Date,
  targetCompletionDate: Date,
  completionPercentage: { type: Number, min: 0, max: 100, default: 0 },
  domains: { type: [domainStatusSchema], default: () => CONSTRUCTION_DOMAINS.map((name) => ({ name })) },
  budget: { type: Number, default: 0 },
  spentAmount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
