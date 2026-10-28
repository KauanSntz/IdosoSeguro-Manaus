/**
 * tests/atualizar-snapshots.js
 * -----------------------------------------------------------------------------
 * Regrava os snapshots do leitor de tela (tests/snapshots/*.json).
 *
 * Use SÓ depois de conferir que a mudança de fala é intencional — o diff dos
 * .json no git mostra exatamente o que a pessoa cega passa a ouvir.
 *
 *     npm run test:leitor:atualizar
 */

process.env.UPDATE_SNAPSHOTS = '1';

await import('./leitor.test.js');
