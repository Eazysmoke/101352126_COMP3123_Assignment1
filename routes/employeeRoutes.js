const router = require('express').Router();
const auth = require('../middleware/auth');
const controller = require('../controllers/employeeController');
const { validate, allowFields } = require('../middleware/validate');
const {
  employeeFields, employeeRules, employeeIdRule, deleteIdRule
} = require('../validators/employee');

router.use(auth);

router.get('/employees', controller.listEmployees);

router.post('/employees',
  allowFields(employeeFields),
  employeeRules, validate,
  controller.createEmployee
);

router.get('/employees/:eid',
  employeeIdRule, validate,
  controller.getEmployee
);

router.put('/employees/:eid',
  employeeIdRule,
  allowFields(employeeFields),
  employeeRules, validate,
  controller.updateEmployee
);

router.delete('/employees',
  deleteIdRule, validate,
  controller.deleteEmployee
);

module.exports = router;
