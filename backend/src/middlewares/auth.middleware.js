const jwt = require('jsonwebtoken');
const env = require('../config/env');
const AppError = require('../utils/AppError');
const store = require('../services/supabase.service');
const collections = require('../supabase/tables');

exports.authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw new AppError('Authentication token required', 401);
    const decoded = jwt.verify(token, env.jwtSecret);
    const user = await store.getById(collections.users, decoded.id);
    if (!user) throw new AppError('Authenticated user no longer exists', 401);
    req.user = user;
    req.userRole = String(user.role || decoded.role || '').toUpperCase();
    next();
  } catch (error) {
    next(error.statusCode ? error : new AppError('Invalid or expired token', 401));
  }
};

exports.authorize = (...roles) => (req, res, next) => {
  const userRole = String(req.userRole || '').toUpperCase();
  if (!roles.map((r) => String(r).toUpperCase()).includes(userRole)) {
    return next(new AppError('Insufficient permissions', 403));
  }
  next();
};

