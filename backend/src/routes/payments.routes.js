const router = require('express').Router();
const controller = require('../controllers/payments.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

router.use(authenticate);
router.get('/project/:projectId/ledger', authorize('BUILDER', 'CUSTOMER'), controller.getProjectLedger);
router.put('/invoice/:invoiceId/status', authorize('BUILDER'), controller.updateInvoiceStatus);

module.exports = router;
