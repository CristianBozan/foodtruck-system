const express = require('express');
const router = express.Router();
const vendaController = require('../controllers/vendaController');
const { authMiddleware, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { criarSchema } = require('../validators/vendaValidator');

router.use(authMiddleware);

router.get('/', vendaController.listar);
router.get('/:id', vendaController.buscarPorId);
router.post('/', validate(criarSchema), vendaController.criar);
router.delete('/:id', requireRole('gerente'), vendaController.deletar);

module.exports = router;
