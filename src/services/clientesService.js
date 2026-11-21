import api from './api'

export const listar = async () => (await api.get('/clientes')).data

export const criar = async (dados) => (await api.post('/clientes', dados)).data

export const atualizar = async (id, dados) => (await api.put(`/clientes/${id}`, dados)).data

export const remover = async (id) => {
  await api.delete(`/clientes/${id}`)
}
