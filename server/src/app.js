import express from 'express'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import { openapi } from './docs/openapi.js'
import { criarRotas } from './routes/index.js'
import { rotaNaoEncontrada, tratarErros } from './middlewares/errorHandler.js'

// Monta o aplicativo Express. Recebe tudo de que precisa por parâmetro,
// então o mesmo código serve para produção e para testes.
export function criarApp({ clientesController, documentosController, autenticar, corsOrigins = [], verificarBanco }) {
  const app = express()

  app.use(cors({ origin: corsOrigins.length > 0 ? corsOrigins : '*' }))
  app.use(express.json())

  app.get('/', (req, res) => {
    res.json({ api: 'Contábil Organizado', documentacao: '/api-docs' })
  })

  app.get('/health', async (req, res) => {
    try {
      if (verificarBanco) await verificarBanco()
      res.json({ status: 'ok' })
    } catch {
      res.status(503).json({ status: 'erro', mensagem: 'Banco de dados indisponível.' })
    }
  })

  // Documentação Swagger (interface) e JSON da especificação
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapi, { customSiteTitle: 'Contábil Organizado – API' }))
  app.get('/api-docs.json', (req, res) => res.json(openapi))

  app.use('/api', criarRotas({ clientesController, documentosController, autenticar }))

  app.use(rotaNaoEncontrada)
  app.use(tratarErros)

  return app
}
