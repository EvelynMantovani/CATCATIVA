const { Usuario, Historia, Seguidor, Figurinha } = require('../models');
const { Op } = require('sequelize');

// Obter perfil de um usuário
const obter = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findByPk(id, {
      attributes: { exclude: ['password_hash'] }
    });

    if (!usuario) {
      return res.status(404).json({
        message: 'Usuário não encontrado'
      });
    }

    // Contar histórias do usuário
    const historiasCount = await Historia.count({ 
      where: { 
        author_id: usuario.id,
        is_public: true 
      }
    });

    // Contar histórias completas
    const historiasCompletas = await Historia.count({ 
      where: { 
        author_id: usuario.id,
        is_public: true,
        status: 'COMPLETA'
      }
    });

    // Contar seguidores e seguindo
    const seguidoresCount = await Seguidor.count({ where: { seguindo_id: usuario.id } });
    const seguindoCount = await Seguidor.count({ where: { seguidor_id: usuario.id } });

    // Buscar estatísticas
    const estatisticas = await Historia.findAll({
      where: { author_id: usuario.id },
      attributes: [
        [require('../config/database').sequelize.fn('SUM', require('../config/database').sequelize.col('views')), 'totalViews'],
        [require('../config/database').sequelize.fn('SUM', require('../config/database').sequelize.col('likes_count')), 'totalLikes'],
        [require('../config/database').sequelize.fn('SUM', require('../config/database').sequelize.col('comments_count')), 'totalComments']
      ],
      raw: true
    });

    const stats = estatisticas[0] || { totalViews: 0, totalLikes: 0, totalComments: 0 };

    res.json({
      usuario: {
        id: usuario.id,
        username: usuario.username,
        displayName: usuario.display_name,
        bio: usuario.bio,
        avatarUrl: usuario.avatar_url,
        seguidoresCount,
        seguindoCount,
        historiasCount,
        historiasCompletas,
        estatisticas: {
          totalViews: parseInt(stats.totalViews) || 0,
          totalLikes: parseInt(stats.totalLikes) || 0,
          totalComments: parseInt(stats.totalComments) || 0
        },
        createdAt: usuario.created_at
      }
    });
  } catch (error) {
    console.error('Erro ao obter usuário:', error);
    res.status(500).json({
      message: 'Erro ao obter usuário'
    });
  }
};

// Seguir/deixar de seguir usuário
const seguir = async (req, res) => {
  try {
    const { id } = req.params;

    // Não permitir seguir a si mesmo
    if (parseInt(id) === req.usuarioId) {
      return res.status(400).json({
        message: 'Você não pode seguir a si mesmo'
      });
    }

    const usuarioASeguir = await Usuario.findByPk(id);
    if (!usuarioASeguir) {
      return res.status(404).json({
        message: 'Usuário não encontrado'
      });
    }

    // Verificar se já segue
    const jaSegue = await Seguidor.findOne({
      where: { 
        seguidor_id: req.usuarioId,
        seguindo_id: id
      }
    });

    if (jaSegue) {
      // Deixar de seguir
      await Seguidor.destroy({
        where: { 
          seguidor_id: req.usuarioId,
          seguindo_id: id
        }
      });
      
      res.json({
        message: `Você deixou de seguir ${usuarioASeguir.username}`,
        seguindo: false
      });
    } else {
      // Seguir
      await Seguidor.create({
        seguidor_id: req.usuarioId,
        seguindo_id: id
      });
      
      res.json({
        message: `Você está seguindo ${usuarioASeguir.username}`,
        seguindo: true
      });
    }
  } catch (error) {
    console.error('Erro ao seguir usuário:', error);
    res.status(500).json({
      message: 'Erro ao seguir usuário'
    });
  }
};

// Verificar se segue usuário
const verificarSeguimento = async (req, res) => {
  try {
    const { id } = req.params;

    const seguimento = await Seguidor.findOne({
      where: { 
        seguidor_id: req.usuarioId,
        seguindo_id: id
      }
    });

    res.json({
      seguindo: !!seguimento
    });
  } catch (error) {
    console.error('Erro ao verificar seguimento:', error);
    res.status(500).json({
      message: 'Erro ao verificar seguimento'
    });
  }
};

// Listar seguidores
const seguidores = async (req, res) => {
  try {
    const { id } = req.params;

    const seguidoresList = await Seguidor.findAll({
      where: { seguindo_id: id },
      include: [{
        model: Usuario,
        as: 'seguidor',
        attributes: ['id', 'username', 'display_name', 'avatar_url', 'bio']
      }]
    });

    res.json({
      seguidores: seguidoresList.map(s => s.seguidor)
    });
  } catch (error) {
    console.error('Erro ao buscar seguidores:', error);
    res.status(500).json({
      message: 'Erro ao buscar seguidores'
    });
  }
};

// Listar seguindo
const seguindo = async (req, res) => {
  try {
    const { id } = req.params;

    const seguindoList = await Seguidor.findAll({
      where: { seguidor_id: id },
      include: [{
        model: Usuario,
        as: 'seguindo',
        attributes: ['id', 'username', 'display_name', 'avatar_url', 'bio']
      }]
    });

    res.json({
      seguindo: seguindoList.map(s => s.seguindo)
    });
  } catch (error) {
    console.error('Erro ao buscar seguindo:', error);
    res.status(500).json({
      message: 'Erro ao buscar seguindo'
    });
  }
};

// Buscar usuários
const buscar = async (req, res) => {
  try {
    const { q, limite = 10 } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({
        message: 'Digite pelo menos 2 caracteres para buscar'
      });
    }

    const usuarios = await Usuario.findAll({
      where: {
        [Op.or]: [
          { username: { [Op.like]: `%${q}%` } },
          { display_name: { [Op.like]: `%${q}%` } }
        ],
        is_active: true
      },
      attributes: ['id', 'username', 'display_name', 'avatar_url', 'bio'],
      limit: parseInt(limite)
    });

    res.json({
      usuarios
    });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({
      message: 'Erro ao buscar usuários'
    });
  }
};

module.exports = {
  obter,
  seguir,
  verificarSeguimento,
  seguidores,
  seguindo,
  buscar
};
