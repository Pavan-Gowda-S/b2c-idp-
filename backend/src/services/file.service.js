const FileAsset = require('../models/FileAsset');

exports.createAssets = async ({ files, req, project, uploadedBy, uploadedByModel, category, domain, description }) => {
  return Promise.all((files || []).map((file) => FileAsset.create({
    project,
    uploadedBy,
    uploadedByModel,
    category,
    domain,
    originalName: file.originalname,
    filename: file.filename,
    path: file.path,
    url: `${req.protocol}://${req.get('host')}/uploads/${file.filename}`,
    mimeType: file.mimetype,
    size: file.size,
    description
  })));
};
