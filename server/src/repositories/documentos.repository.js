// Camada de dados: só fala SQL com o banco. Nenhuma regra de negócio aqui.
// O join com clientes devolve o nome do cliente junto com o documento.
const SELECT = `
  select d.id,
         d.cliente_id as "clienteId",
         c.nome as cliente,
         d.tipo,
         d.numero,
         d.competencia,
         d.data,
         d.vencimento,
         d.valor,
         d.status,
         d.observacoes,
         d.usuario_id as "usuarioId",
         d.criado_em as "criadoEm"
    from documentos d
    join clientes c on c.id = d.cliente_id`

export function criarDocumentosRepository(pool) {
  async function buscarPorId(id) {
    const { rows } = await pool.query(`${SELECT} where d.id = $1`, [id])
    return rows[0] ?? null
  }

  async function listar({ clienteId, status } = {}) {
    const condicoes = []
    const parametros = []
    if (clienteId !== undefined) {
      parametros.push(clienteId)
      condicoes.push(`d.cliente_id = $${parametros.length}`)
    }
    if (status !== undefined) {
      parametros.push(status)
      condicoes.push(`d.status = $${parametros.length}`)
    }
    const where = condicoes.length > 0 ? `where ${condicoes.join(' and ')}` : ''
    const { rows } = await pool.query(`${SELECT} ${where} order by d.id desc`, parametros)
    return rows
  }

  async function criar(dados, usuarioId) {
    const { rows } = await pool.query(
      `insert into documentos
         (cliente_id, tipo, numero, competencia, data, vencimento, valor, status, observacoes, usuario_id)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       returning id`,
      [
        dados.clienteId,
        dados.tipo,
        dados.numero,
        dados.competencia,
        dados.data,
        dados.vencimento,
        dados.valor,
        dados.status,
        dados.observacoes,
        usuarioId,
      ],
    )
    return buscarPorId(rows[0].id)
  }

  async function atualizar(id, dados) {
    await pool.query(
      `update documentos
          set cliente_id = $1, tipo = $2, numero = $3, competencia = $4, data = $5,
              vencimento = $6, valor = $7, status = $8, observacoes = $9
        where id = $10`,
      [
        dados.clienteId,
        dados.tipo,
        dados.numero,
        dados.competencia,
        dados.data,
        dados.vencimento,
        dados.valor,
        dados.status,
        dados.observacoes,
        id,
      ],
    )
    return buscarPorId(id)
  }

  async function atualizarStatus(id, status) {
    await pool.query('update documentos set status = $1 where id = $2', [status, id])
    return buscarPorId(id)
  }

  async function remover(id) {
    await pool.query('delete from documentos where id = $1', [id])
  }

  return { buscarPorId, listar, criar, atualizar, atualizarStatus, remover }
}
