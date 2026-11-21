// Erro "esperado" da aplicação, com o código HTTP que deve ser devolvido.
export class AppError extends Error {
  constructor(status, mensagem, erros = []) {
    super(mensagem)
    this.name = 'AppError'
    this.status = status
    this.erros = erros
  }
}

export const erroValidacao = (erros) =>
  new AppError(400, `Dados inválidos: ${erros.join('; ')}.`, erros)

export const naoAutenticado = (mensagem = 'Autenticação necessária. Envie o token no cabeçalho Authorization.') =>
  new AppError(401, mensagem)

export const proibido = (mensagem = 'Você não tem permissão para alterar este recurso.') =>
  new AppError(403, mensagem)

export const naoEncontrado = (recurso = 'Recurso') => new AppError(404, `${recurso} não encontrado.`)

export const conflito = (mensagem) => new AppError(409, mensagem)
