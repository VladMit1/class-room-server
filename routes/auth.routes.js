const Router = require('express');
const { body } = require('express-validator');
const router = new Router();
const authMiddleware = require('../middleware/auth.middleware');
const userController = require('../controllers/userController');
router.post(
   '/registration',
   [
      body('email', 'Uncorrect email').isEmail(),
      body(
         'password',
         'Password must be longer than 3 and shorter than 12'
      ).isLength({ min: 4, max: 12 })
   ],
   userController.registration
);

router.post('/login', userController.login);
router.get('/auth', authMiddleware, userController.authorization);
//router.get('/users', authMiddleware, userController.getStudents);

module.exports = router;
