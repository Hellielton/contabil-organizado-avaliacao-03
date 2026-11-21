import api from './api'

// Funções que falam com a API. Só devolvem os dados (response.data);
// quem guarda estado e trata erro é a store.

export const listar = async () => (await api.get('/documentos')).data

export const criar = async (dados) => (await api.post('/documentos', dados)).data

export const atualizar = async (id, dados) => (await api.put(`/documentos/${id}`, dados)).data

export const mudarStatus = async (id, status) => (await api.patch(`/documentos/${id}/status`, { status })).data

export const remover = async (id) => {
  await api.delete(`/documentos/${id}`)
}
