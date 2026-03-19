const { Historia, Capitulo, Genero, Usuario, Curtida, HistoriaGenero, sequelize } = require('../models');
const { Op } = require('sequelize');

// Criar nova história
const criar = async (req, res) => {
  try {
    const { title, description, generos, tags, classificacao, coverUrl } = req.body;

    const historia = await Historia.create({
      title,
      description,
      author_id: req.usuarioId,
      classificacao: classificacao || 'LIVRE',
      cover_url: coverUrl || '/coisas/logo/isologo.png'
    });

    // Adicionar gêneros se fornecidos
    if (generos && generos.length > 0) {
      const generosArray = Array.isArray(generos) ? generos : [generos];
      for (const generoId of generosArray) {
        await HistoriaGenero.create({
          historia_id: historia.id,
          genero_id: generoId
        });
      }
    }

    // Buscar história com relacionamentos
    const historiaCompleta = await Historia.findByPk(historia.id, {
      include: [
        { model: Usuario, as: 'author', attributes: ['id', 'username', 'display_name', 'avatar_url'] },
        { model: Genero, as: 'generos', attributes: ['id', 'name'] }
      ]
    });

    res.status(201).json({
      message: 'História criada com sucesso!',
      historia: historiaCompleta
    });
  } catch (error) {
    console.error('Erro ao criar história:', error);
    res.status(500).json({
      message: 'Erro ao criar história'
    });
  }
};

// Listar todas as histórias (públicas)
const listar = async (req, res) => {
  try {
    const { 
      pagina = 1, 
      limite = 12, 
      ordenar = 'recentes',
      genero,
      busca 
    } = req.query;

    const where = { is_public: true };
    const include = [
      { model: Usuario, as: 'author', attributes: ['id', 'username', 'display_name', 'avatar_url'] },
      { model: Genero, as: 'generos', attributes: ['id', 'name'] }
    ];

    // Filtrar por gênero
    if (genero) {
      const generoEncontrado = await Genero.findOne({ where: { name: genero } });
      if (generoEncontrado) {
        include[1].where = { id: generoEncontrado.id };
      }
    }

    // Busca por texto
    if (busca) {
      where[Op.or] = [
        { title: { [Op.like]: `%${busca}%` } },
        { description: { [Op.like]: `%${busca}%` } }
      ];
    }

    // Ordenação
    let order = [['created_at', 'DESC']];
    switch (ordenar) {
      case 'visualizacoes':
        order = [['views', 'DESC']];
        break;
      case 'curtidas':
        order = [['likes_count', 'DESC']];
        break;
      case 'comentarios':
        order = [['comments_count', 'DESC']];
        break;
    }

    const offset = (parseInt(pagina) - 1) * parseInt(limite);

    const { count, rows: historias } = await Historia.findAndCountAll({
      where,
      include,
      order,
      offset,
      limit: parseInt(limite),
      distinct: true
    });

    // Verificar se usuário curtiu cada história
    let historiasComCurtida = historias;
    if (req.usuarioId) {
      historiasComCurtida = await Promise.all(
        historias.map(async (h) => {
          const curtida = await Curtida.findOne({
            where: { usuario_id: req.usuarioId, historia_id: h.id }
          });
          return { ...h.toJSON(), curtido: !!curtida };
        })
      );
    }

    res.json({
      historias: historiasComCurtida,
      paginacao: {
        pagina: parseInt(pagina),
        limite: parseInt(limite),
        total: count,
        totalPaginas: Math.ceil(count / parseInt(limite))
      }
    });
  } catch (error) {
    console.error('Erro ao listar histórias:', error);
    res.status(500).json({
      message: 'Erro ao listar histórias'
    });
  }
};

// Obter história por ID
const obter = async (req, res) => {
  try {
    const { id } = req.params;

    const historia = await Historia.findByPk(id, {
      include: [
        { model: Usuario, as: 'author', attributes: ['id', 'username', 'display_name', 'avatar_url', 'bio'] },
        { model: Genero, as: 'generos', attributes: ['id', 'name', 'icon'] },
        { model: Capitulo, as: 'capitulos', attributes: ['id', 'title', 'chapter_number', 'views', 'created_at'] }
      ]
    });

    if (!historia) {
      return res.status(404).json({
        message: 'História não encontrada'
      });
    }

    // Incrementar visualizações
    await historia.incrementarViews();

    // Verificar se usuário curtiu
    let curtido = false;
    if (req.usuarioId) {
      const curtida = await Curtida.findOne({
        where: { usuario_id: req.usuarioId, historia_id: historia.id }
      });
      curtido = !!curtida;
    }

    res.json({
      historia: {
        ...historia.toJSON(),
        curtido
      }
    });
  } catch (error) {
    console.error('Erro ao obter história:', error);
    res.status(500).json({
      message: 'Erro ao obter história'
    });
  }
};

// Atualizar história
const atualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, generos, status, classificacao, coverUrl, isPublic } = req.body;

    const historia = await Historia.findByPk(id);

    if (!historia) {
      return res.status(404).json({
        message: 'História não encontrada'
      });
    }

    // Verificar se é o autor
    if (historia.author_id !== req.usuarioId && !req.usuario.is_admin) {
      return res.status(403).json({
        message: 'Você não tem permissão para editar esta história'
      });
    }

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;
    if (classificacao !== undefined) updates.classificacao = classificacao;
    if (coverUrl !== undefined) updates.cover_url = coverUrl;
    if (isPublic !== undefined) updates.is_public = isPublic;

    await Historia.update(updates, { where: { id } });

    // Atualizar gêneros se fornecidos
    if (generos) {
      await HistoriaGenero.destroy({ where: { historia_id: id } });
      const generosArray = Array.isArray(generos) ? generos : [generos];
      for (const generoId of generosArray) {
        await HistoriaGenero.create({ historia_id: id, genero_id: generoId });
      }
    }

    const historiaAtualizada = await Historia.findByPk(id, {
      include: [
        { model: Usuario, as: 'author', attributes: ['id', 'username', 'display_name', 'avatar_url'] },
        { model: Genero, as: 'generos', attributes: ['id', 'name'] }
      ]
    });

    res.json({
      message: 'História atualizada com sucesso!',
      historia: historiaAtualizada
    });
  } catch (error) {
    console.error('Erro ao atualizar história:', error);
    res.status(500).json({
      message: 'Erro ao atualizar história'
    });
  }
};

// Excluir história
const excluir = async (req, res) => {
  try {
    const { id } = req.params;

    const historia = await Historia.findByPk(id);

    if (!historia) {
      return res.status(404).json({
        message: 'História não encontrada'
      });
    }

    // Verificar se é o autor
    if (historia.author_id !== req.usuarioId && !req.usuario.is_admin) {
      return res.status(403).json({
        message: 'Você não tem permissão para excluir esta história'
      });
    }

    // Excluir capítulos da história
    await Capitulo.destroy({ where: { historia_id: id } });

    // Excluir história
    await Historia.destroy({ where: { id } });

    res.json({
      message: 'História excluída com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao excluir história:', error);
    res.status(500).json({
      message: 'Erro ao excluir história'
    });
  }
};

// Histórias populares
const populares = async (req, res) => {
  try {
    const { limite = 6 } = req.query;

    const historias = await Historia.findAll({
      where: { is_public: true },
      include: [
        { model: Usuario, as: 'author', attributes: ['id', 'username', 'display_name', 'avatar_url'] },
        { model: Genero, as: 'generos', attributes: ['id', 'name'] }
      ],
      order: [['views', 'DESC'], ['likes_count', 'DESC']],
      limit: parseInt(limite)
    });

    // Verificar se usuário curtiu
    let historiasComCurtida = historias;
    if (req.usuarioId) {
      historiasComCurtida = await Promise.all(
        historias.map(async (h) => {
          const curtida = await Curtida.findOne({
            where: { usuario_id: req.usuarioId, historia_id: h.id }
          });
          return { ...h.toJSON(), curtido: !!curtida };
        })
      );
    }

    res.json({
      historias: historiasComCurtida
    });
  } catch (error) {
    console.error('Erro ao buscar histórias populares:', error);
    res.status(500).json({
      message: 'Erro ao buscar histórias populares'
    });
  }
};

// Histórias do usuário logado
const minhasHistorias = async (req, res) => {
  try {
    const historias = await Historia.findAll({
      where: { author_id: req.usuarioId },
      include: [
        { model: Genero, as: 'generos', attributes: ['id', 'name'] }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      historias
    });
  } catch (error) {
    console.error('Erro ao buscar minhas histórias:', error);
    res.status(500).json({
      message: 'Erro ao buscar histórias'
    });
  }
};

// Histórias de um usuário específico
const historiasPorUsuario = async (req, res) => {
  try {
    const { usuarioId } = req.params;

    const historias = await Historia.findAll({
      where: { 
        author_id: usuarioId,
        is_public: true 
      },
      include: [
        { model: Genero, as: 'generos', attributes: ['id', 'name'] }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      historias
    });
  } catch (error) {
    console.error('Erro ao buscar histórias do usuário:', error);
    res.status(500).json({
      message: 'Erro ao buscar histórias'
    });
  }
};

module.exports = {
  criar,
  listar,
  obter,
  atualizar,
  excluir,
  populares,
  minhasHistorias,
  historiasPorUsuario
};
