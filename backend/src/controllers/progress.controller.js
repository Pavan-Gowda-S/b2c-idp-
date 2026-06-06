const { body, param } = require('express-validator');
const ProgressUpdate = require('../models/ProgressUpdate');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { ok, created } = require('../utils/apiResponse');
const projectService = require('../services/project.service');
const fileService = require('../services/file.service');
const { logActivity } = require('../services/activity.service');
const { CONSTRUCTION_DOMAINS } = require('../utils/domains');

exports.validation = [
  param('code').matches(/^\d{10}$/),
  body('domain').isIn(CONSTRUCTION_DOMAINS),
  body('date').isISO8601(),
  body('description').trim().notEmpty(),
  body('dprStatus').optional().isIn(['Planned', 'Doing', 'Completed']),
  body('workers').optional().isInt({ min: 0 })
];

exports.create = asyncHandler(async (req, res) => {
  const project = await projectService.getProjectByCode(req.params.code);
  if (!project || !projectService.assertProjectAccess(project, req)) throw new AppError('Project not found', 404);
  const assets = await fileService.createAssets({
    files: req.files,
    req,
    project: project._id,
    uploadedBy: req.user._id,
    uploadedByModel: 'Builder',
    category: 'daily-image',
    domain: req.body.domain,
    description: req.body.description
  });
  const update = await ProgressUpdate.create({
    project: project._id,
    builder: req.user._id,
    domain: req.body.domain,
    date: req.body.date,
    description: req.body.description,
    dprStatus: req.body.dprStatus || 'Doing',
    workers: req.body.workers || 0,
    images: assets.map((asset) => asset._id)
  });
  await projectService.recalculateProjectCompletion(project._id);
  await logActivity({ project: project._id, actor: req.user._id, actorModel: 'Builder', type: 'Daily Update', message: `[${req.body.domain}] ${req.body.description}` });
  created(res, { update: await update.populate('images') }, 'Progress update created');
});

exports.list = asyncHandler(async (req, res) => {
  const project = await projectService.getProjectByCode(req.params.code);
  if (!project || !projectService.assertProjectAccess(project, req)) throw new AppError('Project not found', 404);
  const updates = await ProgressUpdate.find({ project: project._id }).populate('images').sort({ date: -1, createdAt: -1 });
  ok(res, { updates }, 'Progress updates loaded');
});
