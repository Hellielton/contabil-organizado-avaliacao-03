// O Express 4 não captura erros de funções async sozinho. Este envoltório
// repassa qualquer erro para o middleware de tratamento (next).
export const asyncHandler = (funcao) => (req, res, next) =>
  Promise.resolve(funcao(req, res, next)).catch(next)
