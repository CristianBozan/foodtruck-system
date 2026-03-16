const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');
const { authMiddleware, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { criarSchema, atualizarSchema } = require('../validators/pedidoValidator');

router.use(authMiddleware);

router.get('/', pedidoController.listar);
router.get('/:id', pedidoController.buscarPorId);
router.post('/', validate(criarSchema), pedidoController.criar);
router.put('/:id', validate(atualizarSchema), pedidoController.atualizar);
router.delete('/:id', requireRole('gerente'), pedidoController.deletar);

module.exports = router;
