const express = require('express');
const router = express.Router();
const mesaController = require('../controllers/mesaController');
const { authMiddleware, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { criarSchema, atualizarSchema } = require('../validators/mesaValidator');

router.use(authMiddleware);

router.get('/', mesaController.listar);
router.get('/:id', mesaController.buscarPorId);
router.post('/', requireRole('gerente'), validate(criarSchema), mesaController.criar);
router.put('/:id', validate(atualizarSchema), mesaController.atualizar);
router.delete('/:id', requireRole('gerente'), mesaController.deletar);

module.exports = router;
