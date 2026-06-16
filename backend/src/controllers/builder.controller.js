const store = require('../services/supabase.service');
const collections = require('../supabase/tables');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/apiResponse');

exports.listCustomers = asyncHandler(async (req, res) => {
  const builderId = req.user._id;
  const projects = await store.list(collections.projects, [['builder_id', '==', builderId]]);
  if (!projects.length) return ok(res, { clients: [] }, 'No builder customers found');

  const projectIds = projects.map((project) => project._id);
  const relations = await store.list(collections.userProjects, [['project_id', 'in', projectIds]]);
  const customerIds = [...new Set(relations.map((relation) => relation.user_id))];
  const customers = await Promise.all(customerIds.map((id) => store.getById(collections.users, id)));

  const clients = relations.map((relation) => {
    const project = projects.find((p) => p._id === relation.projectId);
    const customer = customers.find((u) => u && u._id === relation.user_id);
    return {
      projectId: project ? project._id : null,
      projectName: project ? project.name || project.title || 'Unnamed Project' : 'Unknown Project',
      customerName: customer ? customer.name || 'Customer' : 'Unknown',
      customerPhone: customer ? customer.phone_number || customer.phone || '' : ''
    };
  });

  ok(res, { clients }, 'Builder clients loaded');
});
