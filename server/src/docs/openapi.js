import { STATUS_DOCUMENTO, TIPOS_DOCUMENTO } from '../domain/constantes.js'

// Especificação OpenAPI 3 da API. É servida em /api-docs (interface Swagger UI)
// e em /api-docs.json (o JSON puro). Usa componentes reutilizáveis ($ref).

const ref = (nome) => ({ $ref: `#/components/schemas/${nome}` })
const resposta = (nome) => ({ $ref: `#/components/responses/${nome}` })
const conteudoJson = (schema) => ({ 'application/json': { schema } })
const idNaRota = { $ref: '#/components/parameters/Id' }
const exigeLogin = [{ bearerAuth: [] }]

const exemploErro = (mensagem) => ({ mensagem, erros: [] })

export const openapi = {
  openapi: '3.0.3',
  info: {
    title: 'Contábil Organizado – API',
    version: '1.0.0',
    description:
      'API para organizar documentos contábeis por cliente.\n\n' +
      '**Leitura (GET)** é pública. **Escrita (POST, PUT, PATCH, DELETE)** exige login: envie o token do Supabase Auth ' +
      'no cabeçalho `Authorization: Bearer <token>` (botão **Authorize**). ' +
      'Só o **dono** de um registro pode alterá-lo ou excluí-lo.',
    license: { name: 'MIT', url: 'https://opensource.org/licenses/MIT' },
  },
  servers: [{ url: '/', description: 'Servidor atual' }],
  tags: [
    { name: 'Saúde', description: 'Verificação de funcionamento' },
    { name: 'Clientes', description: 'Clientes do escritório (lado "1" do relacionamento)' },
    { name: 'Documentos', description: 'Documentos contábeis de cada cliente (lado "N")' },
  ],

  paths: {
    '/health': {
      get: {
        tags: ['Saúde'],
        summary: 'Verifica se a API e o banco de dados estão no ar',
        responses: {
          200: {
            description: 'API e banco funcionando',
            content: conteudoJson({ type: 'object', properties: { status: { type: 'string', example: 'ok' } } }),
          },
          503: { description: 'Banco de dados indisponível' },
        },
      },
    },

    '/api/clientes': {
      get: {
        tags: ['Clientes'],
        summary: 'Lista todos os clientes',
        responses: {
          200: { description: 'Lista de clientes', content: conteudoJson({ type: 'array', items: ref('Cliente') }) },
        },
      },
      post: {
        tags: ['Clientes'],
        summary: 'Cadastra um cliente',
        security: exigeLogin,
        requestBody: { required: true, content: conteudoJson(ref('ClienteEntrada')) },
        responses: {
          201: { description: 'Cliente criado', content: conteudoJson(ref('Cliente')) },
          400: resposta('Invalido'),
          401: resposta('NaoAutenticado'),
          409: resposta('Conflito'),
        },
      },
    },

    '/api/clientes/{id}': {
      parameters: [idNaRota],
      get: {
        tags: ['Clientes'],
        summary: 'Busca um cliente pelo id',
        responses: {
          200: { description: 'Cliente encontrado', content: conteudoJson(ref('Cliente')) },
          400: resposta('Invalido'),
          404: resposta('NaoEncontrado'),
        },
      },
      put: {
        tags: ['Clientes'],
        summary: 'Atualiza um cliente (somente o dono)',
        security: exigeLogin,
        requestBody: { required: true, content: conteudoJson(ref('ClienteEntrada')) },
        responses: {
          200: { description: 'Cliente atualizado', content: conteudoJson(ref('Cliente')) },
          400: resposta('Invalido'),
          401: resposta('NaoAutenticado'),
          403: resposta('Proibido'),
          404: resposta('NaoEncontrado'),
          409: resposta('Conflito'),
        },
      },
      delete: {
        tags: ['Clientes'],
        summary: 'Exclui um cliente (somente o dono, e só se não tiver documentos)',
        security: exigeLogin,
        responses: {
          204: { description: 'Cliente excluído' },
          400: resposta('Invalido'),
          401: resposta('NaoAutenticado'),
          403: resposta('Proibido'),
          404: resposta('NaoEncontrado'),
          409: resposta('Conflito'),
        },
      },
    },

    '/api/clientes/{id}/documentos': {
      parameters: [idNaRota],
      get: {
        tags: ['Clientes', 'Documentos'],
        summary: 'Lista os documentos de um cliente',
        responses: {
          200: { description: 'Documentos do cliente', content: conteudoJson({ type: 'array', items: ref('Documento') }) },
          400: resposta('Invalido'),
          404: resposta('NaoEncontrado'),
        },
      },
    },

    '/api/documentos': {
      get: {
        tags: ['Documentos'],
        summary: 'Lista os documentos, com filtros opcionais',
        parameters: [
          {
            name: 'clienteId',
            in: 'query',
            description: 'Mostra só os documentos deste cliente',
            schema: { type: 'integer', minimum: 1 },
          },
          {
            name: 'status',
            in: 'query',
            description: 'Mostra só os documentos com este status',
            schema: { $ref: '#/components/schemas/StatusDocumento' },
          },
        ],
        responses: {
          200: { description: 'Lista de documentos', content: conteudoJson({ type: 'array', items: ref('Documento') }) },
          400: resposta('Invalido'),
        },
      },
      post: {
        tags: ['Documentos'],
        summary: 'Cadastra um documento (entra sempre como pendente)',
        security: exigeLogin,
        requestBody: { required: true, content: conteudoJson(ref('DocumentoEntrada')) },
        responses: {
          201: { description: 'Documento criado', content: conteudoJson(ref('Documento')) },
          400: resposta('Invalido'),
          401: resposta('NaoAutenticado'),
          403: resposta('Proibido'),
          409: resposta('Conflito'),
        },
      },
    },

    '/api/documentos/{id}': {
      parameters: [idNaRota],
      get: {
        tags: ['Documentos'],
        summary: 'Busca um documento pelo id',
        responses: {
          200: { description: 'Documento encontrado', content: conteudoJson(ref('Documento')) },
          400: resposta('Invalido'),
          404: resposta('NaoEncontrado'),
        },
      },
      put: {
        tags: ['Documentos'],
        summary: 'Atualiza um documento (somente o dono)',
        security: exigeLogin,
        requestBody: { required: true, content: conteudoJson(ref('DocumentoEntrada')) },
        responses: {
          200: { description: 'Documento atualizado', content: conteudoJson(ref('Documento')) },
          400: resposta('Invalido'),
          401: resposta('NaoAutenticado'),
          403: resposta('Proibido'),
          404: resposta('NaoEncontrado'),
          409: resposta('Conflito'),
        },
      },
      delete: {
        tags: ['Documentos'],
        summary: 'Exclui um documento (somente o dono)',
        security: exigeLogin,
        responses: {
          204: { description: 'Documento excluído' },
          400: resposta('Invalido'),
          401: resposta('NaoAutenticado'),
          403: resposta('Proibido'),
          404: resposta('NaoEncontrado'),
        },
      },
    },

    '/api/documentos/{id}/status': {
      parameters: [idNaRota],
      patch: {
        tags: ['Documentos'],
        summary: 'Altera só o status de um documento (somente o dono)',
        security: exigeLogin,
        requestBody: { required: true, content: conteudoJson(ref('StatusEntrada')) },
        responses: {
          200: { description: 'Status atualizado', content: conteudoJson(ref('Documento')) },
          400: resposta('Invalido'),
          401: resposta('NaoAutenticado'),
          403: resposta('Proibido'),
          404: resposta('NaoEncontrado'),
        },
      },
    },
  },

  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token de acesso (access_token) emitido pelo Supabase Auth após o login.',
      },
    },

    parameters: {
      Id: {
        name: 'id',
        in: 'path',
        required: true,
        description: 'Identificador do registro',
        schema: { type: 'integer', minimum: 1, example: 1 },
      },
    },

    schemas: {
      StatusDocumento: { type: 'string', enum: STATUS_DOCUMENTO, example: 'pendente' },

      Cliente: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          nome: { type: 'string', example: 'Padaria Pão Quente Ltda' },
          documentoFiscal: { type: 'string', nullable: true, example: '12.345.678/0001-90' },
          email: { type: 'string', nullable: true, example: 'contato@paoquente.com.br' },
          usuarioId: { type: 'string', format: 'uuid', description: 'Dono do registro' },
          criadoEm: { type: 'string', format: 'date-time' },
          totalDocumentos: { type: 'integer', description: 'Quantidade de documentos do cliente', example: 3 },
        },
      },
      ClienteEntrada: {
        type: 'object',
        required: ['nome'],
        properties: {
          nome: { type: 'string', minLength: 2, maxLength: 120, example: 'Padaria Pão Quente Ltda' },
          documentoFiscal: { type: 'string', nullable: true, description: 'CPF ou CNPJ', example: '12.345.678/0001-90' },
          email: { type: 'string', format: 'email', nullable: true, example: 'contato@paoquente.com.br' },
        },
      },

      Documento: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          clienteId: { type: 'integer', description: 'Chave estrangeira para o cliente', example: 1 },
          cliente: { type: 'string', description: 'Nome do cliente', example: 'Padaria Pão Quente Ltda' },
          tipo: { type: 'string', enum: TIPOS_DOCUMENTO },
          numero: { type: 'string', example: 'NF-e 001542' },
          competencia: { type: 'string', pattern: '^\\d{4}-(0[1-9]|1[0-2])$', example: '2026-10' },
          data: { type: 'string', format: 'date', example: '2026-10-05' },
          vencimento: { type: 'string', format: 'date', nullable: true, example: '2026-11-20' },
          valor: { type: 'number', nullable: true, example: 4850.9 },
          status: ref('StatusDocumento'),
          observacoes: { type: 'string', example: 'Falta conferir CFOP.' },
          usuarioId: { type: 'string', format: 'uuid', description: 'Dono do registro' },
          criadoEm: { type: 'string', format: 'date-time' },
        },
      },
      DocumentoEntrada: {
        type: 'object',
        required: ['clienteId', 'tipo', 'numero', 'competencia', 'data'],
        properties: {
          clienteId: { type: 'integer', minimum: 1, example: 1 },
          tipo: { type: 'string', enum: TIPOS_DOCUMENTO },
          numero: { type: 'string', maxLength: 60, example: 'NF-e 001542' },
          competencia: { type: 'string', pattern: '^\\d{4}-(0[1-9]|1[0-2])$', example: '2026-10' },
          data: { type: 'string', format: 'date', example: '2026-10-05' },
          vencimento: { type: 'string', format: 'date', nullable: true, description: 'Opcional', example: '2026-11-20' },
          valor: { type: 'number', exclusiveMinimum: 0, nullable: true, description: 'Opcional', example: 4850.9 },
          observacoes: { type: 'string', example: '' },
          status: {
            ...ref('StatusDocumento'),
            description: 'Só é considerado na atualização (PUT). Na criação, o documento entra como pendente.',
          },
        },
      },
      StatusEntrada: {
        type: 'object',
        required: ['status'],
        properties: { status: ref('StatusDocumento') },
      },

      Erro: {
        type: 'object',
        properties: {
          mensagem: { type: 'string', example: 'Dados inválidos: número é obrigatório.' },
          erros: { type: 'array', items: { type: 'string' }, example: ['número é obrigatório'] },
        },
      },
    },

    responses: {
      Invalido: {
        description: 'Dados da requisição inválidos',
        content: { 'application/json': { schema: ref('Erro'), example: { mensagem: 'Dados inválidos: número é obrigatório.', erros: ['número é obrigatório'] } } },
      },
      NaoAutenticado: {
        description: 'Token ausente, inválido ou expirado',
        content: { 'application/json': { schema: ref('Erro'), example: exemploErro('Autenticação necessária. Envie o token no cabeçalho Authorization.') } },
      },
      Proibido: {
        description: 'Usuário logado, mas sem permissão (não é o dono do registro)',
        content: { 'application/json': { schema: ref('Erro'), example: exemploErro('Você não tem permissão para alterar este recurso.') } },
      },
      NaoEncontrado: {
        description: 'Registro não encontrado',
        content: { 'application/json': { schema: ref('Erro'), example: exemploErro('Documento não encontrado.') } },
      },
      Conflito: {
        description: 'Conflito com os dados existentes (duplicado ou registros relacionados)',
        content: { 'application/json': { schema: ref('Erro'), example: exemploErro('Já existe um registro com esses dados.') } },
      },
    },
  },
}
