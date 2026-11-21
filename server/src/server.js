import { carregarEnv } from './config/env.js'
import { montarAplicacao } from './container.js'

const env = carregarEnv()
const { app } = montarAplicacao(env)

app.listen(env.porta, () => {
  console.log(`API rodando na porta ${env.porta}`)
  console.log(`Documentação: http://localhost:${env.porta}/api-docs`)
})
