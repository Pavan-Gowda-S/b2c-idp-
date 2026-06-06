const mongoose = require('mongoose');
const { CONSTRUCTION_DOMAINS } = require('../utils/domains');

const approvalRequestSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  builder: { type: mongoose.Schema.Types.ObjectId, ref: 'Builder', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  title: { type: String, required: true, trim: true },
  domain: { type: String, enum: CONSTRUCTION_DOMAINS },
  description: { type: String, required: true, trim: true },
  type: { type: String, enum: ['Design', 'Quotation', 'Drawing', 'Material'], default: 'Design' },
  files: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FileAsset' }],
  status: { type: String, enum: ['Pending', 'Approved', 'Changes Requested'], default: 'Pending' },
  customerComment: { type: String, trim: true },
  decidedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('ApprovalRequest', approvalRequestSchema);
