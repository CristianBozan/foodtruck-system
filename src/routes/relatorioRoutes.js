const express = require('express');
const router = express.Router();
const relatorioController = require('../controllers/relatorioController');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/vendas-por-dia', relatorioController.vendasPorDia);
router.get('/vendas-por-pagamento', relatorioController.vendasPorPagamento);
router.get('/resumo', requireRole('gerente'), relatorioController.resumo);
router.get('/estoque-baixo', relatorioController.estoqueBaixo);

module.exports = router;
