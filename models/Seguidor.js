const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Seguidor = sequelize.define('Seguidor', {
  seguidor_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    },
    primaryKey: true
  },
  seguindo_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    },
    primaryKey: true
  }
}, {
  tableName: 'seguidores',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = Seguidor;
