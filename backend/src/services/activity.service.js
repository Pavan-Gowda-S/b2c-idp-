const ActivityLog = require('../models/ActivityLog');

exports.logActivity = async ({ project, actor, actorModel, type, message, metadata }) => {
  return ActivityLog.create({ project, actor, actorModel, type, message, metadata });
};
