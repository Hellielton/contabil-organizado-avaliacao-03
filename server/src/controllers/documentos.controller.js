// Camada HTTP: lê a requisição, chama o serviço e monta a resposta.
export function criarDocumentosController(service) {
  return {
    listar: async (req, res) => {
      res.json(await service.listar(req.query))
    },
    listarPorCliente: async (req, res) => {
      res.json(await service.listarPorCliente(req.params.id))
    },
    buscar: async (req, res) => {
      res.json(await service.buscar(req.params.id))
    },
    criar: async (req, res) => {
      res.status(201).json(await service.criar(req.body, req.usuario))
    },
    atualizar: async (req, res) => {
      res.json(await service.atualizar(req.params.id, req.body, req.usuario))
    },
    mudarStatus: async (req, res) => {
      res.json(await service.mudarStatus(req.params.id, req.body, req.usuario))
    },
    remover: async (req, res) => {
      await service.remover(req.params.id, req.usuario)
      res.status(204).end()
    },
  }
}
