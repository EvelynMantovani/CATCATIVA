const express = require('express');
const router = express.Router();
const generoController = require('../controllers/generoController');
const { verificarToken, verificarAdmin } = require('../middleware/auth');

// Rotas públicas
router.get('/', generoController.listar);
router.get('/:id', generoController.obter);

// Rotas protegidas (apenas admin)
router.post('/', verificarToken, verificarAdmin, generoController.criar);
router.put('/:id', verificarToken, verificarAdmin, generoController.atualizar);
router.delete('/:id', verificarToken, verificarAdmin, generoController.excluir);

module.exports = router;
