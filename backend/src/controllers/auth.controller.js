const { body } = require('express-validator');
const authService = require('../services/auth.service');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { ok, created } = require('../utils/apiResponse');
const { signToken } = require('../utils/token');

const builderPayload = (user) => ({
  id: user._id,
  role: 'BUILDER',
  name: user.name,
  email: user.email,
  phone_number: user.phone_number
});

const customerPayload = (user) => ({
  id: user._id,
  role: 'CUSTOMER',
  name: user.name,
  phone_number: user.phone_number
});

exports.registerBuilderValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone_number').matches(/^\d{10}$/).withMessage('Valid 10-digit phone number is required')
];

exports.loginBuilderValidation = [
  body('identifier').trim().notEmpty().withMessage('Email or phone is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

exports.googleBuilderValidation = [
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('google_id').trim().notEmpty().withMessage('Google ID is required')
];

exports.customerLoginValidation = [
  body('phone_number').matches(/^\d{10}$/).withMessage('Valid 10-digit phone number is required')
];

exports.customerVerifyValidation = [
  body('phone_number').matches(/^\d{10}$/).withMessage('Valid 10-digit phone number is required'),
  body('otp').matches(/^\d{6}$/).withMessage('Valid 6-digit OTP is required')
];

exports.registerBuilder = asyncHandler(async (req, res) => {
  const builder = await authService.createBuilder({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone_number,
    password: req.body.password
  });
  const payload = builderPayload(builder);
  created(res, { token: signToken(payload), user: payload }, 'Builder registered successfully');
});

exports.loginBuilder = asyncHandler(async (req, res) => {
  const user = await authService.authenticateBuilder(req.body.identifier, req.body.password);
  if (!user) throw new AppError('Invalid builder credentials', 401);
  const payload = builderPayload(user);
  ok(res, { token: signToken(payload), user: payload }, 'Builder login successful');
});

exports.loginBuilderGoogle = asyncHandler(async (req, res) => {
  const user = await authService.googleBuilderLogin({
    email: req.body.email,
    name: req.body.name,
    googleId: req.body.google_id
  });
  const payload = builderPayload(user);
  ok(res, { token: signToken(payload), user: payload }, 'Builder signed in with Google');
});

exports.sendCustomerOtp = asyncHandler(async (req, res) => {
  const result = await authService.requestCustomerOtp(req.body.phone_number);
  console.info(`Customer OTP for ${result.phone} is ${result.otp} (mocked)`);
  ok(res, { message: 'OTP sent to the registered mobile number' }, 'Customer OTP dispatched');
});

exports.verifyCustomerOtp = asyncHandler(async (req, res) => {
  const user = await authService.verifyCustomerOtp(req.body.phone_number, req.body.otp);
  const payload = customerPayload(user);
  ok(res, { token: signToken(payload), user: payload }, 'Customer verified');
});

exports.me = asyncHandler(async (req, res) => {
  const { passwordHash, password_hash, google_id, ...safeUser } = req.user;
  ok(res, { role: req.userRole, user: safeUser }, 'Profile loaded');
});

