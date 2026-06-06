const { body } = require('express-validator');
const Builder = require('../models/Builder');
const Customer = require('../models/Customer');
const Project = require('../models/Project');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { ok, created } = require('../utils/apiResponse');
const { signToken } = require('../utils/token');

const builderPayload = (builder) => ({
  id: builder._id,
  role: 'builder',
  name: builder.name,
  username: builder.username,
  companyName: builder.companyName
});

exports.registerBuilderValidation = [
  body('name').trim().notEmpty(),
  body('username').trim().isLength({ min: 3 }),
  body('password').isLength({ min: 6 }),
  body('email').optional({ checkFalsy: true }).isEmail()
];

exports.loginBuilderValidation = [
  body('username').trim().notEmpty(),
  body('password').isLength({ min: 6 })
];

exports.customerLoginValidation = [
  body('projectCode').matches(/^\d{10}$/).withMessage('Valid 10-digit project code is required')
];

exports.registerBuilder = asyncHandler(async (req, res) => {
  const exists = await Builder.findOne({ username: req.body.username.toLowerCase() });
  if (exists) throw new AppError('Username already exists', 409);
  const builder = new Builder({
    name: req.body.name,
    username: req.body.username,
    email: req.body.email,
    phone: req.body.phone,
    companyName: req.body.companyName
  });
  builder.password = req.body.password;
  await builder.save();
  const payload = builderPayload(builder);
  created(res, { token: signToken(payload), user: payload }, 'Builder registered');
});

exports.loginBuilder = asyncHandler(async (req, res) => {
  const builder = await Builder.findOne({ username: req.body.username.toLowerCase() }).select('+passwordHash');
  if (!builder) throw new AppError('Invalid builder credentials', 401);
  const valid = await builder.comparePassword(req.body.password);
  if (!valid) throw new AppError('Invalid builder credentials', 401);
  const payload = builderPayload(builder);
  ok(res, { token: signToken(payload), user: payload }, 'Builder login successful');
});

exports.loginCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findOne({ projectCode: req.body.projectCode });
  if (!customer) throw new AppError('Project code not found', 404);
  const project = await Project.findOne({ code: req.body.projectCode, customer: customer._id });
  const payload = { id: customer._id, role: 'customer', projectCode: customer.projectCode, name: customer.name };
  ok(res, { token: signToken(payload), user: payload, project }, 'Customer login successful');
});

exports.me = asyncHandler(async (req, res) => {
  ok(res, { role: req.userRole, user: req.user }, 'Profile loaded');
});
