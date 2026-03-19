const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Figurinha = sequelize.define('Figurinha', {
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
  codigo: {
    type: DataTypes.STRING(10),
    allowNull: false
  }
}, {
  tableName: 'figurinhas',
  indexes: [
    { 
      unique: true, 
      fields: ['usuario_id', 'codigo'] 
    }
  ]
});

// Figurinhas padrão para novos usuários
const figurinhasPadrao = ['🐱', '❤️', '⭐', '😢', '🔥', '😂', '👏', '😍', '🎉', '✨', '🌙', '☀️', '🌸', '🍀', '🎨', '📚', '✍️', '💫', '🦋', '🌈'];

module.exports = { Figurinha, figurinhasPadrao };
