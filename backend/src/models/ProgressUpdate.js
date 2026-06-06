const mongoose = require('mongoose');
const { CONSTRUCTION_DOMAINS } = require('../utils/domains');

const progressUpdateSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  builder: { type: mongoose.Schema.Types.ObjectId, ref: 'Builder', required: true },
  domain: { type: String, enum: CONSTRUCTION_DOMAINS, required: true },
  date: { type: Date, required: true },
  description: { type: String, required: true, trim: true },
  dprStatus: { type: String, enum: ['Planned', 'Doing', 'Completed'], default: 'Doing' },
  workers: { type: Number, min: 0, default: 0 },
  images: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FileAsset' }]
}, { timestamps: true });

module.exports = mongoose.model('ProgressUpdate', progressUpdateSchema);
