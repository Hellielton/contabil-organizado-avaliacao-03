import { test } from 'node:test'
import assert from 'node:assert/strict'
import { criarAutenticar, verificadorSupabase } from '../src/middlewares/autenticar.js'
import { tratarErros, rotaNaoEncontrada } from '../src/middlewares/errorHandler.js'
import { erroValidacao } from '../src/errors/AppError.js'

function chamar(middleware, headers = {}) {
  return new Promise((resolve) => {
    const req = { headers }
    middleware(req, {}, (erro) => resolve({ req, erro }))
  })
}

function resFalso() {
  const res = { corpo: null, status(c) { this.codigo = c; return this }, json(c) { this.corpo = c; return this } }
  return res
}

test('autenticar: sem cabeçalho ou esquema errado → 401', async () => {
  const autenticar = criarAutenticar(async () => ({ id: 'u1' }))
  assert.equal((await chamar(autenticar)).erro.status, 401)
  assert.equal((await chamar(autenticar, { authorization: 'Basic abc' })).erro.status, 401)
})

test('autenticar: token inválido → 401; válido preenche req.usuario', async () => {
  const autenticar = criarAutenticar(async (t) => (t === 'bom' ? { id: 'u1', email: 'a@b.c' } : null))
  assert.equal((await chamar(autenticar, { authorization: 'Bearer ruim' })).erro.status, 401)
  const { req, erro } = await chamar(autenticar, { authorization: 'Bearer bom' })
  assert.equal(erro, undefined)
  assert.equal(req.usuario.id, 'u1')
})

test('verificadorSupabase converte a resposta do Supabase', async () => {
  const ok = verificadorSupabase({ auth: { getUser: async () => ({ data: { user: { id: 'x', email: 'e' } }, error: null }) } })
  assert.deepEqual(await ok('t'), { id: 'x', email: 'e' })
  const falha = verificadorSupabase({ auth: { getUser: async () => ({ data: { user: null }, error: new Error('x') }) } })
  assert.equal(await falha('t'), null)
})

test('tratarErros mapeia AppError e códigos do Postgres', () => {
  let res = resFalso()
  tratarErros(erroValidacao(['x']), {}, res, () => {})
  assert.equal(res.codigo, 400)
  assert.deepEqual(res.corpo.erros, ['x'])

  for (const [code, status] of [['23503', 409], ['23505', 409], ['22P02', 400]]) {
    res = resFalso()
    tratarErros({ code }, {}, res, () => {})
    assert.equal(res.codigo, status)
  }

  res = resFalso()
  const original = console.error
  console.error = () => {}
  tratarErros(new Error('boom'), {}, res, () => {})
  console.error = original
  assert.equal(res.codigo, 500)

  res = resFalso()
  rotaNaoEncontrada({}, res)
  assert.equal(res.codigo, 404)
})
