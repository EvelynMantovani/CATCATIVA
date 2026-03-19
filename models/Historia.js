const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Historia = sequelize.define('Historia', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: {
      len: [1, 150]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  author_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('EM ANDAMENTO', 'COMPLETA', 'PAUSADA', 'CANCELADA'),
    defaultValue: 'EM ANDAMENTO'
  },
  cover_url: {
    type: DataTypes.TEXT,
    defaultValue: '/coisas/logo/isologo.png'
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  likes_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  comments_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  classificacao: {
    type: DataTypes.ENUM('LIVRE', '+10', '+12', '+14', '+16', '+18'),
    defaultValue: 'LIVRE'
  },
  is_public: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'historias',
  indexes: [
    { fields: ['author_id'] },
    { fields: ['status'] },
    { fields: ['is_public'] },
    { fields: ['views'] },
    { fields: ['likes_count'] },
    { fields: ['created_at'] }
  ]
});

// Método para incrementar visualizações
Historia.prototype.incrementarViews = async function() {
  this.views += 1;
  await this.save();
};

module.exports = Historia;
