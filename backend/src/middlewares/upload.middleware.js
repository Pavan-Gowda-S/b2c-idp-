const fs = require('fs');
const path = require('path');
const multer = require('multer');
const env = require('../config/env');
const AppError = require('../utils/AppError');

const uploadRoot = path.join(__dirname, '..', env.uploadDir);
fs.mkdirSync(uploadRoot, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadRoot),
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safe}`);
  }
});

const allowed = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf'
]);

const fileFilter = (req, file, cb) => {
  if (!allowed.has(file.mimetype)) return cb(new AppError('Only JPG, PNG, WEBP, and PDF files are allowed', 400));
  cb(null, true);
};

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: env.maxFileSizeMb * 1024 * 1024 }
});
