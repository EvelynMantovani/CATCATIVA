// Importar models
const { sequelize, DataTypes } = require('../config/database');

const Usuario = require('./Usuario');
const { Genero } = require('./Genero');
const Historia = require('./Historia');
const Capitulo = require('./Capitulo');
const Comentario = require('./Comentario');
const Curtida = require('./Curtida');
const HistoriaGenero = require('./HistoriaGenero');
const Seguidor = require('./Seguidor');
const { Figurinha, figurinhasPadrao } = require('./Figurinha');

// Definir associações

// Usuario -> Historia (um usuário tem muitas histórias)
Usuario.hasMany(Historia, { foreignKey: 'author_id', as: 'historias' });
Historia.belongsTo(Usuario, { foreignKey: 'author_id', as: 'author' });

// Historia -> Capitulo (uma história tem muitos capítulos)
Historia.hasMany(Capitulo, { foreignKey: 'historia_id', as: 'capitulos' });
Capitulo.belongsTo(Historia, { foreignKey: 'historia_id', as: 'historia' });

// Historia <-> Genero (muitos para muitos)
Historia.belongsToMany(Genero, { 
  through: HistoriaGenero, 
  foreignKey: 'historia_id',
  otherKey: 'genero_id',
  as: 'generos'
});
Genero.belongsToMany(Historia, { 
  through: HistoriaGenero, 
  foreignKey: 'genero_id',
  otherKey: 'historia_id',
  as: 'historias'
});

// Usuario -> Comentario (um usuário tem muitos comentários)
Usuario.hasMany(Comentario, { foreignKey: 'usuario_id', as: 'comentarios' });
Comentario.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

// Historia -> Comentario (uma história tem muitos comentários)
Historia.hasMany(Comentario, { foreignKey: 'historia_id', as: 'comentarios' });
Comentario.belongsTo(Historia, { foreignKey: 'historia_id', as: 'historia' });

// Capitulo -> Comentario (um capítulo tem muitos comentários)
Capitulo.hasMany(Comentario, { foreignKey: 'capitulo_id', as: 'comentarios' });
Comentario.belongsTo(Capitulo, { foreignKey: 'capitulo_id', as: 'capitulo' });

// Usuario -> Curtida (um usuário tem muitas curtidas)
Usuario.hasMany(Curtida, { foreignKey: 'usuario_id', as: 'curtidas' });
Curtida.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

// Historia -> Curtida (uma história tem muitas curtidas)
Historia.hasMany(Curtida, { foreignKey: 'historia_id', as: 'curtidas' });
Curtida.belongsTo(Historia, { foreignKey: 'historia_id', as: 'historia' });

// Usuario -> Figurinha (um usuário tem muitas figurinhas)
Usuario.hasMany(Figurinha, { foreignKey: 'usuario_id', as: 'figurinhas' });
Figurinha.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

// Seguidores (auto-referência many-to-many)
Usuario.belongsToMany(Usuario, { 
  through: Seguidor, 
  as: 'seguidores',
  foreignKey: 'seguindo_id',
  otherKey: 'seguidor_id'
});
Usuario.belongsToMany(Usuario, { 
  through: Seguidor, 
  as: 'seguindo',
  foreignKey: 'seguidor_id',
  otherKey: 'seguindo_id'
});

module.exports = {
  sequelize,
  Usuario,
  Genero,
  Historia,
  Capitulo,
  Comentario,
  Curtida,
  HistoriaGenero,
  Seguidor,
  Figurinha,
  figurinhasPadrao
};
