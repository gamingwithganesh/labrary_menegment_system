const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

router.post('/login', authController.login);
router.get('/me', authenticateToken, authController.me);
router.get('/users', authenticateToken, authController.listUsers);
router.delete('/users/:id', authenticateToken, authController.deleteUser);
router.get('/captcha', authController.captcha);
router.post('/register', authController.register);
router.post('/activate', authController.activate);

module.exports = router;
