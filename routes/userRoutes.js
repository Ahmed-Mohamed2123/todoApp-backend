const express = require('express');

const router = express.Router();

const userController = require('../controller/userController');
const check = require('../middleware/checkRole&Auth');

router.post('/login', userController.login);
router.post('/signup', userController.singup);

router.get('/UserInfo', check.checkAuth, userController.AllUser);

router.put('/forgot-password', userController.forgotPassword);
router.put('/reset-password', userController.resetPassword);

module.exports = router;