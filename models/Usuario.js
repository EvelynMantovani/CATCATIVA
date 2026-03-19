const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 50],
      is: /^[a-zA-Z0-9_]+$/
    }
  },
  display_name: {
    type: DataTypes.STRING(80),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(120),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  avatar_url: {
    type: DataTypes.TEXT,
    defaultValue: '/coisas/logo/isotipo-gato.png'
  },
  is_admin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'usuarios',
  hooks: {
    beforeCreate: async (usuario) => {
      if (usuario.password_hash) {
        const salt = await bcrypt.genSalt(12);
        usuario.password_hash = await bcrypt.hash(usuario.password_hash, salt);
      }
    },
    beforeUpdate: async (usuario) => {
      if (usuario.changed('password_hash')) {
        const salt = await bcrypt.genSalt(12);
        usuario.password_hash = await bcrypt.hash(usuario.password_hash, salt);
      }
    }
  }
});

// Método para comparar senha
Usuario.prototype.compararSenha = async function(senha) {
  return await bcrypt.compare(senha, this.password_hash);
};

// Método para retornar dados públicos
Usuario.prototype.toPublicJSON = function() {
  return {
    id: this.id,
    username: this.username,
    displayName: this.display_name,
    email: this.email,
    bio: this.bio,
    avatarUrl: this.avatar_url,
    isAdmin: this.is_admin,
    createdAt: this.created_at
  };
};

module.exports = Usuario;
