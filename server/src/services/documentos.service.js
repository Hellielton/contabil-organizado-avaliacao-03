import { erroValidacao, naoEncontrado, proibido } from '../errors/AppError.js'
import { validarId } from '../validators/comuns.js'
import { validarDocumento, validarFiltros, validarStatus } from '../validators/documentos.validator.js'
import { exigirDono } from './permissoes.js'

// Camada de serviço: regras de negócio de documentos.
export function criarDocumentosService({ documentosRepo, clientesRepo }) {
  async function buscarOuFalhar(id) {
    const documento = await documentosRepo.buscarPorId(validarId(id))
    if (!documento) throw naoEncontrado('Documento')
    return documento
  }

  // O cliente do documento precisa existir e pertencer ao usuário logado.
  async function exigirClienteDoUsuario(clienteId, usuario) {
    const cliente = await clientesRepo.buscarPorId(clienteId)
    if (!cliente) throw erroValidacao(['clienteId não corresponde a nenhum cliente'])
    if (cliente.usuarioId !== usuario.id) {
      throw proibido('Você só pode cadastrar documentos para clientes que são seus.')
    }
  }

  return {
    listar: (consulta) => documentosRepo.listar(validarFiltros(consulta)),

    buscar: (id) => buscarOuFalhar(id),

    async listarPorCliente(clienteId) {
      const id = validarId(clienteId, 'clienteId')
      const cliente = await clientesRepo.buscarPorId(id)
      if (!cliente) throw naoEncontrado('Cliente')
      return documentosRepo.listar({ clienteId: id })
    },

    async criar(corpo, usuario) {
      // Todo documento novo entra como pendente, mesmo que o corpo traga outro status
      const dados = validarDocumento({ ...corpo, status: 'pendente' })
      await exigirClienteDoUsuario(dados.clienteId, usuario)
      return documentosRepo.criar(dados, usuario.id)
    },

    async atualizar(id, corpo, usuario) {
      const atual = await buscarOuFalhar(id)
      exigirDono(atual, usuario)
      const dados = validarDocumento(corpo, { statusPadrao: atual.status })
      await exigirClienteDoUsuario(dados.clienteId, usuario)
      return documentosRepo.atualizar(atual.id, dados)
    },

    async mudarStatus(id, corpo, usuario) {
      const atual = await buscarOuFalhar(id)
      exigirDono(atual, usuario)
      return documentosRepo.atualizarStatus(atual.id, validarStatus(corpo))
    },

    async remover(id, usuario) {
      const atual = await buscarOuFalhar(id)
      exigirDono(atual, usuario)
      await documentosRepo.remover(atual.id)
    },
  }
}
