const { initDb, getAsync } = require('../src/database/db');
const pythonAdapter = require('../src/services/pythonAdapter');
const analysisService = require('../src/services/analysisService');
const educationService = require('../src/services/educationService');

async function runTests() {
    console.log('=================================================');
    console.log('🧪 EXECUTANDO TESTES DE INTEGRAÇÃO E BACKEND');
    console.log('=================================================\n');

    try {
        // Test 1: DB Initialization
        console.log('Test 1: Inicialização e Carga do Banco SQLite...');
        await initDb();
        const topicCount = await getAsync('SELECT COUNT(*) as count FROM education_topics');
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
        const pythonResult = await pythonAdapter.runAnalyzer('text', testText);

        console.log('  -> Resultado do Analisador Python:');
        console.log(`     Nível de Risco: ${pythonResult.riskLevel}`);
        console.log(`     Score de Risco: ${pythonResult.riskScore}`);
        console.log(`     Badge Exibida:  ${pythonResult.riskBadge}`);
        console.log(`     Sinais Identificados: ${pythonResult.signals.length}`);
        console.log(`     Recomendações Geradas: ${pythonResult.recommendations.length}\n`);

        if (pythonResult.riskScore > 40) {
            console.log('  -> Sucesso: O motor Python identificou os indícios de urgência, senha e link suspeito!\n');
        } else {
            throw new Error('O motor Python não pontuou os sinais de risco esperados.');
        }

        // Test 4: End-to-End Analysis Persistence (Ciclo Assistivo-Educativo)
        console.log('Test 4: Salvamento da Análise no SQLite e Vínculo ao Modo Ensinar...');
        const persistedAnalysis = await analysisService.analyze('text', testText);
        console.log(`  -> Análise salva no SQLite com ID #${persistedAnalysis.id}. Tópico vinculado: '${persistedAnalysis.educationTopic}'.\n`);

        console.log('=================================================');
        console.log('✅ TODOS OS TESTES PASSARAM COM SUCESSO!');
        console.log('=================================================');

    } catch (err) {
        console.error('❌ FALHA NOS TESTES:', err);
        process.exit(1);
    }
}

runTests();
