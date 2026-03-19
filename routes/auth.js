const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');
const { verificarToken } = require('../middleware/auth');

// Validações
const validacoesRegistro = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage('Nome deve ter entre 2 e 80 caracteres'),
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username deve ter entre 3 e 50 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username deve conter apenas letras, números e underscores'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter no mínimo 6 caracteres')
];

const validacoesLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('password')
    .notEmpty()
    .withMessage('Senha é obrigatória')
];

// Rotas públicas
router.post('/registrar', validacoesRegistro, authController.registrar);
router.post('/login', validacoesLogin, authController.login);

// Rotas protegidas
router.get('/me', verificarToken, authController.meuPerfil);
router.put('/me', verificarToken, authController.atualizarPerfil);
router.put('/senha', verificarToken, authController.alterarSenha);
router.get('/verificar', verificarToken, authController.verificarToken);

module.exports = router;
