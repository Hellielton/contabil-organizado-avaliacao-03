// Camada de dados: só fala SQL com o banco. Nenhuma regra de negócio aqui.
const SELECT = `
  select c.id,
         c.nome,
         c.documento_fiscal as "documentoFiscal",
         c.email,
         c.usuario_id as "usuarioId",
         c.criado_em as "criadoEm",
         (select count(*)::int from documentos d where d.cliente_id = c.id) as "totalDocumentos"
    from clientes c`

export function criarClientesRepository(pool) {
  async function buscarPorId(id) {
    const { rows } = await pool.query(`${SELECT} where c.id = $1`, [id])
    return rows[0] ?? null
  }

  async function listar() {
    const { rows } = await pool.query(`${SELECT} order by c.nome`)
    return rows
  }

  async function criar(dados, usuarioId) {
    const { rows } = await pool.query(
      `insert into clientes (nome, documento_fiscal, email, usuario_id)
       values ($1, $2, $3, $4)
       returning id`,
      [dados.nome, dados.documentoFiscal, dados.email, usuarioId],
    )
    return buscarPorId(rows[0].id)
  }

  async function atualizar(id, dados) {
    await pool.query(
      `update clientes
          set nome = $1, documento_fiscal = $2, email = $3
        where id = $4`,
      [dados.nome, dados.documentoFiscal, dados.email, id],
    )
    return buscarPorId(id)
  }

  async function remover(id) {
    await pool.query('delete from clientes where id = $1', [id])
  }

  return { buscarPorId, listar, criar, atualizar, remover }
}
