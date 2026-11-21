import { naoAutenticado } from '../errors/AppError.js'

// Cria o middleware que protege uma rota. Ele lê "Authorization: Bearer <token>",
// confere o token com `verificarToken` e coloca o usuário em req.usuario.
// Sem token ou com token inválido, responde 401 e a rota nem é executada.
export function criarAutenticar(verificarToken) {
  return async function autenticar(req, res, next) {
    try {
      const [tipo, token] = (req.headers.authorization ?? '').split(' ')
      if (tipo !== 'Bearer' || !token) throw naoAutenticado()

      const usuario = await verificarToken(token)
      if (!usuario) throw naoAutenticado('Token inválido ou expirado.')

      req.usuario = usuario
      next()
    } catch (erro) {
      next(erro)
    }
  }
}

// Verificador que usa o Supabase Auth: ele valida a assinatura e a validade
// do token e devolve o usuário dono dele.
export function verificadorSupabase(supabase) {
  return async function verificar(token) {
    const { data, error } = await supabase.auth.getUser(token)
    if (error || !data?.user) return null
    return { id: data.user.id, email: data.user.email }
  }
}
