const router = require('express').Router();
const controller = require('../controllers/builder.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

router.use(authenticate);
router.get('/customers', authorize('BUILDER'), controller.listCustomers);

module.exports = router;
