const express = require('express');
const router = express.Router();
const curtidaController = require('../controllers/curtidaController');
const { verificarToken } = require('../middleware/auth');

// Rotas protegidas
router.post('/historia/:historiaId', verificarToken, curtidaController.toggle);
router.get('/historia/:historiaId/verificar', verificarToken, curtidaController.verificar);
router.get('/minhas', verificarToken, curtidaController.minhasCurtidas);
router.get('/historia/:historiaId/contar', curtidaController.contar);

module.exports = router;
