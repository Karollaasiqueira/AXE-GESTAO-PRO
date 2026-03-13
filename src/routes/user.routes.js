const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middlewares/auth');

router.use(authenticate);

router.get('/', authorize('ADMIN'), userController.listar);
router.get('/:id', userController.buscarPorId);
router.put('/:id', userController.atualizar);
router.patch('/:id/status', authorize('ADMIN'), userController.alterarStatus);

module.exports = router;
