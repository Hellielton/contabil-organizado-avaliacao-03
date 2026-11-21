import { erroValidacao } from '../errors/AppError.js'
import { comoObjeto, texto } from './comuns.js'

// Valida e normaliza o corpo de criação/edição de cliente.
export function validarCliente(corpo) {
  const entrada = comoObjeto(corpo)
  const dados = {
    nome: texto(entrada.nome),
    documentoFiscal: texto(entrada.documentoFiscal) || null,
    email: texto(entrada.email) || null,
  }

  const erros = []
  if (dados.nome.length < 2) erros.push('nome é obrigatório (mínimo de 2 caracteres)')
  if (dados.nome.length > 120) erros.push('nome deve ter no máximo 120 caracteres')
  if (dados.documentoFiscal && !/^[\d./-]{11,18}$/.test(dados.documentoFiscal)) {
    erros.push('documentoFiscal deve ser um CPF ou CNPJ (números, ponto, barra e hífen)')
  }
  if (dados.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) erros.push('email inválido')

  if (erros.length > 0) throw erroValidacao(erros)
  return dados
}
