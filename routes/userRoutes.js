const router = require('express').Router();
const { signup, login } = require('../controllers/userController');
const { signupRules, loginRules } = require('../validators/user');
const { validate, allowFields } = require('../middleware/validate');

router.post('/signup',
  allowFields(['username', 'email', 'password']),
  signupRules, validate, signup
);

router.post('/login',
  allowFields(['username', 'email', 'password']),
  loginRules, validate, login
);

module.exports = router;
