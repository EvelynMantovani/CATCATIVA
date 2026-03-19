const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Genero = sequelize.define('Genero', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(60),
    allowNull: false,
    unique: true
  },
  icon: {
    type: DataTypes.STRING(10),
    defaultValue: '📚'
  },
  color: {
    type: DataTypes.STRING(7),
    defaultValue: '#5C6BC0'
  },
  description: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'generos'
});

// Lista de gêneros padrão
const generosPadrao = [
  { name: 'Ação', icon: '⚡' },
  { name: 'Aventura', icon: '🗺️' },
  { name: 'Comédia', icon: '😂' },
  { name: 'Conto', icon: '📖' },
  { name: 'Crônica', icon: '📰' },
  { name: 'Drabble', icon: '✏️' },
  { name: 'Drama', icon: '🎭' },
  { name: 'Épico', icon: '⚔️' },
  { name: 'Esporte', icon: '⚽' },
  { name: 'Fábula', icon: '🦊' },
  { name: 'Família', icon: '👨‍👩‍👧‍👦' },
  { name: 'Fantasia', icon: '✨' },
  { name: 'Ficção', icon: '📚' },
  { name: 'Ficção Adolescente', icon: '🎒' },
  { name: 'Ficção Científica', icon: '🚀' },
  { name: 'Boys Love', icon: '👬' },
  { name: 'Girls Love', icon: '👭' },
  { name: 'LGBTQIAPN+', icon: '🏳️‍🌈' },
  { name: 'Light Novel', icon: '📕' },
  { name: 'Poesia', icon: '🎨' },
  { name: 'Literatura Adulta', icon: '🔞' },
  { name: 'Literatura Feminina', icon: '💄' },
  { name: 'Luta', icon: '🥊' },
  { name: 'Magia', icon: '🔮' },
  { name: 'Mistério', icon: '🔍' },
  { name: 'Musical', icon: '🎵' },
  { name: 'Policial', icon: '👮' },
  { name: 'Prosa Poética', icon: '📝' },
  { name: 'Romance', icon: '💕' },
  { name: 'Romântico', icon: '💘' },
  { name: 'Saga', icon: '📚' },
  { name: 'Sátira', icon: '🎪' },
  { name: 'Sobrenatural', icon: '👻' },
  { name: 'Soneto', icon: '📜' },
  { name: 'Suspense', icon: '😰' },
  { name: 'Terror', icon: '💀' },
  { name: 'Tragicomédia', icon: '🎭' },
  { name: 'Universo Alternativo', icon: '🌌' }
];

// Função para inicializar gêneros
const inicializarGeneros = async () => {
  try {
    for (const genero of generosPadrao) {
      await Genero.findOrCreate({
        where: { name: genero.name },
        defaults: genero
      });
    }
    console.log('✅ Gêneros inicializados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao inicializar gêneros:', error);
  }
};

module.exports = { Genero, inicializarGeneros };
