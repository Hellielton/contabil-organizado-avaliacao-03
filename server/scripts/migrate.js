// Aplica, em ordem, os arquivos de migrations/*.sql que ainda não foram aplicados.
// O que já rodou fica registrado na tabela schema_migrations.
// Uso: npm run migrate
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { criarPool } from '../src/config/database.js'

const PASTA = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'migrations')

if (!process.env.DATABASE_URL) {
  console.error('Defina DATABASE_URL no arquivo .env.')
  process.exit(1)
}

const pool = criarPool({
  databaseUrl: process.env.DATABASE_URL,
  databaseSsl: process.env.DATABASE_SSL !== 'false',
})

try {
  await pool.query(`
    create table if not exists schema_migrations (
      nome       text primary key,
      aplicada_em timestamptz not null default now()
    )`)

  const { rows } = await pool.query('select nome from schema_migrations')
  const aplicadas = new Set(rows.map((linha) => linha.nome))
  const arquivos = (await readdir(PASTA)).filter((nome) => nome.endsWith('.sql')).sort()

  let novas = 0
  for (const arquivo of arquivos) {
    if (aplicadas.has(arquivo)) continue

    const sql = await readFile(path.join(PASTA, arquivo), 'utf-8')
    const conexao = await pool.connect()
    try {
      await conexao.query('begin')
      await conexao.query(sql)
      await conexao.query('insert into schema_migrations (nome) values ($1)', [arquivo])
      await conexao.query('commit')
      console.log(`Aplicada: ${arquivo}`)
      novas += 1
    } catch (erro) {
      await conexao.query('rollback')
      throw new Error(`Falha em ${arquivo}: ${erro.message}`)
    } finally {
      conexao.release()
    }
  }

  console.log(novas === 0 ? 'Banco já está atualizado.' : `${novas} migration(s) aplicada(s).`)
} catch (erro) {
  console.error(erro.message)
  process.exitCode = 1
} finally {
  await pool.end()
}
