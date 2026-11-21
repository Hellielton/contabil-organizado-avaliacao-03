// Cadastra clientes e documentos de exemplo para um usuário.
// Uso: defina SEED_USUARIO_ID no .env (id do usuário em Supabase > Authentication > Users)
// e rode npm run seed. Pode rodar mais de uma vez: não duplica registros.
import { criarPool } from '../src/config/database.js'
import { documentosIniciais } from './dados-seed.js'

const usuarioId = process.env.SEED_USUARIO_ID
if (!process.env.DATABASE_URL || !usuarioId) {
  console.error('Defina DATABASE_URL e SEED_USUARIO_ID no arquivo .env.')
  process.exit(1)
}

const pool = criarPool({
  databaseUrl: process.env.DATABASE_URL,
  databaseSsl: process.env.DATABASE_SSL !== 'false',
})

try {
  const nomes = [...new Set(documentosIniciais.map((doc) => doc.cliente))]
  for (const nome of nomes) {
    await pool.query(
      'insert into clientes (nome, usuario_id) values ($1, $2) on conflict (usuario_id, nome) do nothing',
      [nome, usuarioId],
    )
  }

  const { rows } = await pool.query('select id, nome from clientes where usuario_id = $1', [usuarioId])
  const idPorNome = new Map(rows.map((linha) => [linha.nome, linha.id]))

  for (const doc of documentosIniciais) {
    await pool.query(
      `insert into documentos
         (cliente_id, tipo, numero, competencia, data, vencimento, valor, status, observacoes, usuario_id)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       on conflict (cliente_id, tipo, numero) do nothing`,
      [
        idPorNome.get(doc.cliente),
        doc.tipo,
        doc.numero,
        doc.competencia,
        doc.data,
        doc.vencimento,
        doc.valor,
        doc.status,
        doc.observacoes,
        usuarioId,
      ],
    )
  }

  console.log(`Seed concluído: ${nomes.length} clientes e ${documentosIniciais.length} documentos.`)
} catch (erro) {
  console.error(erro.message)
  process.exitCode = 1
} finally {
  await pool.end()
}
