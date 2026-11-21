import { test } from 'node:test'
import assert from 'node:assert/strict'
import { criarClientesService } from '../src/services/clientes.service.js'
import { criarDocumentosService } from '../src/services/documentos.service.js'

const dono = { id: 'u1' }
const outro = { id: 'u2' }
const status = (codigo) => (e) => e.status === codigo

function bancoFalso() {
  const clientes = [{ id: 1, nome: 'A', usuarioId: 'u1', totalDocumentos: 0 }, { id: 2, nome: 'B', usuarioId: 'u1', totalDocumentos: 2 }]
  const documentos = [{ id: 10, clienteId: 1, usuarioId: 'u1', status: 'pendente' }]
  const clientesRepo = {
    buscarPorId: async (id) => clientes.find((c) => c.id === id) ?? null,
    listar: async () => clientes,
    criar: async (d, usuarioId) => ({ id: 99, ...d, usuarioId }),
    atualizar: async (id, d) => ({ id, ...d }),
    remover: async (id) => { clientes.splice(clientes.findIndex((c) => c.id === id), 1) },
  }
  const documentosRepo = {
    buscarPorId: async (id) => documentos.find((d) => d.id === id) ?? null,
    listar: async (f) => documentos.filter((d) => !f.clienteId || d.clienteId === f.clienteId),
    criar: async (d, usuarioId) => ({ id: 11, ...d, usuarioId }),
    atualizar: async (id, d) => ({ id, ...d }),
    atualizarStatus: async (id, s) => ({ id, status: s }),
    remover: async (id) => { documentos.splice(documentos.findIndex((d) => d.id === id), 1) },
  }
  return { clientesRepo, documentosRepo, clientes, documentos }
}

test('cliente: criar grava o usuário logado como dono', async () => {
  const { clientesRepo } = bancoFalso()
  const s = criarClientesService({ clientesRepo })
  const c = await s.criar({ nome: 'Nova Empresa' }, dono)
  assert.equal(c.usuarioId, 'u1')
})

test('cliente: só o dono edita ou exclui (403) e inexistente dá 404', async () => {
  const { clientesRepo } = bancoFalso()
  const s = criarClientesService({ clientesRepo })
  await assert.rejects(s.atualizar(1, { nome: 'Zeta' }, outro), status(403))
  await assert.rejects(s.remover(1, outro), status(403))
  await assert.rejects(s.buscar(555), status(404))
  await assert.rejects(s.buscar('abc'), status(400))
  assert.equal((await s.atualizar(1, { nome: 'Zeta' }, dono)).nome, 'Zeta')
})

test('cliente: com documentos não pode excluir (409); sem documentos exclui', async () => {
  const { clientesRepo, clientes } = bancoFalso()
  const s = criarClientesService({ clientesRepo })
  await assert.rejects(s.remover(2, dono), status(409))
  await s.remover(1, dono)
  assert.equal(clientes.length, 1)
})

test('documento: criar sempre entra como pendente e exige cliente do usuário', async () => {
  const { clientesRepo, documentosRepo } = bancoFalso()
  const s = criarDocumentosService({ clientesRepo, documentosRepo })
  const corpo = { clienteId: 1, tipo: 'Recibo', numero: '1', competencia: '2026-10', data: '2026-10-01', status: 'arquivado' }
  assert.equal((await s.criar(corpo, dono)).status, 'pendente')
  await assert.rejects(s.criar(corpo, outro), status(403))
  await assert.rejects(s.criar({ ...corpo, clienteId: 77 }, dono), status(400))
})

test('documento: só o dono altera, muda status ou exclui', async () => {
  const { clientesRepo, documentosRepo, documentos } = bancoFalso()
  const s = criarDocumentosService({ clientesRepo, documentosRepo })
  await assert.rejects(s.mudarStatus(10, { status: 'conferido' }, outro), status(403))
  await assert.rejects(s.remover(10, outro), status(403))
  await assert.rejects(s.mudarStatus(10, { status: 'xx' }, dono), status(400))
  assert.equal((await s.mudarStatus(10, { status: 'conferido' }, dono)).status, 'conferido')
  await s.remover(10, dono)
  assert.equal(documentos.length, 0)
  await assert.rejects(s.buscar(10), status(404))
})

test('documento: listarPorCliente valida o cliente', async () => {
  const { clientesRepo, documentosRepo } = bancoFalso()
  const s = criarDocumentosService({ clientesRepo, documentosRepo })
  assert.equal((await s.listarPorCliente(1)).length, 1)
  await assert.rejects(s.listarPorCliente(99), status(404))
})
