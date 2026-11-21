import { proibido } from '../errors/AppError.js'

// Regra de propriedade: só o dono do registro pode alterá-lo ou excluí-lo.
export function exigirDono(registro, usuario) {
  if (registro.usuarioId !== usuario.id) throw proibido()
}
