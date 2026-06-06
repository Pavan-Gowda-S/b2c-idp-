const { body, param } = require('express-validator');
const ApprovalRequest = require('../models/ApprovalRequest');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { ok, created } = require('../utils/apiResponse');
const projectService = require('../services/project.service');
const fileService = require('../services/file.service');
const { logActivity } = require('../services/activity.service');

exports.createValidation = [
  param('code').matches(/^\d{10}$/),
  body('title').trim().notEmpty(),
  body('description').trim().notEmpty(),
  body('type').optional().isIn(['Design', 'Quotation', 'Drawing', 'Material'])
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
    category: 'approval',
    domain: req.body.domain,
    description: req.body.description
  });
  const approval = await ApprovalRequest.create({
    project: project._id,
    builder: req.user._id,
    customer: project.customer._id || project.customer,
    title: req.body.title,
    domain: req.body.domain,
    description: req.body.description,
    type: req.body.type || 'Design',
    files: assets.map((asset) => asset._id)
  });
  await logActivity({ project: project._id, actor: req.user._id, actorModel: 'Builder', type: 'Approval', message: `Approval request: ${req.body.title}` });
  created(res, { approval: await approval.populate('files') }, 'Approval request created');
});

exports.list = asyncHandler(async (req, res) => {
  const project = await projectService.getProjectByCode(req.params.code);
  if (!project || !projectService.assertProjectAccess(project, req)) throw new AppError('Project not found', 404);
  const approvals = await ApprovalRequest.find({ project: project._id }).populate('files').sort({ createdAt: -1 });
  ok(res, { approvals }, 'Approval requests loaded');
});

exports.decide = asyncHandler(async (req, res) => {
  const approval = await ApprovalRequest.findById(req.params.id).populate('project');
  if (!approval) throw new AppError('Approval request not found', 404);
  if (req.userRole !== 'customer' || String(approval.customer) !== String(req.user._id)) throw new AppError('Insufficient permissions', 403);
  approval.status = req.body.status;
  approval.customerComment = req.body.comment;
  approval.decidedAt = new Date();
  await approval.save();
  await logActivity({ project: approval.project._id, actor: req.user._id, actorModel: 'Customer', type: 'Approval', message: `${req.body.status}: ${approval.title}` });
  ok(res, { approval }, 'Approval updated');
});
