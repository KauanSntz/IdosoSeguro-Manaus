import { initDb, getAsync } from '../src/database/db.js';
import { runAnalysis } from '../src/adapters/pythonAdapter.js';
import analysisService from '../src/services/analysisService.js';
import educationService from '../src/services/educationService.js';

async function runTests() {
    console.log('=================================================');
    console.log('🧪 EXECUTANDO TESTES DE INTEGRAÇÃO E BACKEND');
    console.log('=================================================\n');

    try {
        // Test 1: DB Initialization
        console.log('Test 1: Inicialização e Carga do Banco SQLite...');
        await initDb();
        const topicCount = await getAsync('SELECT COUNT(*) as count FROM education_topics');
        if (topicCount.count < 7) {
            throw new Error(`Esperava ao menos 7 tópicos, encontrou ${topicCount.count}.`);
        }
        console.log(`  -> Sucesso: ${topicCount.count} tópicos cadastrados.\n`);

        // Test 2: Education Topics Retrieval
        console.log('Test 2: Consulta dos Tópicos Educativos (Modo Ensinar)...');
        const topics = await educationService.getAllTopics();
        if (topics && topics.length > 0) {
            console.log(`  -> Sucesso: Tópico retornado '${topics[0].title}'.\n`);
        } else {
            throw new Error('Nenhum tópico retornado pelo serviço de educação.');
        }

        // Test 3: Python Risk Analyzer Execution (Modo Assistir)
        console.log('Test 3: Invocação do Motor Heurístico Python...');
        const testText = 'Urgente! Seu benefício foi bloqueado. Digite sua senha no link http://atualiza-banco.site';
        const pythonResult = await runAnalysis('texto', testText);

        console.log('  -> Resultado do Analisador Python:');
        console.log(`     Nível de Risco: ${pythonResult.dados.nivel}`);
        console.log(`     Indícios Identificados: ${pythonResult.dados.indicios.length}`);
        console.log(`     Orientações Geradas: ${pythonResult.dados.orientacoes.length}`);
        console.log(`     Conteúdo Relacionado: ${pythonResult.dados.conteudoRelacionado}\n`);

        if (!pythonResult.ok) {
            throw new Error('O motor Python retornou erro.');
        }
        if (pythonResult.dados.nivel === 'baixo') {
            throw new Error('O motor Python não classificou a mensagem suspeita como risco.');
        }
        if (pythonResult.dados.indicios.length < 2) {
            throw new Error('Esperava ao menos 2 indícios de risco (urgência, senha, link).');
        }
        console.log('  -> Sucesso: O motor Python identificou urgência, senha e link suspeito!\n');

        // Test 4: End-to-End Analysis (Ciclo Assistivo-Educativo)
        console.log('Test 4: Análise completa com vínculo ao Modo Ensinar...');
        const persistedAnalysis = await analysisService.analyze('texto', testText);
        console.log(`  -> Análise retornada com nível '${persistedAnalysis.nivel}'. Tópico vinculado: '${persistedAnalysis.conteudoRelacionado}'.\n`);

        if (!persistedAnalysis.conteudoRelacionado) {
            throw new Error('Análise não retornou conteúdo educativo vinculado.');
        }

        console.log('=================================================');
        console.log('✅ TODOS OS TESTES PASSARAM COM SUCESSO!');
        console.log('=================================================');

    } catch (err) {
        console.error('❌ FALHA NOS TESTES:', err);
        process.exit(1);
    }
}

runTests();
