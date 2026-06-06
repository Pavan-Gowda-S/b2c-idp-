const { body, param } = require('express-validator');
const Customer = require('../models/Customer');
const Project = require('../models/Project');
const ActivityLog = require('../models/ActivityLog');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { ok, created } = require('../utils/apiResponse');
const projectService = require('../services/project.service');
const { logActivity } = require('../services/activity.service');

exports.codeParam = [param('code').matches(/^\d{10}$/)];
exports.createValidation = [
  body('code').matches(/^\d{10}$/),
  body('title').optional({ checkFalsy: true }).trim(),
  body('customerName').optional({ checkFalsy: true }).trim(),
  body('customerPhone').optional({ checkFalsy: true }).trim(),
  body('customerEmail').optional({ checkFalsy: true }).isEmail()
];

exports.createProject = asyncHandler(async (req, res) => {
  const exists = await Project.findOne({ code: req.body.code });
  if (exists) throw new AppError('Project code already exists', 409);
  const customer = await Customer.create({
    name: req.body.customerName,
    phone: req.body.customerPhone,
    email: req.body.customerEmail,
    projectCode: req.body.code
  });
  const project = await Project.create({
    code: req.body.code,
    title: req.body.title || 'Construction Project',
    description: req.body.description,
    builder: req.user._id,
    customer: customer._id,
    address: req.body.address,
    startDate: req.body.startDate,
    targetCompletionDate: req.body.targetCompletionDate
  });
  await logActivity({ project: project._id, actor: req.user._id, actorModel: 'Builder', type: 'Project', message: 'Project created' });
  created(res, { project, customer }, 'Project created');
});

exports.listBuilderProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({ builder: req.user._id }).populate('customer').sort({ updatedAt: -1 });
  ok(res, { projects }, 'Projects loaded');
});

exports.getProjectByCode = asyncHandler(async (req, res) => {
  const project = await projectService.getProjectByCode(req.params.code);
  if (!project || !projectService.assertProjectAccess(project, req)) throw new AppError('Project not found', 404);
  ok(res, { project }, 'Project loaded');
});

exports.dashboard = asyncHandler(async (req, res) => {
  const project = await projectService.getProjectByCode(req.params.code);
  if (!project || !projectService.assertProjectAccess(project, req)) throw new AppError('Project not found', 404);
  const summary = await projectService.getDashboardSummary(project._id);
  ok(res, summary, 'Dashboard summary loaded');
});

exports.activity = asyncHandler(async (req, res) => {
  const project = await projectService.getProjectByCode(req.params.code);
  if (!project || !projectService.assertProjectAccess(project, req)) throw new AppError('Project not found', 404);
  const logs = await ActivityLog.find({ project: project._id }).sort({ createdAt: -1 }).limit(100);
  ok(res, { logs }, 'Activity loaded');
});
