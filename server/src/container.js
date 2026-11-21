import { criarApp } from './app.js'
import { criarPool } from './config/database.js'
import { criarClienteSupabase } from './config/supabase.js'
import { criarClientesController } from './controllers/clientes.controller.js'
import { criarDocumentosController } from './controllers/documentos.controller.js'
import { criarAutenticar, verificadorSupabase } from './middlewares/autenticar.js'
import { criarClientesRepository } from './repositories/clientes.repository.js'
import { criarDocumentosRepository } from './repositories/documentos.repository.js'
import { criarClientesService } from './services/clientes.service.js'
import { criarDocumentosService } from './services/documentos.service.js'

// Ponto único onde as camadas são ligadas umas às outras:
//   rotas -> controllers -> services -> repositories -> banco
export function montarAplicacao(env) {
  const pool = criarPool(env)
  const supabase = criarClienteSupabase(env)

  const clientesRepo = criarClientesRepository(pool)
  const documentosRepo = criarDocumentosRepository(pool)

  const clientesService = criarClientesService({ clientesRepo })
  const documentosService = criarDocumentosService({ documentosRepo, clientesRepo })

  const app = criarApp({
    clientesController: criarClientesController(clientesService),
    documentosController: criarDocumentosController(documentosService),
    autenticar: criarAutenticar(verificadorSupabase(supabase)),
    corsOrigins: env.corsOrigins,
    verificarBanco: () => pool.query('select 1'),
  })

  return { app, pool }
}
