import { AppError } from '../errors/AppError.js'

const resposta = (res, status, mensagem, erros = []) => res.status(status).json({ mensagem, erros })

// Rota que não existe
export function rotaNaoEncontrada(req, res) {
  resposta(res, 404, 'Rota não encontrada.')
}

// Tratamento central de erros: todo erro das rotas chega aqui (via next).
// O quarto parâmetro (next) precisa existir para o Express reconhecer o middleware de erro.
// eslint-disable-next-line no-unused-vars
export function tratarErros(erro, req, res, next) {
  if (erro instanceof AppError) return resposta(res, erro.status, erro.message, erro.erros)

  // JSON malformado no corpo da requisição
  if (erro.type === 'entity.parse.failed') return resposta(res, 400, 'JSON inválido.')

  // Erros do PostgreSQL (o driver coloca o código SQLSTATE em erro.code)
  if (erro.code === '23503') {
    return resposta(res, 409, 'Operação bloqueada: existem registros relacionados (chave estrangeira).')
  }
  if (erro.code === '23505') return resposta(res, 409, 'Já existe um registro com esses dados.')
  if (['22007', '22008', '22P02', '23514'].includes(erro.code)) {
    return resposta(res, 400, 'Dados inválidos para o banco de dados.')
  }

  console.error(erro)
  return resposta(res, 500, 'Erro interno do servidor.')
}
