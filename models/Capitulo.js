const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Capitulo = sequelize.define('Capitulo', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  historia_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: {
      model: 'historias',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT('long'),
    allowNull: false
  },
  chapter_number: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  is_public: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'capitulos',
  indexes: [
    { 
      unique: true, 
      fields: ['historia_id', 'chapter_number'] 
    },
    { fields: ['historia_id'] }
  ]
});

// Método para incrementar visualizações
Capitulo.prototype.incrementarViews = async function() {
  this.views += 1;
  await this.save();
};

module.exports = Capitulo;
