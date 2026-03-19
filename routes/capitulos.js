const express = require('express');
const router = express.Router();
const capituloController = require('../controllers/capituloController');
const { verificarToken, verificarTokenOpcional } = require('../middleware/auth');

// Rotas públicas
router.get('/historia/:historiaId', capituloController.listar);
router.get('/historia/:historiaId/numero/:chapterNumber', verificarTokenOpcional, capituloController.obter);

// Rotas protegidas
router.post('/', verificarToken, capituloController.criar);
router.put('/:id', verificarToken, capituloController.atualizar);
router.delete('/:id', verificarToken, capituloController.excluir);

module.exports = router;
