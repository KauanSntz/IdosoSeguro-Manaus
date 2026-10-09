import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { initDb } from './src/database/db.js';
import apiRoutes from './src/routes/apiRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:"],
      fontSrc: ["'self'", "data:", "https://fonts.gstatic.com", "https://fonts.googleapis.com"],
      connectSrc: ["'self'", "https://fonts.googleapis.com", "https://fonts.gstatic.com"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

app.use(express.json({ limit: '5000' }));
app.use(express.urlencoded({ extended: true, limit: '5000' }));

app.use((err, req, res, next) => {
    if (err.type === 'entity.too.large') {
        console.warn('[Server] Payload too large - 413', { ip: req.ip, path: req.path });
        return res.status(413).json({ ok: false, erro: { codigo: 'PAYLOAD_TOO_LARGE', mensagem: 'Conteúdo excede o limite de 5000 caracteres.' } });
    }
    next(err);
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { ok: false, erro: { codigo: 'RATE_LIMIT', mensagem: 'Muitas requisições. Tente novamente mais tarde.' } },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path.startsWith('/api/')) {
      console.log('[Server] API Request -', req.method, req.path, res.statusCode, `${duration}ms`, 'IP:', req.ip);
    }
  });
  next();
});

app.use('/api', apiRoutes);

app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log('=================================================');
      console.log('IDOSO SEGURO+ MANAUS - SERVIDOR ONLINE');
      console.log(`Acesse em: http://localhost:${PORT}`);
      console.log('=================================================');
    });
  })
  .catch((err) => {
    console.error('Erro critico ao iniciar servidor:', err);
    process.exit(1);
  });