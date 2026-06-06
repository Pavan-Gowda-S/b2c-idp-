const { body, param } = require('express-validator');
const PendingTask = require('../models/PendingTask');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { ok, created } = require('../utils/apiResponse');
const projectService = require('../services/project.service');

exports.validation = [
  param('code').matches(/^\d{10}$/),
  body('title').trim().notEmpty(),
  body('status').optional().isIn(['Pending', 'In Progress', 'Completed', 'Blocked'])
];

exports.create = asyncHandler(async (req, res) => {
  const project = await projectService.getProjectByCode(req.params.code);
  if (!project || !projectService.assertProjectAccess(project, req)) throw new AppError('Project not found', 404);
  const task = await PendingTask.create({ ...req.body, project: project._id, builder: req.user._id });
  created(res, { task }, 'Task created');
});

exports.list = asyncHandler(async (req, res) => {
  const project = await projectService.getProjectByCode(req.params.code);
  if (!project || !projectService.assertProjectAccess(project, req)) throw new AppError('Project not found', 404);
  const tasks = await PendingTask.find({ project: project._id }).sort({ dueDate: 1, createdAt: -1 });
  ok(res, { tasks }, 'Tasks loaded');
});

exports.update = asyncHandler(async (req, res) => {
  const task = await PendingTask.findByIdAndUpdate(req.params.id, req.body, { new: true });
  ok(res, { task }, 'Task updated');
});
