const router = require('express').Router();
const controller = require('../controllers/complaints.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

router.use(authenticate);
router.post('/', authorize('CUSTOMER'), controller.createComplaintValidation, controller.createComplaint);
router.get('/project/:projectId', authorize('BUILDER', 'CUSTOMER'), controller.listProjectComplaints);
router.put('/:id/resolve', authorize('BUILDER'), controller.resolveComplaint);
router.put('/:id/close', authorize('CUSTOMER'), controller.closeComplaint);

module.exports = router;
