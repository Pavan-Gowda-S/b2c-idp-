const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  actor: { type: mongoose.Schema.Types.ObjectId, refPath: 'actorModel' },
  actorModel: { type: String, enum: ['Builder', 'Customer'] },
  type: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  date: { type: Date, default: Date.now },
  metadata: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
