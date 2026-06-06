const Project = require('../models/Project');
const ProgressUpdate = require('../models/ProgressUpdate');
const Estimation = require('../models/Estimation');
const PendingTask = require('../models/PendingTask');
const { CONSTRUCTION_DOMAINS } = require('../utils/domains');

exports.getProjectByCode = async (code) => Project.findOne({ code }).populate('builder customer');

exports.assertProjectAccess = (project, req) => {
  if (!project) return false;
  if (req.userRole === 'builder') return String(project.builder._id || project.builder) === String(req.user._id);
  return String(project.customer._id || project.customer) === String(req.user._id);
};

exports.recalculateProjectCompletion = async (projectId) => {
  const updates = await ProgressUpdate.find({ project: projectId });
  const completedDomains = new Set(updates.map((item) => item.domain));
  const completionPercentage = Math.round((completedDomains.size / CONSTRUCTION_DOMAINS.length) * 100);
  const domains = CONSTRUCTION_DOMAINS.map((name) => {
    const domainUpdates = updates.filter((item) => item.domain === name);
    const hasCompleted = domainUpdates.some((item) => item.dprStatus === 'Completed');
    const status = hasCompleted ? 'Completed' : domainUpdates.length ? 'In Progress' : 'Planned';
    return {
      name,
      status,
      completionPercentage: hasCompleted ? 100 : domainUpdates.length ? Math.min(90, 20 + domainUpdates.length * 15) : 0
    };
  });
  await Project.findByIdAndUpdate(projectId, { completionPercentage, domains });
  return completionPercentage;
};

exports.getDashboardSummary = async (projectId) => {
  const [project, updates, estimations, tasks] = await Promise.all([
    Project.findById(projectId).lean(),
    ProgressUpdate.find({ project: projectId }).lean(),
    Estimation.find({ project: projectId }).lean(),
    PendingTask.find({ project: projectId }).lean()
  ]);
  const totalCost = estimations.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const activeDomains = [...new Set(updates.map((item) => item.domain))];
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return {
    project,
    completionPercentage: project?.completionPercentage || 0,
    totalUpdates: updates.length,
    totalCost,
    activeDomain: activeDomains[activeDomains.length - 1] || null,
    pendingTasks: tasks.filter((task) => task.status !== 'Completed').length,
    weeklyUpdates: updates.filter((item) => new Date(item.date).getTime() >= weekAgo).length,
    domains: project?.domains || []
  };
};
