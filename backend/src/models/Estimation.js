const mongoose = require('mongoose');
const { CONSTRUCTION_DOMAINS } = require('../utils/domains');

const estimationSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  builder: { type: mongoose.Schema.Types.ObjectId, ref: 'Builder', required: true },
  domain: { type: String, enum: CONSTRUCTION_DOMAINS, required: true },
  amount: { type: Number, min: 0, required: true },
  notes: { type: String, trim: true },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Estimation', estimationSchema);
