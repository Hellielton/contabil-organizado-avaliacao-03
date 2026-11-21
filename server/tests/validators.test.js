import { test } from 'node:test'
import assert from 'node:assert/strict'
import { validarCliente } from '../src/validators/clientes.validator.js'
import { validarDocumento, validarFiltros, validarStatus } from '../src/validators/documentos.validator.js'
import { dataValida, validarId } from '../src/validators/comuns.js'

const documentoOk = {
  clienteId: 1, tipo: 'Nota Fiscal', numero: ' NF-1 ', competencia: '2026-10', data: '2026-10-05',
}

test('cliente válido é normalizado', () => {
  const c = validarCliente({ nome: '  Padaria  ', email: '', documentoFiscal: '12.345.678/0001-90' })
  assert.deepEqual(c, { nome: 'Padaria', documentoFiscal: '12.345.678/0001-90', email: null })
})

test('cliente inválido gera erro 400 com lista de problemas', () => {
  assert.throws(() => validarCliente({ nome: 'A', email: 'xx' }), (e) => e.status === 400 && e.erros.length === 2)
  assert.throws(() => validarCliente(null), (e) => e.status === 400)
})

test('documento: vencimento e valor são opcionais', () => {
  const d = validarDocumento(documentoOk)
  assert.equal(d.vencimento, null)
  assert.equal(d.valor, null)
  assert.equal(d.numero, 'NF-1')
  assert.equal(d.status, 'pendente')
})

test('documento: rejeita tipo, competência, datas e valor inválidos', () => {
  const ruim = { ...documentoOk, tipo: 'X', competencia: '2026-13', data: '2026-02-31', valor: -5 }
  assert.throws(() => validarDocumento(ruim), (e) => e.status === 400 && e.erros.length === 4)
})

test('documento: statusPadrao é usado quando o corpo não traz status', () => {
  assert.equal(validarDocumento(documentoOk, { statusPadrao: 'arquivado' }).status, 'arquivado')
})

test('status e filtros', () => {
  assert.equal(validarStatus({ status: 'conferido' }), 'conferido')
  assert.throws(() => validarStatus({ status: 'x' }), (e) => e.status === 400)
  assert.deepEqual(validarFiltros({ clienteId: '2', status: 'pendente' }), { clienteId: 2, status: 'pendente' })
  assert.throws(() => validarFiltros({ clienteId: 'abc' }), (e) => e.status === 400)
})

test('id e data', () => {
  assert.equal(validarId('5'), 5)
  assert.throws(() => validarId('0'))
  assert.throws(() => validarId('1.5'))
  assert.equal(dataValida('2026-02-28'), true)
  assert.equal(dataValida('2026-02-31'), false)
})
