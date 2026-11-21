import { Router } from 'express'
import { asyncHandler as seguro } from '../utils/asyncHandler.js'

// Camada de rotas: liga cada URL a um método do controller.
// Leitura (GET) é pública; escrita (POST, PUT, PATCH, DELETE) passa por `autenticar`.
export function criarRotas({ clientesController: clientes, documentosController: documentos, autenticar }) {
  const rotas = Router()

  // Clientes
  rotas.get('/clientes', seguro(clientes.listar))
  rotas.post('/clientes', autenticar, seguro(clientes.criar))
  rotas.get('/clientes/:id', seguro(clientes.buscar))
  rotas.put('/clientes/:id', autenticar, seguro(clientes.atualizar))
  rotas.delete('/clientes/:id', autenticar, seguro(clientes.remover))
  rotas.get('/clientes/:id/documentos', seguro(documentos.listarPorCliente))

  // Documentos
  rotas.get('/documentos', seguro(documentos.listar))
  rotas.post('/documentos', autenticar, seguro(documentos.criar))
  rotas.get('/documentos/:id', seguro(documentos.buscar))
  rotas.put('/documentos/:id', autenticar, seguro(documentos.atualizar))
  rotas.patch('/documentos/:id/status', autenticar, seguro(documentos.mudarStatus))
  rotas.delete('/documentos/:id', autenticar, seguro(documentos.remover))

  return rotas
}
