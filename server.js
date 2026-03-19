const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Carregar variáveis de ambiente
dotenv.config();

// Importar configuração do banco
const { sequelize, testConnection } = require('./config/database');
const { inicializarGeneros } = require('./models/Genero');

// Importar rotas
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const historiaRoutes = require('./routes/historias');
const capituloRoutes = require('./routes/capitulos');
const generoRoutes = require('./routes/generos');
const comentarioRoutes = require('./routes/comentarios');
const curtidaRoutes = require('./routes/curtidas');

// Inicializar app
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/historias', historiaRoutes);
app.use('/api/capitulos', capituloRoutes);
app.use('/api/generos', generoRoutes);
app.use('/api/comentarios', comentarioRoutes);
app.use('/api/curtidas', curtidaRoutes);

// Rota para servir o frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

app.get('/explorar', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/explorar.html'));
});

app.get('/perfil', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/perfil.html'));
});

app.get('/leitura', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/leitura.html'));
});

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Catcativa API está funcionando!',
    database: 'MariaDB',
    timestamp: new Date().toISOString()
  });
});

// Tratamento de erros 404
app.use((req, res) => {
  res.status(404).json({ message: 'Rota não encontrada' });
});

// Tratamento de erros gerais
app.use((err, req, res, next) => {
  console.error('Erro:', err);
  res.status(500).json({ 
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Testar conexão com banco
    const connected = await testConnection();
    
    if (!connected) {
      console.error('❌ Não foi possível conectar ao banco de dados');
      process.exit(1);
    }

    // Sincronizar models (criar tabelas se não existirem)
    await sequelize.sync({ alter: true });
    console.log('✅ Tabelas sincronizadas!');

    // Inicializar gêneros padrão
    await inicializarGeneros();

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`
========================================
   CATCATIVA SERVER INICIADO!
   Porta: ${PORT}
   Ambiente: ${process.env.NODE_ENV || 'development'}
   Banco: MariaDB
========================================
      `);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
