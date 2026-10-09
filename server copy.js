const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const { initDb } = require('./src/database/db');
const apiRoutes = require('./src/routes/apiRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Security & Middleware
app.use(helmet({
    contentSecurityPolicy: false // Disabled for embedded speech and inline local scripts
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Mount API routes
app.use('/api', apiRoutes);

// Fallback to SPA index.html for unknown page routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Initialize DB and start server
initDb()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`=================================================`);
            console.log(`🛡️  IDOSO SEGURO+ MANAUS - SERVIDOR ONLINE`);
            console.log(`📍 Acesse em: http://localhost:${PORT}`);
            console.log(`=================================================`);
        });
    })
    .catch((err) => {
        console.error('❌ Erro crítico ao iniciar servidor:', err);
        process.exit(1);
    });
