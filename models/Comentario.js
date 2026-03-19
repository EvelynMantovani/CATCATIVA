const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Comentario = sequelize.define('Comentario', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  usuario_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  historia_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: {
      model: 'historias',
      key: 'id'
    }
  },
  capitulo_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
    references: {
      model: 'capitulos',
      key: 'id'
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  stickers: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  likes_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  is_deleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'comentarios',
  indexes: [
    { fields: ['historia_id'] },
    { fields: ['capitulo_id'] },
    { fields: ['usuario_id'] },
    { fields: ['created_at'] }
  ]
});

module.exports = Comentario;
