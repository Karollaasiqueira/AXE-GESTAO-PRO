const express = require('express');
const router = express.Router();
const pagamentoController = require('../controllers/pagamento.controller');
const { authenticate, authorize } = require('../middlewares/auth');

router.use(authenticate);

router.get('/', pagamentoController.listar);
router.get('/relatorio', authorize('ADMIN'), pagamentoController.relatorio);
router.get('/:id', pagamentoController.buscarPorId);
router.post('/', authorize('ADMIN'), pagamentoController.criar);
router.patch('/:id/pagar', pagamentoController.registrarPagamento);
router.patch('/:id/cancelar', authorize('ADMIN'), pagamentoController.cancelar);

module.exports = router;
