const { Comentario, Historia, Usuario } = require('../models');
const { Op } = require('sequelize');

// Criar comentário
const criar = async (req, res) => {
  try {
    const { historiaId, capituloId, content, stickers } = req.body;

    // Verificar se história existe
    const historia = await Historia.findByPk(historiaId);
    if (!historia) {
      return res.status(404).json({
        message: 'História não encontrada'
      });
    }

    // Criar comentário
    const comentario = await Comentario.create({
      usuario_id: req.usuarioId,
      historia_id: historiaId,
      capitulo_id: capituloId || null,
      content,
      stickers: stickers || []
    });

    // Atualizar contagem de comentários na história
    await Historia.update(
      { comments_count: sequelize.literal('comments_count + 1') },
      { where: { id: historiaId } }
    );

    // Buscar comentário com dados do usuário
    const comentarioCompleto = await Comentario.findByPk(comentario.id, {
      include: [
        { model: Usuario, as: 'usuario', attributes: ['id', 'username', 'display_name', 'avatar_url'] }
      ]
    });

    res.status(201).json({
      message: 'Comentário adicionado com sucesso!',
      comentario: comentarioCompleto
    });
  } catch (error) {
    console.error('Erro ao criar comentário:', error);
    res.status(500).json({
      message: 'Erro ao criar comentário'
    });
  }
};

// Listar comentários de uma história
const listarPorHistoria = async (req, res) => {
  try {
    const { historiaId } = req.params;
    const { ordenar = 'recentes', limite = 50 } = req.query;

    const order = ordenar === 'populares' 
      ? [['likes_count', 'DESC'], ['created_at', 'DESC']]
      : [['created_at', 'DESC']];

    const comentarios = await Comentario.findAll({
      where: { 
        historia_id: historiaId,
        capitulo_id: null,
        is_deleted: false
      },
      include: [
        { model: Usuario, as: 'usuario', attributes: ['id', 'username', 'display_name', 'avatar_url'] }
      ],
      order,
      limit: parseInt(limite)
    });

    res.json({
      comentarios
    });
  } catch (error) {
    console.error('Erro ao listar comentários:', error);
    res.status(500).json({
      message: 'Erro ao listar comentários'
    });
  }
};

// Listar comentários de um capítulo
const listarPorCapitulo = async (req, res) => {
  try {
    const { capituloId } = req.params;
    const { ordenar = 'recentes', limite = 50 } = req.query;

    const order = ordenar === 'populares' 
      ? [['likes_count', 'DESC'], ['created_at', 'DESC']]
      : [['created_at', 'DESC']];

    const comentarios = await Comentario.findAll({
      where: { 
        capitulo_id: capituloId,
        is_deleted: false
      },
      include: [
        { model: Usuario, as: 'usuario', attributes: ['id', 'username', 'display_name', 'avatar_url'] }
      ],
      order,
      limit: parseInt(limite)
    });

    res.json({
      comentarios
    });
  } catch (error) {
    console.error('Erro ao listar comentários:', error);
    res.status(500).json({
      message: 'Erro ao listar comentários'
    });
  }
};

// Curtir/descurtir comentário
const curtir = async (req, res) => {
  try {
    const { id } = req.params;

    const comentario = await Comentario.findByPk(id);

    if (!comentario) {
      return res.status(404).json({
        message: 'Comentário não encontrado'
      });
    }

    // Incrementar likes (simplificado - não verifica se já curtiu)
    await Comentario.update(
      { likes_count: sequelize.literal('likes_count + 1') },
      { where: { id } }
    );

    const comentarioAtualizado = await Comentario.findByPk(id);

    res.json({
      message: 'Comentário curtido!',
      likesCount: comentarioAtualizado.likes_count
    });
  } catch (error) {
    console.error('Erro ao curtir comentário:', error);
    res.status(500).json({
      message: 'Erro ao curtir comentário'
    });
  }
};

// Excluir comentário
const excluir = async (req, res) => {
  try {
    const { id } = req.params;

    const comentario = await Comentario.findByPk(id);

    if (!comentario) {
      return res.status(404).json({
        message: 'Comentário não encontrado'
      });
    }

    // Verificar se é o autor do comentário ou admin
    if (comentario.usuario_id !== req.usuarioId && !req.usuario.is_admin) {
      return res.status(403).json({
        message: 'Você não tem permissão para excluir este comentário'
      });
    }

    // Soft delete
    await Comentario.update(
      { 
        is_deleted: true,
        content: '[Comentário removido]',
        stickers: []
      },
      { where: { id } }
    );

    // Atualizar contagem na história
    await Historia.update(
      { comments_count: sequelize.literal('GREATEST(comments_count - 1, 0)') },
      { where: { id: comentario.historia_id } }
    );

    res.json({
      message: 'Comentário excluído com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao excluir comentário:', error);
    res.status(500).json({
      message: 'Erro ao excluir comentário'
    });
  }
};

module.exports = {
  criar,
  listarPorHistoria,
  listarPorCapitulo,
  curtir,
  excluir
};
