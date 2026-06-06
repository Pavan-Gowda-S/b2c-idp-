const mongoose = require('mongoose');

const fileAssetSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, refPath: 'uploadedByModel', required: true },
  uploadedByModel: { type: String, enum: ['Builder', 'Customer'], required: true },
  category: {
    type: String,
    enum: ['daily-image', 'planned-image', 'bill', 'approval', 'document', 'building-plan'],
    required: true
  },
  domain: { type: String, trim: true },
  originalName: { type: String, required: true },
  filename: { type: String, required: true },
  path: { type: String, required: true },
  url: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  description: { type: String, trim: true }
}, { timestamps: true });

module.exports = mongoose.model('FileAsset', fileAssetSchema);
