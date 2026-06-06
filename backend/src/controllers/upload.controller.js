const { body, param } = require('express-validator');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { ok, created } = require('../utils/apiResponse');
const projectService = require('../services/project.service');
const fileService = require('../services/file.service');
const { logActivity } = require('../services/activity.service');

exports.codeParam = [param('code').matches(/^\d{10}$/)];

async function saveGenericFiles(req, res, category, message) {
  const project = await projectService.getProjectByCode(req.params.code);
  if (!project || !projectService.assertProjectAccess(project, req)) throw new AppError('Project not found', 404);
  const assets = await fileService.createAssets({
    files: req.files,
    req,
    project: project._id,
    uploadedBy: req.user._id,
    uploadedByModel: 'Builder',
    category,
    domain: req.body.domain,
    description: req.body.description
  });
  await logActivity({ project: project._id, actor: req.user._id, actorModel: 'Builder', type: message, message: `${message} uploaded (${assets.length} file${assets.length === 1 ? '' : 's'})` });
  created(res, { files: assets }, `${message} uploaded`);
}

exports.uploadPlannedImages = asyncHandler((req, res) => saveGenericFiles(req, res, 'planned-image', 'Planned Images'));
exports.uploadBills = asyncHandler((req, res) => saveGenericFiles(req, res, 'bill', 'Bill'));
exports.uploadDocuments = asyncHandler((req, res) => saveGenericFiles(req, res, 'document', 'Document'));

exports.listByCategory = asyncHandler(async (req, res) => {
  const FileAsset = require('../models/FileAsset');
  const project = await projectService.getProjectByCode(req.params.code);
  if (!project || !projectService.assertProjectAccess(project, req)) throw new AppError('Project not found', 404);
  const files = await FileAsset.find({ project: project._id, category: req.params.category }).sort({ createdAt: -1 });
  ok(res, { files }, 'Files loaded');
});
