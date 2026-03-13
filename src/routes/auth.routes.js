const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth');

router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/me', authenticate, authController.getProfile);

module.exports = router;
