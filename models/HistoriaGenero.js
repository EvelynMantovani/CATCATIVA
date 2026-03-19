const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Historia = require('../models/Historia');
const { Genero } = require('../models/Genero');

const HistoriaGenero = sequelize.define('HistoriaGenero', {
  historia_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: {
      model: 'historias',
      key: 'id'
    },
    primaryKey: true
  },
  genero_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: {
      model: 'generos',
      key: 'id'
    },
    primaryKey: true
  }
  
}, {
  tableName: 'historia_generos',
  timestamps: false
});

HistoriaGenero.belongsTo(Historia, {
  foreignKey: 'historia_id',
  as: 'historia'
});

HistoriaGenero.belongsTo(Genero, {
  foreignKey: 'genero_id',
  as: 'genero'
});

module.exports = HistoriaGenero;
