const { body, param, query } = require('express-validator');

const employeeFields = [
  'first_name', 'last_name', 'email', 'position',
  'salary', 'date_of_joining', 'department'
];

const employeeRules = [
  ...['first_name', 'last_name'].map((field) =>
    body(field).isString().bail().trim()
      .isLength({ min: 1, max: 50 })
      .withMessage(`${field} must contain 1-50 characters`)
  ),
  ...['position', 'department'].map((field) =>
    body(field).isString().bail().trim()
      .isLength({ min: 1, max: 100 })
      .withMessage(`${field} must contain 1-100 characters`)
  ),
  body('email').isString().bail().trim()
    .isLength({ max: 254 }).isEmail()
    .withMessage('A valid employee email is required')
    .customSanitizer((value) => value.toLowerCase()),
  body('salary').custom((value) =>
    typeof value === 'number' && Number.isFinite(value) && value > 0
  ).withMessage('Salary must be a positive JSON number'),
  body('date_of_joining').isString().bail()
    .matches(/^\d{4}-\d{2}-\d{2}$/).bail()
    .isISO8601({ strict: true })
    .withMessage('Use a valid date in YYYY-MM-DD format')
];

const employeeIdRule = param('eid').isMongoId()
  .withMessage('Invalid employee ID');

const deleteIdRule = query('eid').isString().bail().isMongoId()
  .withMessage('A valid eid query parameter is required');

module.exports = {
  employeeFields, employeeRules, employeeIdRule, deleteIdRule
};
