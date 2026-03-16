const express = require('express');
const router = express.Router();
const produtoController = require('../controllers/produtoController');
const { authMiddleware, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { criarSchema, atualizarSchema } = require('../validators/produtoValidator');

router.use(authMiddleware);

router.get('/', produtoController.listar);
router.get('/:id', produtoController.buscarPorId);
router.post('/', requireRole('gerente'), validate(criarSchema), produtoController.criar);
router.put('/:id', requireRole('gerente'), validate(atualizarSchema), produtoController.atualizar);
router.delete('/:id', requireRole('gerente'), produtoController.deletar);

module.exports = router;
