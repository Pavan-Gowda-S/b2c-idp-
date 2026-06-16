const router = require('express').Router();
const controller = require('../controllers/project.controller');
const validate = require('../middlewares/validate.middleware');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

router.use(authenticate);
router.post('/', authorize('BUILDER'), controller.createValidation, validate, controller.createProject);
router.get('/', authorize('BUILDER'), controller.listBuilderProjects);
router.get('/customer', authorize('CUSTOMER'), controller.listCustomerProjects);
router.get('/:code', controller.codeParam, validate, controller.getProjectByCode);
router.get('/:code/dashboard', controller.codeParam, validate, controller.dashboard);
router.get('/:code/activity', controller.codeParam, validate, controller.activity);

module.exports = router;

