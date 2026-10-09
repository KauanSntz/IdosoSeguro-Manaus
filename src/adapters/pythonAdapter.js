import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PYTHON_SCRIPT = path.resolve(__dirname, '../../motor-analise/main.py');
const PYTHON_CMDS = [
    process.env.PYTHON_CMD,
    'python',
    'py -3',
    'python3'
].filter(Boolean);

const TIMEOUT_MS = 10000;
const MAX_OUTPUT_BYTES = 1024 * 1024;

function trySpawn(cmd, args, input) {
    return new Promise((resolve, reject) => {
        const [bin, ...binArgs] = cmd.split(' ');
        const child = spawn(bin, [...binArgs, ...args], {
            env: { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' }
        });

        let stdout = '';
        let stderr = '';
        let killed = false;

        const timeout = setTimeout(() => {
            killed = true;
            child.kill('SIGTERM');
            reject(new Error('TIMEOUT'));
        }, TIMEOUT_MS);

        child.stdout.on('data', (chunk) => {
            stdout += chunk.toString('utf-8');
            if (Buffer.byteLength(stdout, 'utf-8') > MAX_OUTPUT_BYTES) {
                killed = true;
                child.kill('SIGTERM');
                clearTimeout(timeout);
                reject(new Error('OUTPUT_TOO_LARGE'));
            }
        });

        child.stderr.on('data', (chunk) => {
            stderr += chunk.toString('utf-8');
        });

        child.on('close', (code) => {
            clearTimeout(timeout);
            if (killed) return;
            if (code !== 0 && !stdout.trim()) {
                reject(new Error(`PYTHON_EXIT_${code}: ${stderr.slice(0, 200)}`));
                return;
            }
            try {
                const parsed = JSON.parse(stdout.trim());
                resolve(parsed);
            } catch (e) {
                reject(new Error(`INVALID_JSON: ${stdout.slice(0, 200)}`));
            }
        });

        child.on('error', (err) => {
            clearTimeout(timeout);
            if (killed) return;
            reject(err);
        });

        child.stdin.write(JSON.stringify(input));
        child.stdin.end();
    });
}

export async function runAnalysis(tipo, conteudo) {
    const payload = { tipo, conteudo };

    for (const cmd of PYTHON_CMDS) {
        try {
            return await trySpawn(cmd, [PYTHON_SCRIPT], payload);
        } catch (err) {
            if (err.message === 'TIMEOUT' || err.message === 'OUTPUT_TOO_LARGE' || err.message.startsWith('INVALID_JSON')) {
                throw err;
            }
        }
    }

    throw new Error('PYTHON_NOT_FOUND');
}

export function getFallbackResult(tipo) {
    return {
        ok: true,
        dados: {
            nivel: 'atencao',
            titulo: 'Verificação Indisponível',
            descricao: 'Não foi possível executar a verificação automática no momento. Recomendamos cautela.',
            indicios: [
                {
                    tipo: 'system_unavailable',
                    label: 'Motor de Análise Indisponível',
                    explicacao: 'O serviço de verificação está temporariamente fora do ar. Verifique manualmente.'
                }
            ],
            orientacoes: [
                'Não clique em links suspeitos.',
                'Não informe senhas ou códigos para ninguém.',
                'Confirme por canais oficiais antes de qualquer ação.',
                'Peça ajuda a alguém de confiança.'
            ],
            conteudoRelacionado: 'links-suspeitos'
        }
    };
}