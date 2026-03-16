const express = require('express');
const router = express.Router();
const atendenteController = require('../controllers/atendenteController');
const { authMiddleware, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { criarSchema, atualizarSchema } = require('../validators/atendenteValidator');

router.use(authMiddleware);

router.get('/', atendenteController.listar);
router.get('/:id', atendenteController.buscarPorId);
router.post('/', requireRole('gerente'), validate(criarSchema), atendenteController.criar);
router.put('/:id', requireRole('gerente'), validate(atualizarSchema), atendenteController.atualizar);
router.delete('/:id', requireRole('gerente'), atendenteController.deletar);

module.exports = router;
