const express = require('express');
const router = express.Router();
const agendamentoController = require('../controllers/agendamento.controller');
const { authenticate, authorize } = require('../middlewares/auth');

router.use(authenticate);

router.get('/', agendamentoController.listar);
router.get('/fila', agendamentoController.filaDodia);
router.get('/:id', agendamentoController.buscarPorId);
router.post('/', agendamentoController.criar);
router.put('/:id', agendamentoController.atualizar);
router.patch('/:id/confirmar', agendamentoController.confirmar);
router.patch('/:id/cancelar', agendamentoController.cancelar);
router.delete('/:id', authorize('ADMIN'), agendamentoController.deletar);

module.exports = router;
