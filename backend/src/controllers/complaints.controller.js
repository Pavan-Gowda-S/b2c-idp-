const { body, param } = require('express-validator');
const store = require('../services/supabase.service');
const collections = require('../supabase/tables');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { created, ok } = require('../utils/apiResponse');

exports.createComplaintValidation = [
  body('project_id').notEmpty(),
  body('category').isIn(['Structural', 'Plumbing', 'Electrical', 'Finishing']),
  body('description').trim().isLength({ min: 10 }),
  body('urgency').isIn(['Critical', 'Major', 'Minor']),
  body('media_urls').optional().isArray()
];

exports.createComplaint = asyncHandler(async (req, res) => {
  const project = await store.getById(collections.projects, req.body.project_id);
  if (!project) throw new AppError('Project not found', 404);
  const complaint = await store.create(collections.complaints, {
    projectId: req.body.project_id,
    category: req.body.category,
    description: req.body.description,
    urgency: req.body.urgency,
    status: 'Submitted',
    mediaUrls: req.body.media_urls || []
  });
  created(res, { complaint }, 'Complaint submitted');
});

exports.resolveComplaint = asyncHandler(async (req, res) => {
  const complaint = await store.getById(collections.complaints, req.params.id);
  if (!complaint) throw new AppError('Complaint not found', 404);
  const updated = await store.update(collections.complaints, complaint._id, { status: 'Resolved_Pending' });
  ok(res, { complaint: updated }, 'Complaint marked Resolved_Pending');
});

exports.closeComplaint = asyncHandler(async (req, res) => {
  const complaint = await store.getById(collections.complaints, req.params.id);
  if (!complaint) throw new AppError('Complaint not found', 404);
  const updated = await store.update(collections.complaints, complaint._id, { status: 'Closed' });
  ok(res, { complaint: updated }, 'Complaint closed');
});

exports.listProjectComplaints = asyncHandler(async (req, res) => {
  const projectId = req.params.projectId;
  const complaints = await store.list(collections.complaints, [['project_id', '==', projectId]]);
  ok(res, { complaints }, 'Project complaints loaded');
});
