const { Curtida, Historia } = require('../models');

// Curtir/descurtir história
const toggle = async (req, res) => {
  try {
    const { historiaId } = req.params;

    // Verificar se história existe
    const historia = await Historia.findByPk(historiaId);
    if (!historia) {
      return res.status(404).json({
        message: 'História não encontrada'
      });
    }

    // Verificar se já curtiu
    const curtidaExistente = await Curtida.findOne({
      where: { usuario_id: req.usuarioId, historia_id: historiaId }
    });

    if (curtidaExistente) {
      // Descurtir
      await Curtida.destroy({
        where: { id: curtidaExistente.id }
      });

      // Atualizar contagem
      await Historia.update(
        { likes_count: sequelize.literal('GREATEST(likes_count - 1, 0)') },
        { where: { id: historiaId } }
      );

      const historiaAtualizada = await Historia.findByPk(historiaId);

      res.json({
        curtido: false,
        message: 'Curtida removida',
        likesCount: historiaAtualizada.likes_count
      });
    } else {
      // Curtir
      await Curtida.create({
        usuario_id: req.usuarioId,
        historia_id: historiaId
      });

      // Atualizar contagem
      await Historia.update(
        { likes_count: sequelize.literal('likes_count + 1') },
        { where: { id: historiaId } }
      );

      const historiaAtualizada = await Historia.findByPk(historiaId);

      res.json({
        curtido: true,
        message: 'História curtida',
        likesCount: historiaAtualizada.likes_count
      });
    }
  } catch (error) {
    console.error('Erro ao curtir história:', error);
    res.status(500).json({
      message: 'Erro ao curtir história'
    });
  }
};

// Verificar se usuário curtiu história
const verificar = async (req, res) => {
  try {
    const { historiaId } = req.params;

    const curtida = await Curtida.findOne({
      where: { usuario_id: req.usuarioId, historia_id: historiaId }
    });

    res.json({
      curtido: !!curtida
    });
  } catch (error) {
    console.error('Erro ao verificar curtida:', error);
    res.status(500).json({
      message: 'Erro ao verificar curtida'
    });
  }
};

// Listar histórias curtidas pelo usuário
const minhasCurtidas = async (req, res) => {
  try {
    const { limite = 20 } = req.query;

    const curtidas = await Curtida.findAll({
      where: { usuario_id: req.usuarioId },
      include: [{
        model: Historia,
        as: 'historia',
        include: [
          { model: require('../models').Usuario, as: 'author', attributes: ['id', 'username', 'display_name', 'avatar_url'] }
        ]
      }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limite)
    });

    res.json({
      curtidas
    });
  } catch (error) {
    console.error('Erro ao buscar curtidas:', error);
    res.status(500).json({
      message: 'Erro ao buscar curtidas'
    });
  }
};

// Contar curtidas de uma história
const contar = async (req, res) => {
  try {
    const { historiaId } = req.params;

    const count = await Curtida.count({
      where: { historia_id: historiaId }
    });

    res.json({
      count
    });
  } catch (error) {
    console.error('Erro ao contar curtidas:', error);
    res.status(500).json({
      message: 'Erro ao contar curtidas'
    });
  }
};

module.exports = {
  toggle,
  verificar,
  minhasCurtidas,
  contar
};
