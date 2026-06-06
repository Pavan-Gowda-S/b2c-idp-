const mongoose = require('mongoose');

const aiReportSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  sourceFile: { type: mongoose.Schema.Types.ObjectId, ref: 'FileAsset' },
  type: {
    type: String,
    enum: ['image-analysis', 'progress-estimation', 'timeline-prediction', 'material-prediction', 'chatbot'],
    required: true
  },
  status: { type: String, enum: ['queued', 'completed', 'failed'], default: 'queued' },
  summary: { type: String, trim: true },
  result: { type: mongoose.Schema.Types.Mixed },
  error: { type: String, trim: true }
}, { timestamps: true });

module.exports = mongoose.model('AIReport', aiReportSchema);
