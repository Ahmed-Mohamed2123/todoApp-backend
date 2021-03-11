const express = require('express');

const router = express.Router();

const userController = require('../controller/userController');
const check = require('../middleware/checkRole&Auth');

router.post('/login', userController.login);
router.post('/signup', userController.singup);

router.get('/UserInfo', check.checkAuth, userController.AllUser);

router.post('/forgot-password', userController.forgotPassword);
router.put('/reset-password/:token', userController.resetPassword);

module.exports = router;
