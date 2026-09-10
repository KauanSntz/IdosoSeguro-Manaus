const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, '../../database/idoso_seguro.db');
const schemaPath = path.resolve(__dirname, '../../database/schema.sql');
const seedPath = path.resolve(__dirname, '../../database/seed.sql');

// Ensure database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

let dbInstance = null;

function getDb() {
    if (!dbInstance) {
        dbInstance = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('[Database] Erro ao conectar ao SQLite:', err.message);
            } else {
                console.log('[Database] Conectado ao arquivo SQLite:', dbPath);
            }
        });
    }
    return dbInstance;
}

function runAsync(sql, params = []) {
    return new Promise((resolve, reject) => {
        const db = getDb();
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve({ lastID: this.lastID, changes: this.changes });
        });
    });
}

function getAsync(sql, params = []) {
    return new Promise((resolve, reject) => {
        const db = getDb();
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

function allAsync(sql, params = []) {
    return new Promise((resolve, reject) => {
        const db = getDb();
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

async function initDb() {
    console.log('[Database] Inicializando banco de dados...');
    const db = getDb();

    return new Promise((resolve, reject) => {
        db.serialize(async () => {
            try {
                const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
                db.exec(schemaSql, async (err) => {
                    if (err) {
                        console.error('[Database] Erro ao executar schema.sql:', err);
                        return reject(err);
                    }

                    // Check if topics already exist before seeding
                    const row = await getAsync('SELECT COUNT(*) as count FROM education_topics');
                    if (row && row.count === 0) {
                        console.log('[Database] Populando dados de semente (seed.sql)...');
                        const seedSql = fs.readFileSync(seedPath, 'utf-8');
                        db.exec(seedSql, (seedErr) => {
                            if (seedErr) {
                                console.error('[Database] Erro ao executar seed.sql:', seedErr);
                                return reject(seedErr);
                            }
                            console.log('[Database] Banco de dados populado com sucesso!');
                            resolve(true);
                        });
                    } else {
                        console.log('[Database] Dados já existentes, pulando semente.');
                        resolve(true);
                    }
                });
            } catch (error) {
                console.error('[Database] Falha durante a inicialização:', error);
                reject(error);
            }
        });
    });
}

module.exports = {
    getDb,
    runAsync,
    getAsync,
    allAsync,
    initDb
};
