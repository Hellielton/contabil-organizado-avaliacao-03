import { erroValidacao } from '../errors/AppError.js'

export const texto = (valor) => (typeof valor === 'string' ? valor.trim() : '')

// Garante que o corpo da requisição é um objeto (e não null, texto ou número)
export const comoObjeto = (corpo) => (corpo && typeof corpo === 'object' && !Array.isArray(corpo) ? corpo : {})

export function validarId(valor, nome = 'id') {
  const numero = Number(valor)
  if (!Number.isInteger(numero) || numero <= 0) {
    throw erroValidacao([`${nome} deve ser um número inteiro positivo`])
  }
  return numero
}

// "2026-11-16" é uma data de calendário real? (rejeita 2026-02-31, por exemplo)
export function dataValida(valor) {
  if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false
  const data = new Date(`${valor}T00:00:00Z`)
  return !Number.isNaN(data.getTime()) && data.toISOString().slice(0, 10) === valor
}
