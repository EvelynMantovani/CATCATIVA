const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { verificarToken } = require('../middleware/auth');

// Rotas públicas
router.get('/buscar', usuarioController.buscar);
router.get('/:id', usuarioController.obter);
router.get('/:id/seguidores', usuarioController.seguidores);
router.get('/:id/seguindo', usuarioController.seguindo);

// Rotas protegidas
router.post('/:id/seguir', verificarToken, usuarioController.seguir);
router.get('/:id/verificar-seguimento', verificarToken, usuarioController.verificarSeguimento);

module.exports = router;
