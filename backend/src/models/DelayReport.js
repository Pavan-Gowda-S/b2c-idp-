const mongoose = require('mongoose');
const { CONSTRUCTION_DOMAINS } = require('../utils/domains');

const delayReportSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  builder: { type: mongoose.Schema.Types.ObjectId, ref: 'Builder', required: true },
  domain: { type: String, enum: CONSTRUCTION_DOMAINS, required: true },
  date: { type: Date, required: true },
  reason: { type: String, required: true, trim: true },
  resolvedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('DelayReport', delayReportSchema);
