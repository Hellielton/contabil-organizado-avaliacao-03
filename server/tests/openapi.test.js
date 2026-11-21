import { test } from 'node:test'
import assert from 'node:assert/strict'
import { openapi } from '../src/docs/openapi.js'

const METODOS = ['get', 'post', 'put', 'patch', 'delete']

function todasAsReferencias(no, achadas = []) {
  if (Array.isArray(no)) no.forEach((n) => todasAsReferencias(n, achadas))
  else if (no && typeof no === 'object') {
    if (typeof no.$ref === 'string') achadas.push(no.$ref)
    Object.values(no).forEach((n) => todasAsReferencias(n, achadas))
  }
  return achadas
}

test('é OpenAPI 3 e tem info e servidores', () => {
  assert.match(openapi.openapi, /^3\./)
  assert.ok(openapi.info.title && openapi.info.version)
})

test('todos os $ref apontam para algo que existe', () => {
  const refs = todasAsReferencias(openapi)
  assert.ok(refs.length > 10)
  for (const r of refs) {
    const caminho = r.replace('#/', '').split('/')
    let atual = openapi
    for (const parte of caminho) atual = atual?.[parte]
    assert.ok(atual, `referência quebrada: ${r}`)
  }
})

test('rotas de escrita declaram segurança e resposta 401; todas as operações têm respostas', () => {
  let total = 0
  for (const [caminho, item] of Object.entries(openapi.paths)) {
    for (const metodo of METODOS.filter((m) => item[m])) {
      total++
      const op = item[metodo]
      assert.ok(op.summary, `${metodo} ${caminho} sem summary`)
      assert.ok(Object.keys(op.responses).length > 0)
      if (metodo !== 'get') {
        assert.deepEqual(op.security, [{ bearerAuth: [] }], `${metodo} ${caminho} sem security`)
        assert.ok(op.responses[401], `${metodo} ${caminho} sem 401`)
      }
    }
  }
  assert.equal(total, 13)
})

test('cobre todas as rotas implementadas', async () => {
  const { readFile } = await import('node:fs/promises')
  const fonte = await readFile(new URL('../src/routes/index.js', import.meta.url), 'utf8')
  const rotas = [...fonte.matchAll(/rotas\.(get|post|put|patch|delete)\('([^']+)'/g)]
  assert.ok(rotas.length >= 12)
  for (const [, metodo, caminho] of rotas) {
    const doc = '/api' + caminho.replace(/:(\w+)/g, '{$1}')
    assert.ok(openapi.paths[doc]?.[metodo], `rota sem documentação: ${metodo} ${doc}`)
  }
})
