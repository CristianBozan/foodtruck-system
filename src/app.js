require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

const app = express();
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const swaggerSpec = require('./docs/swagger');

// ── Segurança ──────────────────────────────────────────────────────────────
app.use(helmet());

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const limiterGeral = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Muitas requisições. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false
});

const limiterAuth = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' }
});

app.use(limiterGeral);

// ── Body Parser ────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));

// ── Logging de requisições ─────────────────────────────────────────────────
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// ── Documentação API ───────────────────────────────────────────────────────
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ── Rotas públicas ─────────────────────────────────────────────────────────
const authRoutes = require('./routes/authRoutes');
app.use('/auth', limiterAuth, authRoutes);

// ── Rotas protegidas ───────────────────────────────────────────────────────
app.use('/atendentes', require('./routes/atendenteRoutes'));
app.use('/produtos', require('./routes/produtoRoutes'));
app.use('/mesas', require('./routes/mesaRoutes'));
app.use('/pedidos', require('./routes/pedidoRoutes'));
app.use('/itens-pedido', require('./routes/itemPedidoRoutes'));
app.use('/vendas', require('./routes/vendaRoutes'));
app.use('/relatorios', require('./routes/relatorioRoutes'));

// ── Arquivos estáticos ─────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '../public')));

// ── Health check ───────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 404 ────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// ── Erro centralizado ──────────────────────────────────────────────────────
app.use(errorHandler);

// ── Start ──────────────────────────────────────────────────────────────────
if (require.main === module) {
  const sequelize = require('./config/database');
  const PORT = process.env.PORT || 3000;

  sequelize.sync().then(() => {
    logger.info('Banco sincronizado!');
    app.listen(PORT, () => logger.info(`Servidor rodando na porta ${PORT}`));
  }).catch((err) => {
    logger.error('Falha ao conectar ao banco:', err);
    process.exit(1);
  });
}

module.exports = app;
