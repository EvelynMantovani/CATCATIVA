const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

// Middleware para verificar token JWT
const verificarToken = async (req, res, next) => {
  try {
    // Pegar token do header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'Acesso negado. Token não fornecido.' 
      });
    }
    
    const token = authHeader.substring(7);
    
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'catcativa_secret_key_2024');
    
    // Buscar usuário
    const usuario = await Usuario.findByPk(decoded.id, {
      attributes: { exclude: ['password_hash'] }
    });
    
    if (!usuario) {
      return res.status(401).json({ 
        message: 'Usuário não encontrado.' 
      });
    }
    
    if (!usuario.is_active) {
      return res.status(401).json({ 
        message: 'Conta desativada.' 
      });
    }
    
    // Adicionar usuário à requisição
    req.usuario = usuario;
    req.usuarioId = usuario.id;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Token inválido.' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expirado.' 
      });
    }
    
    console.error('Erro na autenticação:', error);
    return res.status(500).json({ 
      message: 'Erro na autenticação.' 
    });
  }
};

// Middleware opcional - não bloqueia se não tiver token
const verificarTokenOpcional = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.usuario = null;
      req.usuarioId = null;
      return next();
    }
    
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'catcativa_secret_key_2024');
    
    const usuario = await Usuario.findByPk(decoded.id, {
      attributes: { exclude: ['password_hash'] }
    });
    
    if (usuario && usuario.is_active) {
      req.usuario = usuario;
      req.usuarioId = usuario.id;
    } else {
      req.usuario = null;
      req.usuarioId = null;
    }
    
    next();
  } catch (error) {
    req.usuario = null;
    req.usuarioId = null;
    next();
  }
};

// Middleware para verificar se é admin
const verificarAdmin = (req, res, next) => {
  if (!req.usuario || !req.usuario.is_admin) {
    return res.status(403).json({ 
      message: 'Acesso negado. Permissão de administrador necessária.' 
    });
  }
  next();
};

// Gerar token JWT
const gerarToken = (usuarioId) => {
  return jwt.sign(
    { id: usuarioId },
    process.env.JWT_SECRET || 'catcativa_secret_key_2024',
    { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
  );
};

module.exports = {
  verificarToken,
  verificarTokenOpcional,
  verificarAdmin,
  gerarToken
};
