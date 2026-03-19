const { Genero, Historia } = require('../models');

/** Conta histórias públicas vinculadas ao gênero (evita include em HistoriaGenero / alias Historium). */
async function contarHistoriasPublicasPorGenero(generoId) {
  return Historia.count({
    where: { is_public: true },
    // `col` estava gerando alias incorreto no SQL (Historia->Historia.id).
    // Sem `col`, o Sequelize usa a PK do modelo base (Historia.id).
    distinct: true,
    include: [
      {
        model: Genero,
        as: 'generos',
        where: { id: generoId },
        required: true,
        through: { attributes: [] }
      }
    ]
  });
}

// Listar todos os gêneros
const listar = async (req, res) => {
  try {
    const generos = await Genero.findAll({
      where: { is_active: true },
      order: [['name', 'ASC']]
    });
    
  

    // Contar histórias por gênero
    const generosComContagem = await Promise.all(
      generos.map(async (genero) => {
        const count = await contarHistoriasPublicasPorGenero(genero.id);
        return {
          ...genero.toJSON(),
          historiasCount: count
        };
      })
    );

    res.json({
      generos: generosComContagem
    });
  } catch (error) {
    console.error('Erro ao listar gêneros:', error);
    res.status(500).json({
      message: 'Erro ao listar gêneros'
    });
  }
};

// Obter gênero por ID
const obter = async (req, res) => {
  try {
    const { id } = req.params;

    const genero = await Genero.findByPk(id);

    if (!genero) {
      return res.status(404).json({
        message: 'Gênero não encontrado'
      });
    }

    // Contar histórias do gênero
    const historiasCount = await contarHistoriasPublicasPorGenero(genero.id);

    res.json({
      genero: {
        ...genero.toJSON(),
        historiasCount
      }
    });
  } catch (error) {
    console.error('Erro ao obter gênero:', error);
    res.status(500).json({
      message: 'Erro ao obter gênero'
    });
  }
};

// Criar novo gênero (apenas admin)
const criar = async (req, res) => {
  try {
    const { name, icon, color, description } = req.body;

    const genero = await Genero.create({
      name,
      icon,
      color,
      description
    });

    res.status(201).json({
      message: 'Gênero criado com sucesso!',
      genero
    });
  } catch (error) {
    console.error('Erro ao criar gênero:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        message: 'Já existe um gênero com este nome'
      });
    }
    
    res.status(500).json({
      message: 'Erro ao criar gênero'
    });
  }
};

// Atualizar gênero (apenas admin)
const atualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon, color, description, isActive } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (icon !== undefined) updates.icon = icon;
    if (color !== undefined) updates.color = color;
    if (description !== undefined) updates.description = description;
    if (isActive !== undefined) updates.is_active = isActive;

    await Genero.update(updates, { where: { id } });

    const genero = await Genero.findByPk(id);

    if (!genero) {
      return res.status(404).json({
        message: 'Gênero não encontrado'
      });
    }

    res.json({
      message: 'Gênero atualizado com sucesso!',
      genero
    });
  } catch (error) {
    console.error('Erro ao atualizar gênero:', error);
    res.status(500).json({
      message: 'Erro ao atualizar gênero'
    });
  }
};

// Excluir gênero (apenas admin)
const excluir = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Genero.destroy({ where: { id } });

    if (!deleted) {
      return res.status(404).json({
        message: 'Gênero não encontrado'
      });
    }

    res.json({
      message: 'Gênero excluído com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao excluir gênero:', error);
    res.status(500).json({
      message: 'Erro ao excluir gênero'
    });
  }
};

module.exports = {
  listar,
  obter,
  criar,
  atualizar,
  excluir
};
