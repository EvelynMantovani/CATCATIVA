const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Curtida = sequelize.define('Curtida', {
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
  }
}, {
  tableName: 'curtidas',
  indexes: [
    { 
      unique: true, 
      fields: ['usuario_id', 'historia_id'] 
    },
    { fields: ['historia_id'] },
    { fields: ['usuario_id'] }
  ]
});

module.exports = Curtida;
