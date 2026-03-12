const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth');

// POST /api/auth/login
router.post('/login', authController.login);

// POST /api/auth/register
router.post('/register', authController.register);

// GET /api/auth/me (perfil do usuário logado)
router.get('/me', authenticate, authController.getProfile);

module.exports = router;
