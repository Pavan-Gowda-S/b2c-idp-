const jwt = require('jsonwebtoken');
const env = require('../config/env');
const AppError = require('../utils/AppError');
const Builder = require('../models/Builder');
const Customer = require('../models/Customer');

exports.authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw new AppError('Authentication token required', 401);
    const decoded = jwt.verify(token, env.jwtSecret);
    const Model = decoded.role === 'builder' ? Builder : Customer;
    const user = await Model.findById(decoded.id).select(decoded.role === 'builder' ? '+passwordHash' : '');
    if (!user) throw new AppError('Authenticated user no longer exists', 401);
    req.user = user;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    next(error.statusCode ? error : new AppError('Invalid or expired token', 401));
  }
};

exports.authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.userRole)) return next(new AppError('Insufficient permissions', 403));
  next();
};
