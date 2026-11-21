// Lê e valida as variáveis de ambiente. Se faltar alguma, o servidor nem sobe,
// com uma mensagem dizendo qual é.
const OBRIGATORIAS = ['DATABASE_URL', 'SUPABASE_URL', 'SUPABASE_ANON_KEY']

export function carregarEnv(origem = process.env) {
  const faltando = OBRIGATORIAS.filter((nome) => !origem[nome])
  if (faltando.length > 0) {
    throw new Error(`Variáveis de ambiente ausentes: ${faltando.join(', ')}. Veja o arquivo .env.example.`)
  }

  return {
    porta: Number(origem.PORT ?? 3000),
    databaseUrl: origem.DATABASE_URL,
    databaseSsl: origem.DATABASE_SSL !== 'false',
    supabaseUrl: origem.SUPABASE_URL,
    supabaseAnonKey: origem.SUPABASE_ANON_KEY,
    corsOrigins: (origem.CORS_ORIGIN ?? 'http://localhost:5173')
      .split(',')
      .map((endereco) => endereco.trim())
      .filter(Boolean),
  }
}
