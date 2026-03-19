const express = require('express');
const router = express.Router();
const historiaController = require('../controllers/historiaController');
const { verificarToken, verificarTokenOpcional } = require('../middleware/auth');

// Rotas públicas (com token opcional)
router.get('/', verificarTokenOpcional, historiaController.listar);
router.get('/populares', verificarTokenOpcional, historiaController.populares);
router.get('/usuario/:usuarioId', verificarTokenOpcional, historiaController.historiasPorUsuario);
router.get('/:id', verificarTokenOpcional, historiaController.obter);

// Rotas protegidas
router.post('/', verificarToken, historiaController.criar);
router.put('/:id', verificarToken, historiaController.atualizar);
router.delete('/:id', verificarToken, historiaController.excluir);
router.get('/usuario/me/minhas', verificarToken, historiaController.minhasHistorias);

module.exports = router;
