import { STATUS_DOCUMENTO, TIPOS_DOCUMENTO } from '../domain/constantes.js'
import { erroValidacao } from '../errors/AppError.js'
import { comoObjeto, dataValida, texto } from './comuns.js'

// Valida e normaliza o corpo de criação/edição de documento.
// Vencimento e valor são opcionais: se não vierem, ficam null.
export function validarDocumento(corpo, { statusPadrao = 'pendente' } = {}) {
  const entrada = comoObjeto(corpo)
  const semValor = entrada.valor === undefined || entrada.valor === null || entrada.valor === ''

  const dados = {
    clienteId: Number(entrada.clienteId),
    tipo: entrada.tipo,
    numero: texto(entrada.numero),
    competencia: entrada.competencia,
    data: entrada.data,
    vencimento: entrada.vencimento ? entrada.vencimento : null,
    valor: semValor ? null : Number(entrada.valor),
    observacoes: texto(entrada.observacoes),
    status: entrada.status ?? statusPadrao,
  }

  const erros = []
  if (!Number.isInteger(dados.clienteId) || dados.clienteId <= 0) erros.push('clienteId é obrigatório')
  if (!TIPOS_DOCUMENTO.includes(dados.tipo)) erros.push('tipo inválido')
  if (!dados.numero) erros.push('número é obrigatório')
  if (dados.numero.length > 60) erros.push('número deve ter no máximo 60 caracteres')
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(dados.competencia ?? '')) erros.push('competência deve estar no formato AAAA-MM')
  if (!dataValida(dados.data)) erros.push('data deve ser uma data válida no formato AAAA-MM-DD')
  if (dados.vencimento !== null && !dataValida(dados.vencimento)) {
    erros.push('vencimento deve ser uma data válida no formato AAAA-MM-DD')
  }
  if (dados.valor !== null && !(Number.isFinite(dados.valor) && dados.valor > 0)) {
    erros.push('valor deve ser maior que zero')
  }
  if (!STATUS_DOCUMENTO.includes(dados.status)) erros.push('status inválido')

  if (erros.length > 0) throw erroValidacao(erros)
  return dados
}

export function validarStatus(corpo) {
  const status = comoObjeto(corpo).status
  if (!STATUS_DOCUMENTO.includes(status)) {
    throw erroValidacao([`status deve ser um destes: ${STATUS_DOCUMENTO.join(', ')}`])
  }
  return status
}

// Filtros opcionais da listagem (?clienteId=1&status=pendente)
export function validarFiltros(consulta) {
  const entrada = comoObjeto(consulta)
  const filtros = {}
  const erros = []

  if (entrada.clienteId !== undefined) {
    const clienteId = Number(entrada.clienteId)
    if (Number.isInteger(clienteId) && clienteId > 0) filtros.clienteId = clienteId
    else erros.push('clienteId deve ser um número inteiro positivo')
  }
  if (entrada.status !== undefined) {
    if (STATUS_DOCUMENTO.includes(entrada.status)) filtros.status = entrada.status
    else erros.push(`status deve ser um destes: ${STATUS_DOCUMENTO.join(', ')}`)
  }

  if (erros.length > 0) throw erroValidacao(erros)
  return filtros
}
