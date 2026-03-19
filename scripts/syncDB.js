/**
 * Script para sincronizar as tabelas do banco de dados
 * Use: node scripts/syncDB.js
 */

const { sequelize } = require('../config/database');
const models = require('../models');

const syncDatabase = async () => {
  try {
    console.log('🔄 Sincronizando banco de dados...');
    
    // Testar conexão
    await sequelize.authenticate();
    console.log('✅ Conexão estabelecida');
    
    // Sincronizar todos os models
    // { alter: true } atualiza as tabelas sem perder dados
    // { force: true } recria as tabelas (⚠️ PERDE TODOS OS DADOS)
    await sequelize.sync({ alter: true });
    
    console.log('✅ Tabelas sincronizadas com sucesso!');
    console.log('\nTabelas criadas:');
    
    // Listar tabelas
    const [results] = await sequelize.query('SHOW TABLES');
    results.forEach((row, index) => {
      const tableName = Object.values(row)[0];
      console.log(`  ${index + 1}. ${tableName}`);
    });
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao sincronizar banco de dados:', error.message);
    await sequelize.close();
    process.exit(1);
  }
};

syncDatabase();
