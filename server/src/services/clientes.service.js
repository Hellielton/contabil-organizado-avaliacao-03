import { conflito, naoEncontrado } from '../errors/AppError.js'
import { validarCliente } from '../validators/clientes.validator.js'
import { validarId } from '../validators/comuns.js'
import { exigirDono } from './permissoes.js'

// Camada de serviço: regras de negócio de clientes.
// Recebe o repositório por parâmetro (injeção de dependência), o que permite
// testar as regras sem banco de dados.
export function criarClientesService({ clientesRepo }) {
  async function buscarOuFalhar(id) {
    const cliente = await clientesRepo.buscarPorId(validarId(id))
    if (!cliente) throw naoEncontrado('Cliente')
    return cliente
  }

  return {
    listar: () => clientesRepo.listar(),

    buscar: (id) => buscarOuFalhar(id),

    async criar(corpo, usuario) {
      const dados = validarCliente(corpo)
      return clientesRepo.criar(dados, usuario.id)
    },

    async atualizar(id, corpo, usuario) {
      const atual = await buscarOuFalhar(id)
      exigirDono(atual, usuario)
      const dados = validarCliente(corpo)
      return clientesRepo.atualizar(atual.id, dados)
    },

    async remover(id, usuario) {
      const atual = await buscarOuFalhar(id)
      exigirDono(atual, usuario)
      if (atual.totalDocumentos > 0) {
        throw conflito('Não é possível excluir um cliente que possui documentos. Exclua os documentos antes.')
      }
      await clientesRepo.remover(atual.id)
    },
  }
}
