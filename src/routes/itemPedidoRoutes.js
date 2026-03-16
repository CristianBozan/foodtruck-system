const express = require('express');
const router = express.Router();
const itemPedidoController = require('../controllers/itempedidoController');
const { authMiddleware } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { criarSchema, atualizarSchema } = require('../validators/itemPedidoValidator');

router.use(authMiddleware);

router.get('/', itemPedidoController.listar);
router.get('/:id', itemPedidoController.buscarPorId);
router.post('/', validate(criarSchema), itemPedidoController.criar);
router.put('/:id', validate(atualizarSchema), itemPedidoController.atualizar);
router.delete('/:id', itemPedidoController.deletar);

module.exports = router;
