const { body } = require('express-validator');

const signupRules = [
  body('username').isString().bail().trim()
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username must be 3-30 letters, numbers or underscores'),
  body('email').isString().bail().trim()
    .isLength({ max: 254 }).isEmail()
    .withMessage('A valid email is required')
    .customSanitizer((value) => value.toLowerCase()),
  body('password').isString().bail()
    .isLength({ min: 8, max: 72 })
    .matches(/[a-z]/).matches(/[A-Z]/).matches(/[0-9]/)
    .custom((value) => Buffer.byteLength(value, 'utf8') <= 72)
    .withMessage('Password needs 8-72 bytes, uppercase, lowercase and a number')
];

const loginRules = [
  body('username').optional().isString().bail().trim()
    .isLength({ min: 3, max: 30 }),
  body('email').optional().isString().bail().trim()
    .isLength({ max: 254 }).isEmail()
    .customSanitizer((value) => value.toLowerCase()),
  body('password').isString().bail().isLength({ min: 1, max: 72 }),
  body().custom((value) => {
    return Boolean(value.username) !== Boolean(value.email);
  }).withMessage('Provide either username or email with your password')
];

module.exports = { signupRules, loginRules };
