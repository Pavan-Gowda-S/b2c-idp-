const { body, param } = require('express-validator');
const Feedback = require('../models/Feedback');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { ok, created } = require('../utils/apiResponse');
const projectService = require('../services/project.service');
const { logActivity } = require('../services/activity.service');

exports.validation = [
  param('code').matches(/^\d{10}$/),
  body('message').trim().notEmpty(),
  body('workDate').optional({ checkFalsy: true }).isISO8601()
];

exports.create = asyncHandler(async (req, res) => {
  const project = await projectService.getProjectByCode(req.params.code);
  if (!project || !projectService.assertProjectAccess(project, req)) throw new AppError('Project not found', 404);
  const feedback = await Feedback.create({
    project: project._id,
    customer: req.user._id,
    workDate: req.body.workDate,
    message: req.body.message
  });
  await logActivity({ project: project._id, actor: req.user._id, actorModel: 'Customer', type: 'Feedback', message: req.body.message });
  created(res, { feedback }, 'Feedback sent');
});

exports.list = asyncHandler(async (req, res) => {
  const project = await projectService.getProjectByCode(req.params.code);
  if (!project || !projectService.assertProjectAccess(project, req)) throw new AppError('Project not found', 404);
  const feedback = await Feedback.find({ project: project._id }).sort({ createdAt: -1 });
  ok(res, { feedback }, 'Feedback loaded');
});
