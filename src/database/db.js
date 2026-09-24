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

                    // Check if topics or quizzes need to be updated to the latest revision
                    const topic7 = await getAsync("SELECT title FROM education_topics WHERE id = 7");
                    const quizCount = await getAsync("SELECT COUNT(*) as count FROM quiz_questions");
                    const needsUpdate = !topic7 || topic7.title !== 'CPF e Documentos' || (quizCount && quizCount.count < 7);

                    if (needsUpdate) {
                        console.log('[Database] Atualizando dados com a versão mais recente do seed.sql...');
                        const seedSql = fs.readFileSync(seedPath, 'utf-8');
                        const cleanAndSeed = `
                            DELETE FROM quiz_answers;
                            DELETE FROM quiz_questions;
                            DELETE FROM education_content;
                            DELETE FROM education_topics;
                        ` + seedSql;

                        db.exec(cleanAndSeed, (seedErr) => {
                            if (seedErr) {
                                console.error('[Database] Erro ao aplicar seed.sql:', seedErr);
                                return reject(seedErr);
                            }
                            console.log('[Database] Banco de dados atualizado com sucesso para o Guia Oficial!');
                            resolve(true);
                        });
                    } else {
                        console.log('[Database] Dados já existentes e atualizados.');
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
