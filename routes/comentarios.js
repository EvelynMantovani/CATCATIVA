const express = require('express');
const router = express.Router();
const comentarioController = require('../controllers/comentarioController');
const { verificarToken } = require('../middleware/auth');

// Rotas públicas
router.get('/historia/:historiaId', comentarioController.listarPorHistoria);
router.get('/capitulo/:capituloId', comentarioController.listarPorCapitulo);

// Rotas protegidas
router.post('/', verificarToken, comentarioController.criar);
router.post('/:id/curtir', verificarToken, comentarioController.curtir);
router.delete('/:id', verificarToken, comentarioController.excluir);

module.exports = router;
