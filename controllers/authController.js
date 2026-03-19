const { validationResult } = require('express-validator');
const { Usuario, Figurinha, figurinhasPadrao } = require('../models');
const { gerarToken } = require('../middleware/auth');
const { Op } = require('sequelize');

// Registro de usuário
const registrar = async (req, res) => {
  try {
    // Validar entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { name, username, email, password } = req.body;

    // Verificar se username já existe
    const usernameExistente = await Usuario.findOne({ 
      where: { username: username.toLowerCase() } 
    });
    if (usernameExistente) {
      return res.status(400).json({
        message: 'Nome de usuário já está em uso'
      });
    }

    // Verificar se email já existe
    const emailExistente = await Usuario.findOne({ 
      where: { email: email.toLowerCase() } 
    });
    if (emailExistente) {
      return res.status(400).json({
        message: 'Email já está cadastrado'
      });
    }

    // Criar novo usuário
    const usuario = await Usuario.create({
      display_name: name,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password_hash: password

    });

    // Adicionar figurinhas padrão
    const figurinhasIniciais = figurinhasPadrao.slice(0, 3); // Primeiras 3 figurinhas
    for (const codigo of figurinhasIniciais) {
      await Figurinha.create({
        usuario_id: usuario.id,
        codigo
      });
    }

    // Buscar usuário com figurinhas
    const usuarioCompleto = await Usuario.findByPk(usuario.id, {
      include: [{ model: Figurinha, as: 'figurinhas' }]
    });

    // Gerar token
    const token = gerarToken(usuario.id);

    // Retornar dados do usuário
    res.status(201).json({
      message: 'Usuário criado com sucesso!',
      token,
      usuario: {
        id: usuario.id,
        username: usuario.username,
        displayName: usuario.display_name,
        email: usuario.email,
        bio: usuario.bio,
        avatarUrl: usuario.avatar_url,
        figurinhas: usuarioCompleto.figurinhas.map(f => f.codigo),
        createdAt: usuario.created_at
      }
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({
      message: 'Erro ao criar usuário. Tente novamente.'
    });
  }
};

// Login de usuário
const login = async (req, res) => {
  try {
    console.log(req.body);
    // Validar entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Buscar usuário pelo email
    const usuario = await Usuario.findOne({ 
      where: { email: email.toLowerCase() }
    });

    if (!usuario) {
      return res.status(401).json({
        message: 'Email ou senha incorretos'
      });
    }

    // Verificar se conta está ativa
    if (!usuario.is_active) {
      return res.status(401).json({
        message: 'Conta desativada. Entre em contato com o suporte.'
      });
    }

    // Verificar senha
    const senhaCorreta = await usuario.compararSenha(password);

    if (!senhaCorreta) {
      return res.status(401).json({
        message: 'Email ou senha incorretos'
      });
    }

    // Buscar figurinhas do usuário
    const figurinhas = await Figurinha.findAll({
      where: { usuario_id: usuario.id }
    });

    // Buscar contagens
    const { Historia, Seguidor } = require('../models');
    const historiasCount = await Historia.count({ where: { author_id: usuario.id } });
    const seguidoresCount = await Seguidor.count({ where: { seguindo_id: usuario.id } });
    const seguindoCount = await Seguidor.count({ where: { seguidor_id: usuario.id } });

    // Gerar token
    const token = gerarToken(usuario.id);
    console.log(token);
    // Retornar dados do usuário
    res.json({
      message: 'Login realizado com sucesso!',
      token,
      usuario: {
        id: usuario.id,
        username: usuario.username,
        displayName: usuario.display_name,
        email: usuario.email,
        bio: usuario.bio,
        avatarUrl: usuario.avatar_url,
        figurinhas: figurinhas.map(f => f.codigo),
        historiasCount,
        seguidoresCount,
        seguindoCount,
        createdAt: usuario.created_at
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      message: 'Erro ao fazer login. Tente novamente.'
    });
  }
};

// Obter perfil do usuário logado
const meuPerfil = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.usuarioId, {
      include: [{ model: Figurinha, as: 'figurinhas' }],
      attributes: { exclude: ['password_hash'] }
    });

    if (!usuario) {
      return res.status(404).json({
        message: 'Usuário não encontrado'
      });
    }

    // Buscar contagens
    const { Historia, Seguidor } = require('../models');
    const historiasCount = await Historia.count({ where: { author_id: usuario.id } });
    const seguidoresCount = await Seguidor.count({ where: { seguindo_id: usuario.id } });
    const seguindoCount = await Seguidor.count({ where: { seguidor_id: usuario.id } });

    res.json({
      usuario: {
        id: usuario.id,
        username: usuario.username,
        displayName: usuario.display_name,
        email: usuario.email,
        bio: usuario.bio,
        avatarUrl: usuario.avatar_url,
        figurinhas: usuario.figurinhas.map(f => f.codigo),
        historiasCount,
        seguidoresCount,
        seguindoCount,
        createdAt: usuario.created_at
      }
    });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({
      message: 'Erro ao buscar perfil'
    });
  }
};

// Atualizar perfil
const atualizarPerfil = async (req, res) => {
  try {
    const { displayName, bio, avatarUrl } = req.body;
    
    const updates = {};
    if (displayName !== undefined) updates.display_name = displayName;
    if (bio !== undefined) updates.bio = bio;
    if (avatarUrl !== undefined) updates.avatar_url = avatarUrl;

    await Usuario.update(updates, { where: { id: req.usuarioId } });

    const usuario = await Usuario.findByPk(req.usuarioId, {
      attributes: { exclude: ['password_hash'] }
    });

    res.json({
      message: 'Perfil atualizado com sucesso!',
      usuario: {
        id: usuario.id,
        username: usuario.username,
        displayName: usuario.display_name,
        email: usuario.email,
        bio: usuario.bio,
        avatarUrl: usuario.avatar_url
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({
      message: 'Erro ao atualizar perfil'
    });
  }
};

// Alterar senha
const alterarSenha = async (req, res) => {
  try {
    const { senhaAtual, novaSenha } = req.body;

    const usuario = await Usuario.findByPk(req.usuarioId);

    // Verificar senha atual
    const senhaCorreta = await usuario.compararSenha(senhaAtual);
    if (!senhaCorreta) {
      return res.status(400).json({
        message: 'Senha atual incorreta'
      });
    }

    // Atualizar senha
    usuario.password_hash = novaSenha;
    await usuario.save();

    res.json({
      message: 'Senha alterada com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({
      message: 'Erro ao alterar senha'
    });
  }
};

// Verificar token
const verificarToken = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.usuarioId, {
      attributes: { exclude: ['password_hash'] }
    });

    if (!usuario) {
      return res.status(404).json({
        message: 'Usuário não encontrado'
      });
    }

    res.json({
      valido: true,
      usuario: {
        id: usuario.id,
        username: usuario.username,
        displayName: usuario.display_name,
        email: usuario.email,
        avatarUrl: usuario.avatar_url
      }
    });
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    res.status(500).json({
      message: 'Erro ao verificar token'
    });
  }
};

module.exports = {
  registrar,
  login,
  meuPerfil,
  atualizarPerfil,
  alterarSenha,
  verificarToken
};
