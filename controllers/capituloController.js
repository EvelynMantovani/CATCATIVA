const { Capitulo, Historia } = require('../models');

// Criar novo capítulo
const criar = async (req, res) => {
  try {
    const { historiaId, title, content, chapterNumber } = req.params.id ? req.body : req.body;

    // Verificar se história existe
    const historia = await Historia.findByPk(historiaId);
    if (!historia) {
      return res.status(404).json({
        message: 'História não encontrada'
      });
    }

    // Verificar se é o autor
    if (historia.author_id !== req.usuarioId && !req.usuario.is_admin) {
      return res.status(403).json({
        message: 'Você não tem permissão para adicionar capítulos a esta história'
      });
    }

    // Contar capítulos existentes
    const countCapitulos = await Capitulo.count({ where: { historia_id: historiaId } });

    // Criar capítulo
    const capitulo = await Capitulo.create({
      historia_id: historiaId,
      title,
      content,
      chapter_number: chapterNumber || (countCapitulos + 1)
    });

    res.status(201).json({
      message: 'Capítulo criado com sucesso!',
      capitulo
    });
  } catch (error) {
    console.error('Erro ao criar capítulo:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        message: 'Já existe um capítulo com este número'
      });
    }
    
    res.status(500).json({
      message: 'Erro ao criar capítulo'
    });
  }
};

// Listar capítulos de uma história
const listar = async (req, res) => {
  try {
    const { historiaId } = req.params;

    const capitulos = await Capitulo.findAll({
      where: { historia_id: historiaId },
      order: [['chapter_number', 'ASC']],
      attributes: ['id', 'title', 'chapter_number', 'views', 'created_at']
    });

    res.json({
      capitulos
    });
  } catch (error) {
    console.error('Erro ao listar capítulos:', error);
    res.status(500).json({
      message: 'Erro ao listar capítulos'
    });
  }
};

// Obter capítulo específico
const obter = async (req, res) => {
  try {
    const { historiaId, chapterNumber } = req.params;

    const capitulo = await Capitulo.findOne({
      where: { 
        historia_id: historiaId,
        chapter_number: chapterNumber
      }
    });

    if (!capitulo) {
      return res.status(404).json({
        message: 'Capítulo não encontrado'
      });
    }

    // Incrementar visualizações do capítulo
    await capitulo.incrementarViews();

    // Buscar história para informações adicionais
    const historia = await Historia.findByPk(historiaId, {
      include: [
        { model: require('../models').Usuario, as: 'author', attributes: ['id', 'username', 'display_name', 'avatar_url'] },
        { model: require('../models').Genero, as: 'generos', attributes: ['id', 'name'] }
      ]
    });

    // Buscar todos os capítulos para navegação
    const todosCapitulos = await Capitulo.findAll({
      where: { historia_id: historiaId },
      order: [['chapter_number', 'ASC']],
      attributes: ['id', 'title', 'chapter_number', 'views', 'created_at']
    });

    res.json({
      capitulo: {
        ...capitulo.toJSON(),
        historia: {
          id: historia.id,
          title: historia.title,
          author: historia.author,
          generos: historia.generos,
          cover_url: historia.cover_url,
          views: historia.views,
          likes_count: historia.likes_count,
          comments_count: historia.comments_count,
          totalCapitulos: todosCapitulos.length
        },
        capitulos: todosCapitulos
      }
    });
  } catch (error) {
    console.error('Erro ao obter capítulo:', error);
    res.status(500).json({
      message: 'Erro ao obter capítulo'
    });
  }
};

// Atualizar capítulo
const atualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, isPublic } = req.body;

    const capitulo = await Capitulo.findByPk(id, {
      include: [{ model: Historia, as: 'historia' }]
    });

    if (!capitulo) {
      return res.status(404).json({
        message: 'Capítulo não encontrado'
      });
    }

    // Buscar história para verificar autor
    const historia = await Historia.findByPk(capitulo.historia_id);

    // Verificar se é o autor da história
    if (historia.author_id !== req.usuarioId && !req.usuario.is_admin) {
      return res.status(403).json({
        message: 'Você não tem permissão para editar este capítulo'
      });
    }

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;
    if (isPublic !== undefined) updates.is_public = isPublic;

    await Capitulo.update(updates, { where: { id } });

    const capituloAtualizado = await Capitulo.findByPk(id);

    res.json({
      message: 'Capítulo atualizado com sucesso!',
      capitulo: capituloAtualizado
    });
  } catch (error) {
    console.error('Erro ao atualizar capítulo:', error);
    res.status(500).json({
      message: 'Erro ao atualizar capítulo'
    });
  }
};

// Excluir capítulo
const excluir = async (req, res) => {
  try {
    const { id } = req.params;

    const capitulo = await Capitulo.findByPk(id);

    if (!capitulo) {
      return res.status(404).json({
        message: 'Capítulo não encontrado'
      });
    }

    // Buscar história para verificar autor
    const historia = await Historia.findByPk(capitulo.historia_id);

    // Verificar se é o autor da história
    if (historia.author_id !== req.usuarioId && !req.usuario.is_admin) {
      return res.status(403).json({
        message: 'Você não tem permissão para excluir este capítulo'
      });
    }

    // Excluir capítulo
    await Capitulo.destroy({ where: { id } });

    res.json({
      message: 'Capítulo excluído com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao excluir capítulo:', error);
    res.status(500).json({
      message: 'Erro ao excluir capítulo'
    });
  }
};

module.exports = {
  criar,
  listar,
  obter,
  atualizar,
  excluir
};
