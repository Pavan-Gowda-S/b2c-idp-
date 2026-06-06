const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/apiResponse');

exports.list = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id, recipientModel: req.userRole === 'builder' ? 'Builder' : 'Customer' }).sort({ createdAt: -1 });
  ok(res, { notifications }, 'Notifications loaded');
});

exports.markRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { readAt: new Date() },
    { new: true }
  );
  ok(res, { notification }, 'Notification marked read');
});
