const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const authRoutes = require('./routes/auth.routes');
const agendamentoRoutes = require('./routes/agendamento.routes');
const pagamentoRoutes = require('./routes/pagamento.routes');
const userRoutes = require('./routes/user.routes');
const { errorHandler } = require('./middlewares/errorHandler');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/agendamentos', agendamentoRoutes);
app.use('/api/pagamentos', pagamentoRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    name: 'AXE GESTAO PRO API',
    version: '1.0.0',
    description: 'Sistema de Gestao para Terreiros de Umbanda e Candomble',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      agendamentos: '/api/agendamentos',
      pagamentos: '/api/pagamentos',
      users: '/api/users'
    }
  });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`API: http://localhost:${PORT}`);
});

module.exports = app;
