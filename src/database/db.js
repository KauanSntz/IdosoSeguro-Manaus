import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../../database/idoso_seguro.db');
const schemaPath = path.resolve(__dirname, '../../database/schema.sql');
const seedPath = path.resolve(__dirname, '../../database/seed.sql');

const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

let dbInstance = null;

function getDbSync() {
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

export function runAsync(sql, params = []) {
    return new Promise((resolve, reject) => {
        const db = getDbSync();
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve({ lastID: this.lastID, changes: this.changes });
        });
    });
}

export function getAsync(sql, params = []) {
    return new Promise((resolve, reject) => {
        const db = getDbSync();
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

export function allAsync(sql, params = []) {
    return new Promise((resolve, reject) => {
        const db = getDbSync();
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

export function initDb() {
    console.log('[Database] Inicializando banco de dados...');

    return new Promise((resolve, reject) => {
        const db = getDbSync();

        const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
        db.exec(schemaSql, async (err) => {
            if (err) {
                console.error('[Database] Erro ao executar schema.sql:', err);
                return reject(err);
            }
            console.log('[Database] Schema aplicado.');

            const topic7 = await getAsync("SELECT title FROM education_topics WHERE id = 7");
            const quizCount = await getAsync("SELECT COUNT(*) as count FROM quiz_questions");
            const needsUpdate = !topic7 || topic7.title !== 'CPF e Documentos' || (quizCount && quizCount.count < 7);

            if (needsUpdate) {
                console.log('[Database] Atualizando dados com a versao mais recente do seed.sql...');
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
                    console.log('[Database] Banco de dados atualizado com sucesso!');
                    resolve(true);
                });
            } else {
                console.log('[Database] Dados ja existentes e atualizados.');
                resolve(true);
            }
        });
    });
}

if (import.meta.url === `file://${process.argv[1]}`) {
    await initDb();
    console.log('[Database] Inicializacao concluida via CLI.');
    process.exit(0);
}